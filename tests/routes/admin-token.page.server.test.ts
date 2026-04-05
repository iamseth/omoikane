import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getEventByAdminTokenHash, getParticipantResponsesForEvent, getRankedAvailabilityForEvent, hashAdminToken, updateEvent } = vi.hoisted(() => ({
	getEventByAdminTokenHash: vi.fn(),
	getParticipantResponsesForEvent: vi.fn(),
	getRankedAvailabilityForEvent: vi.fn(),
	hashAdminToken: vi.fn(),
	updateEvent: vi.fn()
}));

vi.mock('$lib/server/database', () => ({
	getEventByAdminTokenHash,
	getParticipantResponsesForEvent,
	getRankedAvailabilityForEvent,
	updateEvent
}));

vi.mock('$lib/server/event-identity', () => ({
	hashAdminToken
}));

import { actions, load } from '../../src/routes/admin/[token]/+page.server';

describe('admin event page server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		hashAdminToken.mockReturnValue('hashed-token');
		getRankedAvailabilityForEvent.mockReturnValue([]);
		getParticipantResponsesForEvent.mockReturnValue([]);
	});

	it('requires an admin token', async () => {
		await expect(load({ params: {} } as never)).rejects.toMatchObject({
			status: 404,
			body: { message: 'Admin link not found' }
		});
	});

	it('returns 404 for an unknown admin token', async () => {
		getEventByAdminTokenHash.mockReturnValue(undefined);

		await expect(load({ params: { token: 'missing' } } as never)).rejects.toMatchObject({
			status: 404,
			body: { message: 'Admin link not found' }
		});
		expect(hashAdminToken).toHaveBeenCalledWith('missing');
	});

	it('returns the matching event', async () => {
		const event = { id: 1, slug: 'planning' };
		getEventByAdminTokenHash.mockReturnValue(event);

		await expect(load({ params: { token: 'secret' } } as never)).resolves.toEqual({
			event,
			rankedDates: [],
			participantResponses: []
		});
	});

	it('rejects unsupported timezones on save', async () => {
		getEventByAdminTokenHash.mockReturnValue({
			id: 1,
			title: 'Planning',
			description: null,
			timezone: 'UTC',
			start_date: '2026-04-05',
			end_date: '2026-04-18',
			is_closed: 0
		});

		const formData = new FormData();
		formData.set('title', 'Planning');
		formData.set('timezone', 'FakeZone');
		formData.set('startDate', '2026-04-05');
		formData.set('endDate', '2026-04-18');

		const result = (await actions.save({
			params: { token: 'secret' },
			request: new Request('http://localhost/admin/secret', { method: 'POST', body: formData })
		} as never)) as { status: number; data: { errors: Record<string, string> } };

		expect(result.status).toBe(400);
		expect(result.data.errors.timezone).toBe('Choose a valid timezone.');
		expect(updateEvent).not.toHaveBeenCalled();
	});
});
