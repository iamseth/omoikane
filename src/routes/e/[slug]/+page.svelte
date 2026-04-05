<script lang="ts">
	let { data } = $props();

	const formatter = new Intl.DateTimeFormat('en', {
		dateStyle: 'long',
		timeZone: 'UTC'
	});

	function formatDate(value: string) {
		return formatter.format(new Date(`${value}T00:00:00Z`));
	}
</script>

<svelte:head>
	<title>{data.event.title} | Omoikane</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page">
	{#if data.createdAdminPath}
		<section class="admin-banner">
			<p class="eyebrow">Admin link</p>
			<p>
				Save this private URL now. It is shown once after event creation.
			</p>
			<p><a href={data.createdAdminPath}>{data.createdAdminPath}</a></p>
		</section>
	{/if}

	<section class="hero card">
		<p class="eyebrow">Public event</p>
		<h1>{data.event.title}</h1>

		{#if data.event.description}
			<p class="description">{data.event.description}</p>
		{/if}

		<div class="meta">
			<p><strong>Timezone</strong>: {data.event.timezone}</p>
			<p>
				<strong>Date range</strong>: {formatDate(data.event.start_date)} to
				{formatDate(data.event.end_date)}
			</p>
		</div>
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
		max-width: 48rem;
		margin: 0 auto;
		padding: 4rem 1.5rem 5rem;
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
	p {
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
	}
</style>
