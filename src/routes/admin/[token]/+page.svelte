<script lang="ts">
	type AdminPageForm = {
		errors?: {
			title?: string;
			description?: string;
			timezone?: string;
			startDate?: string;
			endDate?: string;
		};
		message?: string;
		success?: boolean;
		values?: {
			title?: string;
			description?: string;
			timezone?: string;
			startDate?: string;
			endDate?: string;
		};
	};

	type AdminPageData = {
		event: {
			title: string;
			description: string | null;
			timezone: string;
			start_date: string;
			end_date: string;
			is_closed: number;
			slug: string;
		};
		rankedDates: Array<{
			date: string;
			attendee_count: number;
		}>;
		participantResponses: Array<{
			participant: {
				name: string;
				email: string;
				updated_at: string;
			};
			selectedDates: string[];
		}>;
	};

	let { data, form }: { data: AdminPageData; form?: AdminPageForm } = $props();

	const event = $derived(data.event);
	const publicPath = $derived(`/e/${event.slug}`);
	const rankedDates = $derived(data.rankedDates);
	const participantResponses = $derived(data.participantResponses);

	const fullDateFormatter = new Intl.DateTimeFormat('en', {
		dateStyle: 'long',
		timeZone: 'UTC'
	});

	const updatedAtFormatter = new Intl.DateTimeFormat('en', {
		dateStyle: 'medium',
		timeStyle: 'short',
		timeZone: 'UTC'
	});

	function formatDate(value: string) {
		return fullDateFormatter.format(new Date(`${value}T00:00:00Z`));
	}

	function formatUpdatedAt(value: string) {
		return updatedAtFormatter.format(new Date(`${value}Z`));
	}
</script>

