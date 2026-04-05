import type { Handle } from '@sveltejs/kit';

import { initDatabase } from '$lib/server/database';

let didInitialize = false;

export const handle: Handle = async ({ event, resolve }) => {
	if (!didInitialize) {
		initDatabase();
		didInitialize = true;
	}

	return resolve(event);
};
