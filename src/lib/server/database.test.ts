import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

type DatabaseModule = typeof import('./database');

const temporaryDirectories: string[] = [];

async function loadDatabaseModule() {
	vi.resetModules();

	const directory = mkdtempSync(join(tmpdir(), 'omoikane-db-'));
	const databasePath = join(directory, 'omoikane.sqlite');
	temporaryDirectories.push(directory);
	process.env.DATABASE_PATH = databasePath;

	const module = (await import('./database')) as DatabaseModule;

	return {
		databasePath,
		module
	};
}

afterEach(() => {
	delete process.env.DATABASE_PATH;

	for (const directory of temporaryDirectories.splice(0)) {
		rmSync(directory, { force: true, recursive: true });
	}
	vi.restoreAllMocks();
});

describe('database', () => {
	it('initializes a sqlite database at the configured path', async () => {
		const { databasePath, module } = await loadDatabaseModule();

		const db = module.initDatabase();

		expect(module.getDatabasePath()).toBe(databasePath);
		expect(existsSync(databasePath)).toBe(true);
		expect(db.prepare("select name from sqlite_master where type = 'table' and name = 'events'").get()).toBeTruthy();
	});

	it('creates and retrieves events through each lookup path', async () => {
		const { module } = await loadDatabaseModule();

		const event = module.createEvent({
			slug: 'spring-planning',
			adminTokenHash: 'hashed-token',
			title: 'Spring Planning',
			description: 'Choose a date',
			timezone: 'UTC',
			startDate: '2026-04-05',
			endDate: '2026-04-18'
		});

		expect(event?.slug).toBe('spring-planning');
		expect(module.getEventCount()).toBe(1);
		expect(module.getEventById(event!.id)?.title).toBe('Spring Planning');
		expect(module.getEventBySlug('spring-planning')?.id).toBe(event!.id);
		expect(module.getEventByAdminTokenHash('hashed-token')?.id).toBe(event!.id);
		expect(module.getEventBySlug('missing')).toBeUndefined();
	});

	it('saves participant availability and replaces prior selections on update', async () => {
		const { module } = await loadDatabaseModule();
		const event = module.createEvent({
			slug: 'team-sync',
			adminTokenHash: 'team-token',
			title: 'Team Sync',
			timezone: 'UTC',
			startDate: '2026-04-05',
			endDate: '2026-04-18'
		});

		const firstSave = module.saveParticipantAvailability({
			eventId: event!.id,
			name: 'Taylor',
			email: 'taylor@example.com',
			selectedDates: ['2026-04-10', '2026-04-05']
		});

		expect(firstSave.selectedDates).toEqual(['2026-04-05', '2026-04-10']);

		const secondSave = module.saveParticipantAvailability({
			eventId: event!.id,
			name: 'Taylor Updated',
			email: 'taylor@example.com',
			selectedDates: ['2026-04-12']
		});

		const db = module.initDatabase();
		const participants = db
			.prepare('select id, name, email from participants where event_id = ? order by id')
			.all(event!.id) as Array<{ id: number; name: string; email: string }>;
		const availability = db
			.prepare('select date from availability where event_id = ? order by date')
			.all(event!.id) as Array<{ date: string }>;

		expect(participants).toEqual([
			{
				id: secondSave.participant.id,
				name: 'Taylor Updated',
				email: 'taylor@example.com'
			}
		]);
		expect(availability).toEqual([{ date: '2026-04-12' }]);
		expect(secondSave.selectedDates).toEqual(['2026-04-12']);
	});
});
