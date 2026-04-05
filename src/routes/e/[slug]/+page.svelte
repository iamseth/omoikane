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
	let hasInitializedVisibleMonth = false;
	let visibleMonth = $state<MonthView>({ year: 0, monthIndex: 0 });
	let selectedDates = $state<string[]>([]);

	$effect(() => {
		if (hasInitializedVisibleMonth) {
			return;
		}

		visibleMonth = getInitialMonth(event.timezone);
		hasInitializedVisibleMonth = true;
	});

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

	function formatDate(value: string) {
		return fullDateFormatter.format(new Date(`${value}T00:00:00Z`));
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
		if (date < event.start_date || date > event.end_date) {
			return;
		}

		selectedDates = selectedDates.includes(date)
			? selectedDates.filter((value) => value !== date)
			: [...selectedDates, date];
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
			</div>

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

		<form method="POST" class="content">
			<section class="details card">
				<div>
					<p class="section-title">Your response</p>
					<p class="section-copy">
						Enter your details, pick your dates, and save your availability. Submitting again
						with the same email updates your earlier response.
					</p>
				</div>

				{#if form?.message}
					<p class:success-message={form.success} class="form-message">{form.message}</p>
				{/if}

				<label>
					<span>Name</span>
					<input
						name="name"
						autocomplete="name"
						placeholder="Taylor"
						value={form?.values?.name ?? ''}
						required
					/>
					{#if form?.errors?.name}
						<small>{form.errors.name}</small>
					{/if}
				</label>

				<label>
					<span>Email</span>
					<input
						name="email"
						type="email"
						autocomplete="email"
						placeholder="taylor@example.com"
						value={form?.values?.email ?? ''}
						required
					/>
					{#if form?.errors?.email}
						<small>{form.errors.email}</small>
					{/if}
				</label>

				<input type="hidden" name="selectedDates" value={JSON.stringify(selectedDates)} />

				<button type="submit" class="save-button">Save availability</button>

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
						<p class="section-copy">
							Select the dates that work for you. Your choices stay in place while you browse months.
						</p>
					</div>

					<div class="month-nav" aria-label="Month navigation">
						<button type="button" class="nav-button" onclick={() => (visibleMonth = shiftMonth(visibleMonth, -1))}>
							Previous
						</button>
						<p>{monthLabel}</p>
						<button type="button" class="nav-button" onclick={() => (visibleMonth = shiftMonth(visibleMonth, 1))}>
							Next
						</button>
					</div>
				</div>

				<div class="weekday-row" aria-hidden="true">
					{#each weekdayLabels as weekday}
						<div>{weekday}</div>
					{/each}
				</div>

				<div class="grid" role="grid" aria-label={monthLabel}>
					{#each calendarCells as cell}
						<div
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
									aria-pressed={cell.isSelected}
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

				<section class="selection-summary" aria-labelledby="selected-dates-heading">
					<div>
						<p class="section-title" id="selected-dates-heading">Selected dates</p>
						<p class="section-copy">Review the days you have picked before saving.</p>
					</div>

					{#if form?.errors?.selectedDates}
						<p class="form-message">{form.errors.selectedDates}</p>
					{/if}

					{#if selectedDateSummary.length > 0}
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
	:global(body) {
		margin: 0;
		font-family:
			Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		background: #0f172a;
		color: #e2e8f0;
	}

	.page {
		max-width: 72rem;
		margin: 0 auto;
		padding: 4rem 1.5rem 5rem;
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
		border: 1px solid #334155;
		border-radius: 1rem;
		background: rgba(15, 23, 42, 0.78);
	}

	.admin-banner {
		margin-bottom: 1rem;
		border-color: #0ea5e9;
		background: rgba(8, 47, 73, 0.5);
	}

	.eyebrow {
		margin: 0 0 0.75rem;
		color: #38bdf8;
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
		color: #cbd5e1;
		font-size: 1.05rem;
		line-height: 1.7;
	}

	.meta {
		display: grid;
		gap: 0.75rem;
		margin-top: 1.5rem;
		color: #cbd5e1;
	}

	.best-options,
	.ranked-results {
		display: grid;
		gap: 0.85rem;
		padding-top: 0.25rem;
		border-top: 1px solid #1e293b;
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
		border: 1px solid #334155;
		border-radius: 0.85rem;
		background: rgba(2, 6, 23, 0.65);
		color: #cbd5e1;
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
		color: #f8fafc;
	}

	.section-copy {
		margin-top: 0.35rem;
		color: #94a3b8;
		line-height: 1.6;
	}

	label {
		display: grid;
		gap: 0.45rem;
	}

	span {
		font-size: 0.95rem;
		font-weight: 600;
		color: #f8fafc;
	}

	input,
	button {
		font: inherit;
	}

	input {
		width: 100%;
		box-sizing: border-box;
		padding: 0.8rem 0.9rem;
		border: 1px solid #475569;
		border-radius: 0.75rem;
		background: #020617;
		color: #e2e8f0;
	}

	input:focus,
	button:focus {
		outline: 2px solid #38bdf8;
		outline-offset: 2px;
	}

	small,
	.form-message {
		color: #fda4af;
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.success-message {
		color: #86efac;
	}

	.save-button {
		justify-self: start;
		padding: 0.85rem 1.25rem;
		border: 0;
		border-radius: 999px;
		background: linear-gradient(135deg, #38bdf8, #818cf8);
		color: #020617;
		font-weight: 800;
		cursor: pointer;
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
		color: #f8fafc;
	}

	.nav-button {
		padding: 0.65rem 0.95rem;
		border: 1px solid #475569;
		border-radius: 999px;
		background: #020617;
		color: #e2e8f0;
		cursor: pointer;
	}

	.weekday-row,
	.grid {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
	}

	.weekday-row {
		gap: 0.5rem;
		color: #94a3b8;
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
		min-height: 5.75rem;
		border: 1px solid #334155;
		border-radius: 1rem;
		background: rgba(2, 6, 23, 0.8);
		color: #cbd5e1;
	}

	.day-button {
		display: flex;
		width: 100%;
		min-height: 5.75rem;
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
		border-color: #0ea5e9;
		background: rgba(8, 47, 73, 0.45);
	}

	.selected {
		border-color: #818cf8;
		background: rgba(49, 46, 129, 0.55);
	}

	.selected .day-button {
		color: #eef2ff;
	}

	.selected span {
		background: rgba(224, 231, 255, 0.18);
		color: #eef2ff;
		font-weight: 800;
	}

	.today span {
		background: linear-gradient(135deg, #38bdf8, #818cf8);
		color: #020617;
		font-weight: 800;
	}

	.legend {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		color: #cbd5e1;
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
		border: 1px solid #475569;
		background: #020617;
	}

	.swatch.today {
		border: 0;
		background: linear-gradient(135deg, #38bdf8, #818cf8);
	}

	.swatch.in-range {
		border-color: #0ea5e9;
		background: rgba(8, 47, 73, 0.9);
	}

	.swatch.selected {
		border-color: #818cf8;
		background: rgba(99, 102, 241, 0.9);
	}

	.selection-summary {
		display: grid;
		gap: 0.85rem;
		padding-top: 0.25rem;
		border-top: 1px solid #1e293b;
	}

	.selection-summary ul {
		margin: 0;
		padding-left: 1.25rem;
		color: #cbd5e1;
	}

	.selection-summary li + li {
		margin-top: 0.4rem;
	}

	.empty-selection {
		color: #94a3b8;
	}

	a {
		color: #bae6fd;
		word-break: break-all;
	}

	strong {
		color: #f8fafc;
	}

	@media (max-width: 640px) {
		.page {
			padding-top: 3rem;
		}

		.content {
			grid-template-columns: 1fr;
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

		.day {
			min-height: 4.75rem;
		}

		.day-button {
			min-height: 4.75rem;
			padding: 0.55rem;
		}
	}
</style>
