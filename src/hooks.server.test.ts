import { beforeEach, describe, expect, it, vi } from 'vitest';

const initDatabase = vi.fn();

vi.mock('$lib/server/database', () => ({
	initDatabase
}));

describe('server hook', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('initializes the database once and delegates to resolve', async () => {
		vi.resetModules();
		const { handle } = await import('./hooks.server');
		const resolve = vi.fn().mockResolvedValue(new Response('ok'));

		await handle({ event: {} as never, resolve } as never);
		await handle({ event: {} as never, resolve } as never);

		expect(initDatabase).toHaveBeenCalledTimes(1);
		expect(resolve).toHaveBeenCalledTimes(2);
	});
});
