import { error, fail } from '@sveltejs/kit';
import type { Actions, ServerLoad } from '@sveltejs/kit';

import {
	getEventBySlug,
	getRankedAvailabilityForEvent,
	saveParticipantAvailability
} from '$lib/server/database';

const ADMIN_LINK_COOKIE = 'omoikane-created-admin-link';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AvailabilityFormValues = {
	name: string;
	email: string;
	selectedDates: string;
};

function readValues(formData: FormData): AvailabilityFormValues {
	return {
		name: String(formData.get('name') ?? '').trim(),
		email: String(formData.get('email') ?? '').trim().toLowerCase(),
		selectedDates: String(formData.get('selectedDates') ?? '[]')
	};
}

function parseSelectedDates(rawValue: string) {
	try {
		const parsed = JSON.parse(rawValue) as unknown;

		if (!Array.isArray(parsed)) {
			return null;
		}

		const uniqueDates = new Set<string>();

		for (const value of parsed) {
			if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
				return null;
			}

			uniqueDates.add(value);
		}

		return [...uniqueDates].sort();
	} catch {
		return null;
	}
}

function validateValues(
	values: AvailabilityFormValues,
	event: { start_date: string; end_date: string; is_closed: number }
) {
	const errors: Partial<Record<keyof AvailabilityFormValues, string>> = {};
	const selectedDates = parseSelectedDates(values.selectedDates);

	if (!values.name) {
		errors.name = 'Enter your name.';
	}

	if (!values.email) {
		errors.email = 'Enter your email address.';
	} else if (!EMAIL_PATTERN.test(values.email)) {
		errors.email = 'Enter a valid email address.';
	}

	if (selectedDates === null) {
		errors.selectedDates = 'Choose valid dates before saving.';
	} else if (
		selectedDates.some((date) => date < event.start_date || date > event.end_date)
	) {
		errors.selectedDates = 'Selected dates must stay within the event range.';
	}

	if (event.is_closed) {
		errors.selectedDates = 'This event is closed and no longer accepting responses.';
	}

	return {
		errors,
		selectedDates: selectedDates ?? []
	};
}

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
		createdAdminPath,
		rankedDates: getRankedAvailabilityForEvent(event.id)
	};
};

export const actions: Actions = {
	default: async ({ params, request }) => {
		if (!params.slug) {
			throw error(404, 'Event not found');
		}

		const event = getEventBySlug(params.slug);

		if (!event) {
			throw error(404, 'Event not found');
		}

		const formData = await request.formData();
		const values = readValues(formData);
		const { errors, selectedDates } = validateValues(values, event);

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, values });
		}

		const saved = saveParticipantAvailability({
			eventId: event.id,
			name: values.name,
			email: values.email,
			selectedDates
		});

		return {
			success: true,
			message: 'Availability saved. Re-submit with the same email any time to update it.',
			values: {
				name: saved.participant.name,
				email: saved.participant.email,
				selectedDates: JSON.stringify(saved.selectedDates)
			}
		};
	}
};
