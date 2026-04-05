import { error, fail } from '@sveltejs/kit';
import type { Actions, ServerLoad } from '@sveltejs/kit';

import { getEventByAdminTokenHash, updateEvent } from '$lib/server/database';
import { hashAdminToken } from '$lib/server/event-identity';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type EventFormValues = {
	title: string;
	description: string;
	timezone: string;
	startDate: string;
	endDate: string;
};

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
	}

	if (!DATE_PATTERN.test(values.startDate)) {
		errors.startDate = 'Choose a start date.';
	}

	if (!DATE_PATTERN.test(values.endDate)) {
		errors.endDate = 'Choose an end date.';
	}

	if (!errors.startDate && !errors.endDate && values.startDate > values.endDate) {
		errors.endDate = 'End date must be on or after the start date.';
	}

	return errors;
}

function getEventOr404(token: string) {
	const event = getEventByAdminTokenHash(hashAdminToken(token));

	if (!event) {
		throw error(404, 'Admin link not found');
	}

	return event;
}

export const load: ServerLoad = async ({ params }) => {
	if (!params.token) {
		throw error(404, 'Admin link not found');
	}

	return {
		event: getEventOr404(params.token)
	};
};

export const actions: Actions = {
	save: async ({ params, request }) => {
		if (!params.token) {
			throw error(404, 'Admin link not found');
		}

		const event = getEventOr404(params.token);
		const formData = await request.formData();
		const values = readValues(formData);
		const errors = validateValues(values);

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, values });
		}

		updateEvent({
			eventId: event.id,
			title: values.title,
			description: values.description || null,
			timezone: values.timezone,
			startDate: values.startDate,
			endDate: values.endDate,
			isClosed: Boolean(event.is_closed)
		});

		return {
			success: true,
			message: 'Event details saved.',
			values
		};
	},
	toggleStatus: async ({ params }) => {
		if (!params.token) {
			throw error(404, 'Admin link not found');
		}

		const event = getEventOr404(params.token);
		const isClosing = !event.is_closed;

		updateEvent({
			eventId: event.id,
			title: event.title,
			description: event.description,
			timezone: event.timezone,
			startDate: event.start_date,
			endDate: event.end_date,
			isClosed: isClosing
		});

		return {
			success: true,
			message: isClosing
				? 'Event closed. Existing responses remain visible on the public page.'
				: 'Event reopened. New responses are allowed again.'
		};
	}
};
