<script lang="ts">
	type EventPageForm = {
		errors?: {
			name?: string;
			email?: string;
			selectedDates?: string;
		};
		message?: string;
		success?: boolean;
		values?: {
			name?: string;
			email?: string;
			selectedDates?: string;
		};
	};

	type EventPageData = {
		event: {
			title: string;
			description: string | null;
			timezone: string;
			start_date: string;
			end_date: string;
			is_closed: number;
		};
		createdAdminPath: string | null;
		rankedDates: Array<{
			date: string;
			attendee_count: number;
		}>;
	};

	type MonthView = {
		year: number;
		monthIndex: number;
	};

	type CalendarCell = {
		date: string;
		day: number;
		inCurrentMonth: boolean;
		isToday: boolean;
		isInEventRange: boolean;
		isSelected: boolean;
	};

	type CalendarStatus = {
		label: string;
		countLabel: string;
	};

	let { data, form }: { data: EventPageData; form?: EventPageForm } = $props();

	const fullDateFormatter = new Intl.DateTimeFormat('en', {
		dateStyle: 'long',
		timeZone: 'UTC'
	});

	const monthLabelFormatter = new Intl.DateTimeFormat('en', {
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	});

	const weekdayFormatter = new Intl.DateTimeFormat('en', {
		weekday: 'short',
		timeZone: 'UTC'
	});

	const weekdayLabels = Array.from({ length: 7 }, (_, index) => {
		return weekdayFormatter.format(new Date(Date.UTC(2024, 0, index + 7)));
	});

	const event = $derived(data.event);
	const createdAdminPath = $derived(data.createdAdminPath);
	const rankedDates = $derived(data.rankedDates);
	const todayKey = $derived(getTodayKey(event.timezone));
	let visibleMonth = $state<MonthView>(getInitialMonth(event.timezone));
	let selectedDates = $state<string[]>(parseSelectedDatesValue(form?.values?.selectedDates));

	$effect(() => {
		selectedDates = parseSelectedDatesValue(form?.values?.selectedDates);
	});

	const monthLabel = $derived(
		monthLabelFormatter.format(new Date(Date.UTC(visibleMonth.year, visibleMonth.monthIndex, 1)))
	);

	const calendarCells = $derived(
		buildCalendarCells(visibleMonth, todayKey, event.start_date, event.end_date, selectedDates)
	);

	const bestDates = $derived(rankedDates.slice(0, 3));
	const selectedDateSummary = $derived([...selectedDates].sort());
	const calendarStatus = $derived(getCalendarStatus(selectedDateSummary));

	function formatDate(value: string) {
		return fullDateFormatter.format(new Date(`${value}T00:00:00Z`));
	}

	function getCalendarStatus(dates: string[]): CalendarStatus {
		if (dates.length === 0) {
			return {
				label: 'No dates selected yet.',
				countLabel: '0 selected dates'
			};
		}

		return {
			label: `${dates.length} ${dates.length === 1 ? 'date is' : 'dates are'} selected: ${dates
				.map((date) => formatDate(date))
				.join(', ')}.`,
			countLabel: `${dates.length} selected ${dates.length === 1 ? 'date' : 'dates'}`
		};
	}

	function parseSelectedDatesValue(value: string | undefined) {
		if (!value) {
			return [];
		}

		try {
			const parsed = JSON.parse(value) as unknown;
			return Array.isArray(parsed)
				? parsed.filter((entry): entry is string => typeof entry === 'string').sort()
				: [];
		} catch {
			return [];
		}
	}

	function toggleDate(date: string) {
		if (event.is_closed) {
			return;
		}

		if (date < event.start_date || date > event.end_date) {
			return;
		}

		selectedDates = selectedDates.includes(date)
			? selectedDates.filter((value) => value !== date)
			: [...selectedDates, date];
	}

	function getDayButtonLabel(cell: CalendarCell) {
		const states = [formatDate(cell.date)];

		if (cell.isToday) {
			states.push('today');
		}

		states.push(cell.isSelected ? 'selected' : 'not selected');

		return states.join(', ');
	}

	function getDatePartsInTimeZone(
		timeZone: string,
		options: Intl.DateTimeFormatOptions
	): Record<string, string> {
		const formatter = new Intl.DateTimeFormat('en', {
			timeZone,
			...options
		});

		return Object.fromEntries(
			formatter
				.formatToParts(new Date())
				.filter((part) => part.type !== 'literal')
				.map((part) => [part.type, part.value])
		);
	}

	function getTodayKey(timeZone: string) {
		const parts = getDatePartsInTimeZone(timeZone, {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});

		return `${parts.year}-${parts.month}-${parts.day}`;
	}

	function getInitialMonth(timeZone: string): MonthView {
		const parts = getDatePartsInTimeZone(timeZone, {
			year: 'numeric',
			month: '2-digit'
		});

		const year = Number(parts.year);
		const month = Number(parts.month);

		return {
			year,
			monthIndex: month - 1
		};
	}

	function shiftMonth(month: MonthView, delta: number): MonthView {
		const shifted = new Date(Date.UTC(month.year, month.monthIndex + delta, 1));

		return {
			year: shifted.getUTCFullYear(),
			monthIndex: shifted.getUTCMonth()
		};
	}

	function formatDateKey(year: number, monthIndex: number, day: number) {
		const month = String(monthIndex + 1).padStart(2, '0');
		const date = String(day).padStart(2, '0');

		return `${year}-${month}-${date}`;
	}

	function getDaysInMonth(year: number, monthIndex: number) {
		return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
	}

	function buildCalendarCells(
		month: MonthView,
		today: string,
		eventStart: string,
		eventEnd: string,
		selected: string[]
	): CalendarCell[] {
		const selectedSet = new Set(selected);
		const firstWeekday = new Date(Date.UTC(month.year, month.monthIndex, 1)).getUTCDay();
		const daysInMonth = getDaysInMonth(month.year, month.monthIndex);
		const previousMonth = shiftMonth(month, -1);
		const daysInPreviousMonth = getDaysInMonth(previousMonth.year, previousMonth.monthIndex);
		const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
		const cells: CalendarCell[] = [];

		for (let index = 0; index < totalCells; index += 1) {
			const dayOffset = index - firstWeekday + 1;
			let cellMonth = month;
			let day = dayOffset;
			let inCurrentMonth = true;

			if (dayOffset <= 0) {
				cellMonth = previousMonth;
				day = daysInPreviousMonth + dayOffset;
				inCurrentMonth = false;
			} else if (dayOffset > daysInMonth) {
				cellMonth = shiftMonth(month, 1);
				day = dayOffset - daysInMonth;
				inCurrentMonth = false;
			}

			const date = formatDateKey(cellMonth.year, cellMonth.monthIndex, day);

			cells.push({
				date,
				day,
				inCurrentMonth,
				isToday: date === today,
				isInEventRange: date >= eventStart && date <= eventEnd,
				isSelected: selectedSet.has(date)
			});
		}

		return cells;
	}
