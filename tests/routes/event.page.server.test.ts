import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getEventBySlug, saveParticipantAvailability } = vi.hoisted(() => ({
	getEventBySlug: vi.fn(),
	saveParticipantAvailability: vi.fn()
}));

vi.mock('$lib/server/database', () => ({
	getEventBySlug,
	saveParticipantAvailability
}));

import { actions, load } from '../../src/routes/e/[slug]/+page.server';

describe('public event page server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns 404 when the slug is missing or unknown', async () => {
		await expect(
			load({ cookies: { get: vi.fn(), delete: vi.fn() }, params: {} } as never)
		).rejects.toMatchObject({ status: 404, body: { message: 'Event not found' } });

		getEventBySlug.mockReturnValue(undefined);

		await expect(
			load({ cookies: { get: vi.fn(), delete: vi.fn() }, params: { slug: 'missing' } } as never)
		).rejects.toMatchObject({ status: 404, body: { message: 'Event not found' } });
	});

	it('returns the event and consumes a matching admin flash cookie', async () => {
		const event = { id: 1, slug: 'planning', timezone: 'UTC' };
		const cookies = {
			get: vi.fn().mockReturnValue(JSON.stringify({ slug: 'planning', adminPath: '/admin/token' })),
			delete: vi.fn()
		};
		getEventBySlug.mockReturnValue(event);

		const result = await load({ cookies, params: { slug: 'planning' } } as never);

		expect(result).toEqual({ event, createdAdminPath: '/admin/token' });
		expect(cookies.delete).toHaveBeenCalledWith('omoikane-created-admin-link', { path: '/' });
	});

	it('ignores malformed admin flash cookies', async () => {
		const event = { id: 1, slug: 'planning', timezone: 'UTC' };
		const cookies = {
			get: vi.fn().mockReturnValue('{bad-json'),
			delete: vi.fn()
		};
		getEventBySlug.mockReturnValue(event);

		const result = await load({ cookies, params: { slug: 'planning' } } as never);

		expect(result).toEqual({ event, createdAdminPath: null });
	});

	it('returns validation errors for invalid attendee submissions', async () => {
		getEventBySlug.mockReturnValue({
			id: 1,
			slug: 'planning',
			start_date: '2026-04-05',
			end_date: '2026-04-18',
			is_closed: 0
		});

		const formData = new FormData();
		formData.set('name', '');
		formData.set('email', 'not-an-email');
		formData.set('selectedDates', '["2026-04-30"]');

		const result = (await actions.default({
			params: { slug: 'planning' },
			request: new Request('http://localhost/e/planning', { method: 'POST', body: formData })
		} as never)) as { status: number; data: { errors: Record<string, string> } };

		expect(result.status).toBe(400);
		expect(result.data.errors).toEqual({
			name: 'Enter your name.',
			email: 'Enter a valid email address.',
			selectedDates: 'Selected dates must stay within the event range.'
		});
		expect(saveParticipantAvailability).not.toHaveBeenCalled();
	});

	it('rejects malformed date payloads and missing email addresses', async () => {
		getEventBySlug.mockReturnValue({
			id: 1,
			slug: 'planning',
			start_date: '2026-04-05',
			end_date: '2026-04-18',
			is_closed: 0
		});

		const formData = new FormData();
		formData.set('name', 'Taylor');
		formData.set('email', '');
		formData.set('selectedDates', '{"bad":true}');

		const result = (await actions.default({
			params: { slug: 'planning' },
			request: new Request('http://localhost/e/planning', { method: 'POST', body: formData })
		} as never)) as { status: number; data: { errors: Record<string, string> } };

		expect(result.status).toBe(400);
		expect(result.data.errors).toEqual({
			email: 'Enter your email address.',
			selectedDates: 'Choose valid dates before saving.'
		});
	});

	it('returns 404 when saving without a slug or with an unknown event', async () => {
		const formData = new FormData();

		await expect(
			actions.default({
				params: {},
				request: new Request('http://localhost/e/missing', { method: 'POST', body: formData })
			} as never)
		).rejects.toMatchObject({ status: 404, body: { message: 'Event not found' } });

		getEventBySlug.mockReturnValue(undefined);

		await expect(
			actions.default({
				params: { slug: 'missing' },
				request: new Request('http://localhost/e/missing', { method: 'POST', body: formData })
			} as never)
		).rejects.toMatchObject({ status: 404, body: { message: 'Event not found' } });
	});

	it('blocks submissions for closed events', async () => {
		getEventBySlug.mockReturnValue({
			id: 1,
			slug: 'planning',
			start_date: '2026-04-05',
			end_date: '2026-04-18',
			is_closed: 1
		});

		const formData = new FormData();
		formData.set('name', 'Taylor');
		formData.set('email', 'taylor@example.com');
		formData.set('selectedDates', '["2026-04-10"]');

		const result = (await actions.default({
			params: { slug: 'planning' },
			request: new Request('http://localhost/e/planning', { method: 'POST', body: formData })
		} as never)) as { status: number; data: { errors: Record<string, string> } };

		expect(result.status).toBe(400);
		expect(result.data.errors.selectedDates).toBe(
			'This event is closed and no longer accepting responses.'
		);
	});

	it('saves attendee availability when the submission is valid', async () => {
		getEventBySlug.mockReturnValue({
			id: 7,
			slug: 'planning',
			start_date: '2026-04-05',
			end_date: '2026-04-18',
			is_closed: 0
		});
		saveParticipantAvailability.mockReturnValue({
			participant: { name: 'Taylor', email: 'taylor@example.com' },
			selectedDates: ['2026-04-10', '2026-04-12']
		});

		const formData = new FormData();
		formData.set('name', ' Taylor ');
		formData.set('email', 'TAYLOR@EXAMPLE.COM');
		formData.set('selectedDates', '["2026-04-12","2026-04-10","2026-04-10"]');

		const result = await actions.default({
			params: { slug: 'planning' },
			request: new Request('http://localhost/e/planning', { method: 'POST', body: formData })
		} as never);

		expect(saveParticipantAvailability).toHaveBeenCalledWith({
			eventId: 7,
			name: 'Taylor',
			email: 'taylor@example.com',
			selectedDates: ['2026-04-10', '2026-04-12']
		});
		expect(result).toEqual({
			success: true,
			message: 'Availability saved. Re-submit with the same email any time to update it.',
			values: {
				name: 'Taylor',
				email: 'taylor@example.com',
				selectedDates: '["2026-04-10","2026-04-12"]'
			}
		});
	});
});
