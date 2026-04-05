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
	};

	let { data, form }: { data: AdminPageData; form?: AdminPageForm } = $props();

	const event = $derived(data.event);
	const publicPath = $derived(`/e/${event.slug}`);
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
		grid-template-columns: minmax(0, 2fr) minmax(18rem, 22rem);
		gap: 1.5rem;
		margin-top: 1.5rem;
		align-items: start;
	}

	.card {
		padding: 1.5rem;
		border: 1px solid #334155;
		border-radius: 1rem;
		background: rgba(15, 23, 42, 0.78);
	}

	.hero,
	.form-card,
	.status-card {
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
	textarea,
	button {
		margin: 0;
	}

	h1 {
		font-size: clamp(2.25rem, 5vw, 3.75rem);
		line-height: 1.05;
	}

	.lede,
	.meta,
	.section-copy {
		color: #cbd5e1;
		line-height: 1.7;
	}

	.meta {
		display: grid;
		gap: 0.75rem;
		padding-top: 1rem;
		border-top: 1px solid #1e293b;
	}

	.section-title {
		font-size: 1.1rem;
		font-weight: 700;
		color: #f8fafc;
	}

	.section-copy {
		margin-top: 0.35rem;
		color: #94a3b8;
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
	textarea,
	button {
		font: inherit;
	}

	input,
	textarea {
		width: 100%;
		box-sizing: border-box;
		padding: 0.8rem 0.9rem;
		border: 1px solid #475569;
		border-radius: 0.75rem;
		background: #020617;
		color: #e2e8f0;
	}

	textarea {
		resize: vertical;
	}

	input:focus,
	textarea:focus,
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
		background: linear-gradient(135deg, #38bdf8, #818cf8);
		color: #020617;
	}

	.status-pill {
		font-size: 0.95rem;
	}

	.event-open {
		background: rgba(22, 163, 74, 0.18);
		color: #86efac;
	}

	.event-closed {
		background: rgba(190, 24, 93, 0.2);
		color: #fda4af;
	}

	a {
		color: #bae6fd;
		word-break: break-all;
	}

	strong {
		color: #f8fafc;
	}

	@media (max-width: 700px) {
		.page {
			padding-top: 3rem;
		}

		.content,
		.date-grid {
			grid-template-columns: 1fr;
		}

		.hero-top {
			flex-direction: column;
		}
	}
</style>
