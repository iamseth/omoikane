import type { PageServerLoad } from './$types';

import { getDatabasePath, getEventCount, initDatabase } from '$lib/server/database';

export const load: PageServerLoad = async () => {
	initDatabase();

	return {
		databasePath: getDatabasePath(),
		eventCount: getEventCount()
	};
};
