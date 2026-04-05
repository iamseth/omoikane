import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getEventBySlug, randomBytesMock } = vi.hoisted(() => ({
	getEventBySlug: vi.fn(),
	randomBytesMock: vi.fn()
}));

vi.mock('node:crypto', async () => {
	const actual = await vi.importActual<typeof import('node:crypto')>('node:crypto');

	return {
		...actual,
		randomBytes: randomBytesMock
	};
});

vi.mock('$lib/server/database', () => ({
	getEventBySlug
}));

import { generateAdminToken, generateEventSlug, hashAdminToken } from './event-identity';

	describe('event identity', () => {
	beforeEach(() => {
		getEventBySlug.mockReset();
		randomBytesMock.mockReset();
		randomBytesMock.mockImplementation((size: number) => Buffer.alloc(size, 0));
	});

	it('hashes admin tokens deterministically', () => {
		expect(hashAdminToken('secret-token')).toBe(
			'930bbdc51b6aed5c2a5678fd6e28dee7a05e8a4b643cfc0b4427c3efb86c0d94'
		);
	});

	it('generates url-safe admin tokens', () => {
		randomBytesMock.mockReturnValue(Buffer.alloc(24, 1));

		const token = generateAdminToken();

		expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
		expect(token.length).toBeGreaterThan(20);
	});

	it('generates an unused event slug', () => {
		getEventBySlug.mockReturnValue(undefined);

		expect(generateEventSlug()).toBe('aaaaaaaa');
		expect(getEventBySlug).toHaveBeenCalledWith('aaaaaaaa');
	});

	it('throws after repeated slug collisions', () => {
		getEventBySlug.mockReturnValue({ id: 1 });

		expect(() => generateEventSlug()).toThrow('Unable to generate a unique event slug');
		expect(getEventBySlug).toHaveBeenCalledTimes(10);
	});
});
