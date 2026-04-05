import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getDatabasePath, getEventCount, initDatabase } = vi.hoisted(() => ({
	getDatabasePath: vi.fn(),
	getEventCount: vi.fn(),
	initDatabase: vi.fn()
}));

vi.mock('$lib/server/database', () => ({
	getDatabasePath,
	getEventCount,
	initDatabase
}));

import { load } from '../../src/routes/+page.server';

describe('home page server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		getDatabasePath.mockReturnValue('/tmp/omoikane.sqlite');
		getEventCount.mockReturnValue(3);
	});

	it('initializes the database and returns homepage stats', async () => {
		await expect(load({} as never)).resolves.toEqual({
			databasePath: '/tmp/omoikane.sqlite',
			eventCount: 3
		});
		expect(initDatabase).toHaveBeenCalledTimes(1);
	});
});
