<script lang="ts">
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
	};

	let { data } = $props();

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
	const todayKey = $derived(getTodayKey(event.timezone));
	let visibleMonth = $state<MonthView>({ year: 0, monthIndex: 0 });

	$effect(() => {
		visibleMonth = getInitialMonth(event.timezone);
	});

	const monthLabel = $derived(
		monthLabelFormatter.format(new Date(Date.UTC(visibleMonth.year, visibleMonth.monthIndex, 1)))
	);

	const calendarCells = $derived(
		buildCalendarCells(visibleMonth, todayKey, event.start_date, event.end_date)
	);

	function formatDate(value: string) {
		return fullDateFormatter.format(new Date(`${value}T00:00:00Z`));
	}

	function getTodayKey(timeZone: string) {
		const formatter = new Intl.DateTimeFormat('en-CA', {
			timeZone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});

		return formatter.format(new Date());
	}

	function getInitialMonth(timeZone: string): MonthView {
		const formatter = new Intl.DateTimeFormat('en-CA', {
			timeZone,
			year: 'numeric',
			month: '2-digit'
		});

		const [year, month] = formatter.format(new Date()).split('-').map(Number);

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
		eventEnd: string
	): CalendarCell[] {
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
				isInEventRange: date >= eventStart && date <= eventEnd
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
		</section>

		<section class="content">
			<form class="details card">
				<div>
					<p class="section-title">Your response</p>
					<p class="section-copy">
						Enter your details before choosing dates. Saving arrives in the next slice.
					</p>
				</div>

				<label>
					<span>Name</span>
					<input name="name" autocomplete="name" placeholder="Taylor" />
				</label>

				<label>
					<span>Email</span>
					<input
						name="email"
						type="email"
						autocomplete="email"
						placeholder="taylor@example.com"
					/>
				</label>
			</form>

			<section class="calendar card" aria-labelledby="calendar-heading">
				<div class="calendar-top">
					<div>
						<p class="section-title" id="calendar-heading">Choose dates</p>
						<p class="section-copy">
							Only days inside the event window are active in later slices.
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
							class="day"
							role="gridcell"
							aria-label={formatDate(cell.date)}
						>
							<span>{cell.day}</span>
						</div>
					{/each}
				</div>

				<div class="legend" aria-label="Calendar legend">
					<p><span class="swatch today"></span>Today</p>
					<p><span class="swatch in-range"></span>Inside event range</p>
				</div>
			</section>
		</section>
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
		padding: 0.75rem;
		border: 1px solid #334155;
		border-radius: 1rem;
		background: rgba(2, 6, 23, 0.8);
		color: #cbd5e1;
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
			padding: 0.55rem;
		}
	}
</style>
