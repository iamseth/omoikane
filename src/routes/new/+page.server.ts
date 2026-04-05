import { dev } from '$app/environment';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, ServerLoad } from '@sveltejs/kit';

import { createEvent } from '$lib/server/database';
import { generateAdminToken, generateEventSlug, hashAdminToken } from '$lib/server/event-identity';

const ADMIN_LINK_COOKIE = 'omoikane-created-admin-link';
const SUPPORTED_TIMEZONES = new Set(Intl.supportedValuesOf('timeZone'));

function isSupportedTimezone(timezone: string) {
	return timezone === 'UTC' || SUPPORTED_TIMEZONES.has(timezone);
}

type EventFormValues = {
	title: string;
	description: string;
	timezone: string;
	startDate: string;
	endDate: string;
};

function getDefaultDates() {
	const today = new Date();
	const startDate = today.toISOString().slice(0, 10);
	const endDate = new Date(today);
	endDate.setDate(endDate.getDate() + 13);

	return {
		startDate,
		endDate: endDate.toISOString().slice(0, 10)
	};
}

function getDefaultValues(): EventFormValues {
	const { startDate, endDate } = getDefaultDates();

	return {
		title: '',
		description: '',
		timezone: 'UTC',
		startDate,
		endDate
	};
}

function readValues(formData: FormData): EventFormValues {
	return {
		title: String(formData.get('title') ?? '').trim(),
		description: String(formData.get('description') ?? '').trim(),
		timezone: String(formData.get('timezone') ?? '').trim(),
		startDate: String(formData.get('startDate') ?? '').trim(),
		endDate: String(formData.get('endDate') ?? '').trim()
	};
}

function validateValues(values: EventFormValues) {
	const errors: Partial<Record<keyof EventFormValues, string>> = {};

	if (!values.title) {
		errors.title = 'Enter an event title.';
	}

	if (!values.timezone) {
		errors.timezone = 'Enter a timezone.';
	} else if (!isSupportedTimezone(values.timezone)) {
		errors.timezone = 'Choose a valid timezone.';
	}

	if (!/^\d{4}-\d{2}-\d{2}$/.test(values.startDate)) {
		errors.startDate = 'Choose a start date.';
	}

	if (!/^\d{4}-\d{2}-\d{2}$/.test(values.endDate)) {
		errors.endDate = 'Choose an end date.';
	}

	if (!errors.startDate && !errors.endDate && values.startDate > values.endDate) {
		errors.endDate = 'End date must be on or after the start date.';
	}

	return errors;
}

function isSlugConflictError(error: unknown) {
	return (
		error instanceof Error &&
		'code' in error &&
		error.code === 'SQLITE_CONSTRAINT_UNIQUE' &&
		error.message.includes('events.slug')
	);
}

export const load: ServerLoad = async () => {
	return {
		defaults: getDefaultValues()
	};
};

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const formData = await request.formData();
		const values = readValues(formData);
		const errors = validateValues(values);

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, values });
		}

		const adminToken = generateAdminToken();
		const adminTokenHash = hashAdminToken(adminToken);
		let slug = '';

		for (let attempt = 0; attempt < 2; attempt += 1) {
			slug = generateEventSlug();

			try {
				createEvent({
					slug,
					adminTokenHash,
					title: values.title,
					description: values.description || null,
					timezone: values.timezone,
					startDate: values.startDate,
					endDate: values.endDate
				});
				break;
			} catch (error) {
				if (attempt === 1 || !isSlugConflictError(error)) {
					throw error;
				}
			}
		}

		cookies.set(
			ADMIN_LINK_COOKIE,
			JSON.stringify({
				slug,
				adminPath: `/admin/${adminToken}`
			}),
			{
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: !dev,
				maxAge: 60
			}
		);

		throw redirect(303, `/e/${slug}`);
	}
};
