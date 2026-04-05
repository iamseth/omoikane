<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Manage {data.event.title} | Omoikane</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page">
	<section class="card">
		<p class="eyebrow">Admin event</p>
		<h1>{data.event.title}</h1>
		<p class="lede">
			This private event management link is working. Editing controls land in a later slice.
		</p>
		<div class="meta">
			<p><strong>Timezone</strong>: {data.event.timezone}</p>
			<p><strong>Date range</strong>: {data.event.start_date} to {data.event.end_date}</p>
			<p><strong>Status</strong>: {data.event.is_closed ? 'Closed' : 'Open'}</p>
			<p><strong>Public URL</strong>: <a href={`/e/${data.event.slug}`}>/e/{data.event.slug}</a></p>
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

	.card {
		padding: 1.5rem;
		border: 1px solid #334155;
		border-radius: 1rem;
		background: rgba(15, 23, 42, 0.78);
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

	.lede {
		margin-top: 0.75rem;
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

	strong {
		color: #f8fafc;
	}

	a {
		color: #bae6fd;
	}

	@media (max-width: 640px) {
		.page {
			padding-top: 3rem;
		}
	}
</style>
