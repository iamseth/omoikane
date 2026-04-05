import { error } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';

import { getEventByAdminTokenHash } from '$lib/server/database';
import { hashAdminToken } from '$lib/server/event-identity';

export const load: ServerLoad = async ({ params }) => {
	if (!params.token) {
		throw error(404, 'Admin link not found');
	}

	const event = getEventByAdminTokenHash(hashAdminToken(params.token));

	if (!event) {
		throw error(404, 'Admin link not found');
	}

	return {
		event
	};
};
