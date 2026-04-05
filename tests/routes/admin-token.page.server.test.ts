import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getEventByAdminTokenHash, hashAdminToken } = vi.hoisted(() => ({
	getEventByAdminTokenHash: vi.fn(),
	hashAdminToken: vi.fn()
}));

vi.mock('$lib/server/database', () => ({
	getEventByAdminTokenHash
}));

vi.mock('$lib/server/event-identity', () => ({
	hashAdminToken
}));

import { load } from '../../src/routes/admin/[token]/+page.server';

describe('admin event page server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		hashAdminToken.mockReturnValue('hashed-token');
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

		await expect(load({ params: { token: 'secret' } } as never)).resolves.toEqual({ event });
	});
});
