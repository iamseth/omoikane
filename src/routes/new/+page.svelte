<script lang="ts">
	let { data, form } = $props();
</script>

<svelte:head>
	<title>Create Event | Omoikane</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page">
	<section class="hero">
		<p class="eyebrow">Slice S03</p>
		<h1>Create an event</h1>
		<p class="lede">
			Start a scheduling poll with a title, a fixed timezone, and a date range your group can
			choose from.
		</p>
	</section>

	<form method="POST" class="card">
		<label>
			<span>Title</span>
			<input name="title" value={form?.values?.title ?? data.defaults.title} required />
			{#if form?.errors?.title}
				<small>{form.errors.title}</small>
			{/if}
		</label>

		<label>
			<span>Description</span>
			<textarea name="description" rows="4">{form?.values?.description ?? data.defaults.description}</textarea>
		</label>

		<label>
			<span>Timezone</span>
			<input
				name="timezone"
				value={form?.values?.timezone ?? data.defaults.timezone}
				placeholder="UTC"
				required
			/>
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
					value={form?.values?.startDate ?? data.defaults.startDate}
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
					value={form?.values?.endDate ?? data.defaults.endDate}
					required
				/>
				{#if form?.errors?.endDate}
					<small>{form.errors.endDate}</small>
				{/if}
			</label>
		</div>

		<button type="submit">Create event</button>
	</form>
</div>

<style>
	.page {
		max-width: 48rem;
		margin: 0 auto;
		padding: 2.25rem 1.5rem 5rem;
	}

	.hero {
		margin-bottom: 2rem;
	}

	.eyebrow {
		margin: 0 0 0.75rem;
		color: var(--accent-orange);
		font-size: 0.875rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	h1,
	p,
	label,
	span {
		margin: 0;
	}

	h1 {
		font-size: clamp(2.25rem, 5vw, 3.75rem);
		line-height: 1.05;
	}

	.lede {
		margin-top: 0.75rem;
		color: var(--text-muted);
		font-size: 1.05rem;
		line-height: 1.7;
	}

	.card {
		display: grid;
		gap: 1.25rem;
		padding: 1.5rem;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--surface);
		box-shadow: var(--shadow);
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
	}

	input:focus,
	textarea:focus,
	button:focus {
		outline: 2px solid var(--accent-blue);
		outline-offset: 2px;
	}

	textarea {
		resize: vertical;
	}

	button {
		justify-self: start;
		padding: 0.85rem 1.25rem;
		border: 0;
		border-radius: 999px;
		background: linear-gradient(135deg, var(--accent-orange), var(--accent-pink));
		color: #ffffff;
		font-weight: 700;
		cursor: pointer;
	}

	.date-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	small {
		color: var(--danger);
	}

	@media (max-width: 640px) {
		.page {
			padding-top: 3rem;
		}

		.date-grid {
			grid-template-columns: 1fr;
		}

		button {
			width: 100%;
			justify-self: stretch;
		}
	}
</style>