<svelte:head>
	<title>Manage {event.title} | Omoikane</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page">
	<section class="hero card">
		<div class="hero-top">
			<div>
				<p class="eyebrow">Admin event</p>
				<h1>{event.title}</h1>
				<p class="lede">
					Use this private link to edit the event details or pause new submissions without hiding the
					current results.
				</p>
			</div>

			<p class:event-open={!event.is_closed} class:event-closed={Boolean(event.is_closed)} class="status-pill">
				{event.is_closed ? 'Closed' : 'Open'}
			</p>
		</div>

		<div class="meta">
			<p><strong>Public URL</strong>: <a href={publicPath}>{publicPath}</a></p>
			<p><strong>Timezone</strong>: {event.timezone}</p>
			<p><strong>Date range</strong>: {event.start_date} to {event.end_date}</p>
		</div>
	</section>

	<div class="content">
		<form method="POST" action="?/save" class="card form-card">
			<div>
				<p class="section-title">Event details</p>
				<p class="section-copy">Update the public title, description, timezone, and allowed date range.</p>
			</div>

			{#if form?.message}
				<p class:success-message={form.success} class="form-message">{form.message}</p>
			{/if}

			<label>
				<span>Title</span>
				<input name="title" value={form?.values?.title ?? event.title} required />
				{#if form?.errors?.title}
					<small>{form.errors.title}</small>
				{/if}
			</label>

			<label>
				<span>Description</span>
				<textarea name="description" rows="5" placeholder="Optional event details"
				>{form?.values?.description ?? event.description ?? ''}</textarea>
				{#if form?.errors?.description}
					<small>{form.errors.description}</small>
				{/if}
			</label>

			<label>
				<span>Timezone</span>
				<input name="timezone" value={form?.values?.timezone ?? event.timezone} required />
				{#if form?.errors?.timezone}
					<small>{form.errors.timezone}</small>
				{/if}
			</label>

			<div class="date-grid">
				<label>
					<span>Start date</span>
					<input
						name="startDate"
						type="date"
						value={form?.values?.startDate ?? event.start_date}
						required
					/>
					{#if form?.errors?.startDate}
						<small>{form.errors.startDate}</small>
					{/if}
				</label>

				<label>
					<span>End date</span>
					<input
						name="endDate"
						type="date"
						value={form?.values?.endDate ?? event.end_date}
						required
					/>
					{#if form?.errors?.endDate}
						<small>{form.errors.endDate}</small>
					{/if}
				</label>
			</div>

			<button type="submit" class="primary-button">Save changes</button>
		</form>

		<section class="card status-card">
			<div>
				<p class="section-title">Event status</p>
				<p class="section-copy">
					Closed events still show saved responses on the public page, but new submissions are blocked.
				</p>
			</div>

			<form method="POST" action="?/toggleStatus">
				<button type="submit" class:event-open={!event.is_closed} class:event-closed={Boolean(event.is_closed)} class="status-button">
					{event.is_closed ? 'Reopen event' : 'Close event'}
				</button>
			</form>
		</section>
	</div>

	<div class="results-grid">
		<section class="card results-card" aria-labelledby="admin-ranked-dates-heading">
			<div>
				<p class="section-title" id="admin-ranked-dates-heading">Ranked dates</p>
				<p class="section-copy">Review which dates currently work for the most attendees.</p>
			</div>

			{#if rankedDates.length > 0}
				<ol class="ranked-list">
					{#each rankedDates as result}
						<li>
							<span>{formatDate(result.date)}</span>
							<strong>{result.attendee_count} {result.attendee_count === 1 ? 'attendee' : 'attendees'}</strong>
						</li>
					{/each}
				</ol>
			{:else}
				<p class="empty-state">No responses have been saved yet.</p>
			{/if}
		</section>

		<section class="card responses-card" aria-labelledby="admin-responses-heading">
			<div>
				<p class="section-title" id="admin-responses-heading">Attendee responses</p>
				<p class="section-copy">See who has responded and which in-range dates are still attached to each response.</p>
			</div>

			{#if participantResponses.length > 0}
				<ul class="response-list">
					{#each participantResponses as response}
						<li>
							<div class="response-header">
								<div>
									<p class="response-name">{response.participant.name}</p>
									<p class="response-email">{response.participant.email}</p>
								</div>
								<p class="response-updated">Updated {formatUpdatedAt(response.participant.updated_at)}</p>
							</div>

							{#if response.selectedDates.length > 0}
								<p class="response-count">{response.selectedDates.length} {response.selectedDates.length === 1 ? 'date' : 'dates'} selected</p>
								<ul class="date-pill-list">
									{#each response.selectedDates as date}
										<li>{formatDate(date)}</li>
									{/each}
								</ul>
							{:else}
								<p class="empty-state">No in-range dates selected.</p>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p class="empty-state">No attendee responses yet.</p>
			{/if}
		</section>
	</div>
</div>

<style>
	.page {
		max-width: 72rem;
		margin: 0 auto;
		padding: 2.25rem 1.5rem 5rem;
	}

	.content {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(18rem, 22rem);
		gap: 1.5rem;
		margin-top: 1.5rem;
		align-items: start;
	}

	.results-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
		gap: 1.5rem;
		margin-top: 1.5rem;
		align-items: start;
	}

	.card {
		padding: 1.5rem;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--surface);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		box-shadow: var(--panel-highlight), var(--shadow-soft);
		overflow: hidden;
	}

	.hero,
	.form-card,
	.status-card,
	.results-card,
	.responses-card {
		display: grid;
		gap: 1rem;
	}

	.hero-top {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: start;
	}

	.eyebrow {
		margin: 0 0 0.75rem;
		color: var(--accent-purple);
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
	textarea,
	button {
		margin: 0;
	}

	h1 {
		font-size: clamp(2.25rem, 5vw, 3.75rem);
		line-height: 1.05;
		letter-spacing: -0.04em;
	}

	.lede,
	.meta,
	.section-copy {
		color: var(--text-muted);
		line-height: 1.7;
	}

	.meta {
		display: grid;
		gap: 0.75rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}

	.section-title {
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--text-strong);
	}

	.section-copy {
		margin-top: 0.35rem;
		color: var(--text-muted);
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
	textarea,
	button {
		font: inherit;
	}

	input,
	textarea {
		width: 100%;
		box-sizing: border-box;
		padding: 0.8rem 0.9rem;
		border: 1px solid var(--border-strong);
		border-radius: 0.75rem;
		background: var(--surface-strong);
		color: var(--text);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
		transition:
			border-color 160ms ease,
			box-shadow 160ms ease,
			background-color 160ms ease;
	}

	input:hover,
	textarea:hover {
		border-color: rgba(39, 70, 127, 0.32);
	}

	textarea {
		resize: vertical;
	}

	input:focus,
	textarea:focus,
	button:focus {
		outline: 2px solid var(--accent-blue);
		outline-offset: 2px;
		border-color: rgba(64, 139, 239, 0.32);
	}

	small,
	.form-message {
		color: var(--danger);
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.success-message {
		color: var(--success);
	}

	.date-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.primary-button,
	.status-button,
	.status-pill {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.8rem 1.15rem;
		border-radius: 999px;
		font-weight: 800;
	}

	.primary-button,
	.status-button {
		border: 0;
		cursor: pointer;
	}

	.primary-button {
		justify-self: start;
		background: linear-gradient(135deg, var(--accent-orange), var(--accent-pink));
		color: #ffffff;
		box-shadow: var(--shadow-button);
		transition: transform 160ms ease, box-shadow 160ms ease;
	}

	.primary-button:hover,
	.status-button:hover {
		transform: translateY(-1px);
	}

	.primary-button:hover {
		box-shadow: 0 18px 34px rgba(244, 81, 151, 0.24);
	}

	.status-pill {
		font-size: 0.95rem;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
	}

	.event-open {
		background: rgba(53, 201, 95, 0.14);
		color: var(--success);
	}

	.event-closed {
		background: rgba(244, 81, 151, 0.14);
		color: var(--danger);
	}

	.meta a {
		word-break: break-all;
	}

	strong {
		color: var(--text-strong);
	}

	.ranked-list,
	.response-list,
	.date-pill-list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.ranked-list,
	.response-list {
		display: grid;
		gap: 0.9rem;
	}

	.ranked-list li,
	.response-list li {
		padding: 1rem;
		border: 1px solid var(--border);
		border-radius: 0.9rem;
		background: var(--surface-muted);
		box-shadow: var(--panel-highlight);
		transition: transform 160ms ease, box-shadow 160ms ease;
	}

	.ranked-list li:hover,
	.response-list li:hover {
		transform: translateY(-1px);
		box-shadow: var(--panel-highlight), 0 14px 26px rgba(39, 70, 127, 0.08);
	}

	.ranked-list li {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: center;
	}

	.response-header {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: start;
	}

	.response-name,
	.response-email,
	.response-updated,
	.response-count,
	.empty-state {
		color: var(--text);
	}

	.response-name {
		font-weight: 700;
		color: var(--text-strong);
	}

	.response-email,
	.response-updated,
	.response-count,
	.empty-state {
		font-size: 0.95rem;
	}

	.response-email,
	.response-updated,
	.empty-state {
		color: var(--text-muted);
	}

	.response-count {
		margin-top: 0.85rem;
	}

	.date-pill-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		margin-top: 0.85rem;
	}

	.date-pill-list li {
		padding: 0.45rem 0.75rem;
		border-radius: 999px;
		background: rgba(64, 139, 239, 0.1);
		border: 1px solid rgba(64, 139, 239, 0.2);
		color: var(--text-strong);
	}

	@media (max-width: 700px) {
		.page {
			padding-top: 3rem;
		}

		.content,
		.results-grid,
		.date-grid {
			grid-template-columns: 1fr;
		}

		.hero-top {
			flex-direction: column;
		}

		.ranked-list li,
		.response-header {
			flex-direction: column;
			align-items: start;
		}
	}
</style>