</script>

<svelte:head>
	<title>{event.title} | Omoikane</title>
	<meta name="robots" content="noindex" />
</svelte:head>

	<div class="page">
		{#if createdAdminPath}
			<section class="admin-banner">
			<p class="eyebrow">Admin link</p>
			<p>
				Save this private URL now. It is shown once after event creation.
			</p>
			<p><a href={createdAdminPath}>{createdAdminPath}</a></p>
			</section>
		{/if}

		<section class="hero card">
			<p class="eyebrow">Public event</p>
			<h1>{event.title}</h1>

			{#if event.description}
				<p class="description">{event.description}</p>
			{/if}

			<div class="meta">
				<p><strong>Timezone</strong>: {event.timezone}</p>
				<p>
					<strong>Date range</strong>: {formatDate(event.start_date)} to
					{formatDate(event.end_date)}
				</p>
				<p><strong>Status</strong>: {event.is_closed ? 'Closed' : 'Open'}</p>
			</div>

			{#if event.is_closed}
				<section class="closed-banner" aria-labelledby="closed-event-heading">
					<div>
						<p class="section-title" id="closed-event-heading">This event is closed</p>
						<p class="section-copy">
							New availability submissions are disabled, but the saved results below are still visible.
						</p>
					</div>
				</section>
			{/if}

			<section class="best-options" aria-labelledby="best-options-heading">
				<div>
					<p class="section-title" id="best-options-heading">Best options</p>
					<p class="section-copy">
						The most popular dates update automatically as responses come in.
					</p>
				</div>

				{#if bestDates.length > 0}
					<ul>
						{#each bestDates as result}
							<li>
								<span>{formatDate(result.date)}</span>
								<strong>{result.attendee_count} {result.attendee_count === 1 ? 'person' : 'people'}</strong>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="empty-selection">No responses yet. Results will appear after the first submission.</p>
				{/if}
			</section>
		</section>

		<form method="POST" class="content" aria-describedby="response-help">
			<section class="details card">
				<div>
					<p class="section-title">Your response</p>
					<p class="section-copy" id="response-help">
						{#if event.is_closed}
							This event is closed, so new responses cannot be submitted. You can still load a saved response by email to review it.
						{:else}
						Enter your details, pick your dates, and save your availability. You can also load a saved response with your email before making changes.
						{/if}
					</p>
				</div>

				{#if form?.message}
					<p class:success-message={form.success} class="form-message" role={form.success ? 'status' : 'alert'}>
						{form.message}
					</p>
				{/if}

				<label>
					<span>Name</span>
					<input
						aria-describedby={form?.errors?.name ? 'name-error' : undefined}
						aria-invalid={form?.errors?.name ? 'true' : undefined}
						name="name"
						autocomplete="name"
						placeholder="Taylor"
						value={form?.values?.name ?? ''}
						required
					/>
					{#if form?.errors?.name}
						<small id="name-error">{form.errors.name}</small>
					{/if}
				</label>

				<label>
					<span>Email</span>
					<input
						aria-describedby={form?.errors?.email ? 'email-error' : undefined}
						aria-invalid={form?.errors?.email ? 'true' : undefined}
						name="email"
						type="email"
						autocomplete="email"
						placeholder="taylor@example.com"
						value={form?.values?.email ?? ''}
						required
					/>
					{#if form?.errors?.email}
						<small id="email-error">{form.errors.email}</small>
					{/if}
				</label>

				<input type="hidden" name="selectedDates" value={JSON.stringify(selectedDates)} />

				<div class="form-actions">
					<button
						type="submit"
						class="load-button"
						formaction="?/loadSaved"
						formnovalidate
					>
						Load saved response
					</button>
					<button type="submit" class="save-button" disabled={Boolean(event.is_closed)}>
						Save availability
					</button>
				</div>

				<section class="ranked-results" aria-labelledby="ranked-results-heading">
					<div>
						<p class="section-title" id="ranked-results-heading">Ranked dates</p>
						<p class="section-copy">
							See which days currently work for the most attendees.
						</p>
					</div>

					{#if rankedDates.length > 0}
						<ol>
							{#each rankedDates as result}
								<li>
									<span>{formatDate(result.date)}</span>
									<strong>{result.attendee_count} {result.attendee_count === 1 ? 'attendee' : 'attendees'}</strong>
								</li>
							{/each}
						</ol>
					{:else}
						<p class="empty-selection">No availability has been saved yet.</p>
					{/if}
				</section>
			</section>

			<section class="calendar card" aria-labelledby="calendar-heading">
				<div class="calendar-top">
					<div>
						<p class="section-title" id="calendar-heading">Choose dates</p>
						<p class="section-copy" id="calendar-help">
							Select the dates that work for you. Your choices stay in place while you browse months.
						</p>
					</div>

					<div class="month-nav" aria-label="Month navigation">
						<button
							type="button"
							class="nav-button"
							aria-label="Show previous month"
							onclick={() => (visibleMonth = shiftMonth(visibleMonth, -1))}
						>
							Previous
						</button>
						<p aria-live="polite">{monthLabel}</p>
						<button
							type="button"
							class="nav-button"
							aria-label="Show next month"
							onclick={() => (visibleMonth = shiftMonth(visibleMonth, 1))}
						>
							Next
						</button>
					</div>
				</div>

				<div class="weekday-row" aria-hidden="true">
					{#each weekdayLabels as weekday}
						<div>{weekday}</div>
					{/each}
				</div>

				<div class="grid" role="grid" aria-describedby="calendar-help selected-dates-status" aria-label={monthLabel}>
					{#each calendarCells as cell}
						<div
							aria-current={cell.isToday ? 'date' : undefined}
							aria-selected={cell.isSelected}
							class:outside-month={!cell.inCurrentMonth}
							class:today={cell.isToday}
							class:in-range={cell.isInEventRange}
							class:selected={cell.isSelected}
							class="day"
							role="gridcell"
							aria-label={formatDate(cell.date)}
						>
							{#if cell.isInEventRange}
								<button
									type="button"
									class="day-button"
									aria-label={getDayButtonLabel(cell)}
									aria-pressed={cell.isSelected}
									disabled={Boolean(event.is_closed)}
									onclick={() => toggleDate(cell.date)}
								>
									<span>{cell.day}</span>
								</button>
							{:else}
								<span>{cell.day}</span>
							{/if}
						</div>
					{/each}
				</div>

				<section class="selection-summary" aria-labelledby="selected-dates-heading" aria-live="polite">
					<div>
						<p class="section-title" id="selected-dates-heading">Selected dates</p>
						<p class="section-copy">Review the days you have picked before saving.</p>
						<p class="sr-only" id="selected-dates-status">{calendarStatus.label}</p>
					</div>

					{#if form?.errors?.selectedDates}
						<p class="form-message" id="selected-dates-error" role="alert">{form.errors.selectedDates}</p>
					{/if}

					{#if selectedDateSummary.length > 0}
						<p class="selection-count" aria-hidden="true">{calendarStatus.countLabel}</p>
						<ul>
							{#each selectedDateSummary as date}
								<li>{formatDate(date)}</li>
							{/each}
						</ul>
					{:else}
						<p class="empty-selection">No dates selected yet.</p>
					{/if}
				</section>

				<div class="legend" aria-label="Calendar legend">
					<p><span class="swatch today"></span>Today</p>
					<p><span class="swatch in-range"></span>Inside event range</p>
					<p><span class="swatch selected"></span>Selected</p>
				</div>
			</section>
		</form>
	</div>

<style>
	.page {
		max-width: 72rem;
		margin: 0 auto;
		padding: 2.25rem 1.5rem 5rem;
	}

	.content {
		display: grid;
		grid-template-columns: minmax(18rem, 24rem) minmax(0, 1fr);
		gap: 1.5rem;
		margin-top: 1.5rem;
		align-items: start;
	}

	.card,
	.admin-banner {
		padding: 1.5rem;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--surface);
		box-shadow: var(--shadow);
	}

	.admin-banner {
		margin-bottom: 1rem;
		border-color: rgba(64, 139, 239, 0.28);
		background: rgba(64, 139, 239, 0.08);
	}

	.eyebrow {
		margin: 0 0 0.75rem;
		color: var(--accent-green);
		font-size: 0.875rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	h1,
	p,
	label,
	span,
	input,
	button {
		margin: 0;
	}

	h1 {
		font-size: clamp(2.25rem, 5vw, 3.75rem);
		line-height: 1.05;
	}

	.description {
		margin-top: 1rem;
		color: var(--text-muted);
		font-size: 1.05rem;
		line-height: 1.7;
	}

	.meta {
		display: grid;
		gap: 0.75rem;
		margin-top: 1.5rem;
		color: var(--text-muted);
	}

	.admin-banner a {
		word-break: break-all;
	}

	.best-options,
	.closed-banner,
	.ranked-results {
		display: grid;
		gap: 0.85rem;
		padding-top: 0.25rem;
		border-top: 1px solid var(--border);
	}

	.best-options ul,
	.ranked-results ol {
		display: grid;
		gap: 0.75rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.best-options li,
	.ranked-results li {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.85rem 1rem;
		border: 1px solid var(--border);
		border-radius: 0.85rem;
		background: var(--surface-muted);
		color: var(--text);
	}

	.best-options li strong,
	.ranked-results li strong {
		white-space: nowrap;
	}

	.details,
	.calendar {
		display: grid;
		gap: 1rem;
	}

	.section-title {
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--text-strong);
	}

	.section-copy {
		margin-top: 0.35rem;
		color: var(--text-muted);
		line-height: 1.6;
	}

	label {
		display: grid;
		gap: 0.45rem;
	}

	span {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--text-strong);
	}

	input,
	button {
		font: inherit;
	}

	input {
		width: 100%;
		box-sizing: border-box;
		padding: 0.8rem 0.9rem;
		border: 1px solid var(--border-strong);
		border-radius: 0.75rem;
		background: var(--surface-strong);
		color: var(--text);
	}

	input:focus,
	button:focus {
		outline: 2px solid var(--accent-blue);
		outline-offset: 2px;
	}

	small,
	.form-message {
		color: var(--danger);
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.success-message {
		color: var(--success);
	}

	.closed-banner {
		margin-top: 1rem;
		padding: 1rem;
		border: 1px solid rgba(244, 81, 151, 0.28);
		border-radius: 0.85rem;
		background: rgba(244, 81, 151, 0.08);
	}

	.save-button {
		justify-self: start;
		min-height: 3rem;
		padding: 0.85rem 1.25rem;
		border: 0;
		border-radius: 999px;
		background: linear-gradient(135deg, var(--accent-orange), var(--accent-pink));
		color: #ffffff;
		font-weight: 800;
		cursor: pointer;
	}

	.form-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.load-button {
		min-height: 3rem;
		padding: 0.85rem 1.25rem;
		border: 1px solid var(--border-strong);
		border-radius: 999px;
		background: var(--surface-strong);
		color: var(--text);
		font-weight: 700;
		cursor: pointer;
	}

	.save-button:disabled,
	.day-button:disabled,
	input:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.calendar-top {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: start;
	}

	.month-nav {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		justify-content: flex-end;
		flex-wrap: wrap;
	}

	.month-nav p {
		min-width: 9rem;
		text-align: center;
		font-weight: 700;
		color: var(--text-strong);
	}

	.nav-button {
		min-height: 2.75rem;
		padding: 0.65rem 0.95rem;
		border: 1px solid var(--border-strong);
		border-radius: 999px;
		background: var(--surface-strong);
		color: var(--text);
		cursor: pointer;
	}

	.weekday-row,
	.grid {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
	}

	.weekday-row {
		gap: 0.5rem;
		color: var(--text-muted);
		font-size: 0.85rem;
		font-weight: 700;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.grid {
		gap: 0.5rem;
	}

	.day {
		min-height: 6rem;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--surface-muted);
		color: var(--text);
	}

	.day-button {
		display: flex;
		width: 100%;
		min-height: 6rem;
		padding: 0.75rem;
		align-items: start;
		justify-content: start;
		border: 0;
		border-radius: inherit;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}

	.day span {
		display: inline-flex;
		width: 2rem;
		height: 2rem;
		align-items: center;
		justify-content: center;
		border-radius: 999px;
	}

	.outside-month {
		opacity: 0.45;
	}

	.in-range {
		border-color: rgba(53, 201, 95, 0.32);
		background: rgba(53, 201, 95, 0.12);
	}

	.selected {
		border-color: rgba(244, 81, 151, 0.28);
		background: rgba(244, 81, 151, 0.12);
	}

	.selected .day-button {
		color: var(--text-strong);
	}

	.selected span {
		background: rgba(244, 81, 151, 0.18);
		color: var(--text-strong);
		font-weight: 800;
	}

	.today span {
		background: linear-gradient(135deg, var(--accent-yellow), var(--accent-orange));
		color: #ffffff;
		font-weight: 800;
	}

	.legend {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		color: var(--text);
		font-size: 0.95rem;
	}

	.legend p {
		display: inline-flex;
		gap: 0.5rem;
		align-items: center;
	}

	.swatch {
		display: inline-block;
		width: 1rem;
		height: 1rem;
		border-radius: 999px;
		border: 1px solid var(--border-strong);
		background: var(--surface-strong);
	}

	.swatch.today {
		border: 0;
		background: linear-gradient(135deg, var(--accent-yellow), var(--accent-orange));
	}

	.swatch.in-range {
		border-color: rgba(53, 201, 95, 0.32);
		background: rgba(53, 201, 95, 0.7);
	}

	.swatch.selected {
		border-color: rgba(244, 81, 151, 0.28);
		background: rgba(244, 81, 151, 0.7);
	}

	.selection-summary {
		display: grid;
		gap: 0.85rem;
		padding-top: 0.25rem;
		border-top: 1px solid var(--border);
	}

	.selection-summary ul {
		margin: 0;
		padding-left: 1.25rem;
		color: var(--text);
	}

	.selection-count {
		color: var(--text);
		font-size: 0.95rem;
		font-weight: 700;
	}

	.selection-summary li + li {
		margin-top: 0.4rem;
	}

	.empty-selection {
		color: var(--text-muted);
	}

	strong {
		color: var(--text-strong);
	}

	@media (max-width: 640px) {
		.page {
			padding-top: 3rem;
		}

		.content {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.card,
		.admin-banner {
			padding: 1.2rem;
			border-radius: 0.9rem;
		}

		.calendar-top {
			flex-direction: column;
		}

		.best-options li,
		.ranked-results li {
			flex-direction: column;
			align-items: start;
		}

		.month-nav {
			justify-content: stretch;
		}

		.month-nav p {
			width: 100%;
			order: -1;
		}

		.nav-button {
			flex: 1 1 0;
		}

		.form-actions {
			display: grid;
		}

		.save-button,
		.load-button {
			width: 100%;
			justify-self: stretch;
		}

		.weekday-row,
		.grid {
			gap: 0.35rem;
		}

		.day {
			min-height: 4.9rem;
		}

		.day-button {
			min-height: 4.9rem;
			padding: 0.55rem;
		}

		.day span {
			width: 2.15rem;
			height: 2.15rem;
		}
	}
</style>
