import { error } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';

import { getEventBySlug } from '$lib/server/database';

const ADMIN_LINK_COOKIE = 'omoikane-created-admin-link';

export const load: ServerLoad = async ({ cookies, params }) => {
	if (!params.slug) {
		throw error(404, 'Event not found');
	}

	const event = getEventBySlug(params.slug);

	if (!event) {
		throw error(404, 'Event not found');
	}

	let createdAdminPath: string | null = null;
	const rawCookie = cookies.get(ADMIN_LINK_COOKIE);

	if (rawCookie) {
		try {
			const payload = JSON.parse(rawCookie) as { slug?: string; adminPath?: string };

			if (payload.slug === event.slug && payload.adminPath) {
				createdAdminPath = payload.adminPath;
			}
		} catch {
			// Ignore malformed flash cookie.
		}

		cookies.delete(ADMIN_LINK_COOKIE, { path: '/' });
	}

	return {
		event,
		createdAdminPath
	};
};
