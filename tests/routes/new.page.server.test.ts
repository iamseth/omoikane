import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createEvent, generateAdminToken, generateEventSlug, hashAdminToken } = vi.hoisted(() => ({
	createEvent: vi.fn(),
	generateAdminToken: vi.fn(),
	generateEventSlug: vi.fn(),
	hashAdminToken: vi.fn()
}));

vi.mock('$lib/server/database', () => ({
	createEvent
}));

vi.mock('$lib/server/event-identity', () => ({
	generateAdminToken,
	generateEventSlug,
	hashAdminToken
}));

import { actions, load } from '../../src/routes/new/+page.server';

describe('new event page server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		generateEventSlug.mockReturnValue('freshslug');
		generateAdminToken.mockReturnValue('admin-token');
		hashAdminToken.mockReturnValue('hashed-admin-token');
	});

	it('returns default form values', async () => {
		const result = (await load({} as never)) as { defaults: Record<string, string> };

		expect(result.defaults.title).toBe('');
		expect(result.defaults.description).toBe('');
		expect(result.defaults.timezone).toBe('UTC');
		expect(result.defaults.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		expect(result.defaults.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});

	it('returns validation errors for invalid submissions', async () => {
		const formData = new FormData();
		formData.set('title', '');
		formData.set('description', '  note  ');
		formData.set('timezone', '');
		formData.set('startDate', 'bad');
		formData.set('endDate', '2026-04-01');

		const result = (await actions.default({
			cookies: { set: vi.fn() },
			request: new Request('http://localhost/new', { method: 'POST', body: formData })
		} as never)) as { status: number; data: { errors: Record<string, string> } };

		expect(result.status).toBe(400);
		expect(result.data.errors).toEqual({
			title: 'Enter an event title.',
			timezone: 'Enter a timezone.',
			startDate: 'Choose a start date.'
		});
		expect(createEvent).not.toHaveBeenCalled();
	});

	it('validates the end date format and date ordering', async () => {
		const badEndDate = new FormData();
		badEndDate.set('title', 'Sprint planning');
		badEndDate.set('timezone', 'UTC');
		badEndDate.set('startDate', '2026-04-05');
		badEndDate.set('endDate', 'bad');

		const badEndDateResult = (await actions.default({
			cookies: { set: vi.fn() },
			request: new Request('http://localhost/new', { method: 'POST', body: badEndDate })
		} as never)) as { status: number; data: { errors: Record<string, string> } };

		expect(badEndDateResult.status).toBe(400);
		expect(badEndDateResult.data.errors.endDate).toBe('Choose an end date.');

		const reversedDates = new FormData();
		reversedDates.set('title', 'Sprint planning');
		reversedDates.set('timezone', 'UTC');
		reversedDates.set('startDate', '2026-04-18');
		reversedDates.set('endDate', '2026-04-05');

		const reversedDatesResult = (await actions.default({
			cookies: { set: vi.fn() },
			request: new Request('http://localhost/new', { method: 'POST', body: reversedDates })
		} as never)) as { status: number; data: { errors: Record<string, string> } };

		expect(reversedDatesResult.status).toBe(400);
		expect(reversedDatesResult.data.errors.endDate).toBe(
			'End date must be on or after the start date.'
		);
	});

	it('creates an event, sets the admin cookie, and redirects', async () => {
		const cookies = { set: vi.fn() };
		const formData = new FormData();
		formData.set('title', ' Sprint planning ');
		formData.set('description', ' Discuss dates ');
		formData.set('timezone', 'UTC');
		formData.set('startDate', '2026-04-05');
		formData.set('endDate', '2026-04-18');

		await expect(
			actions.default({
				cookies,
				request: new Request('http://localhost/new', { method: 'POST', body: formData })
			} as never)
		).rejects.toMatchObject({
			status: 303,
			location: '/e/freshslug'
		});

		expect(hashAdminToken).toHaveBeenCalledWith('admin-token');
		expect(createEvent).toHaveBeenCalledWith({
			slug: 'freshslug',
			adminTokenHash: 'hashed-admin-token',
			title: 'Sprint planning',
			description: 'Discuss dates',
			timezone: 'UTC',
			startDate: '2026-04-05',
			endDate: '2026-04-18'
		});
		expect(cookies.set).toHaveBeenCalledWith(
			'omoikane-created-admin-link',
			JSON.stringify({ slug: 'freshslug', adminPath: '/admin/admin-token' }),
			expect.objectContaining({ path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 })
		);
	});
});
