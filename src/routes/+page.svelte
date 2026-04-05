<script lang="ts">
	let { data } = $props();

	const nextSteps = [
		'Polish the mobile layout and accessibility details.',
		'Add Docker Compose deployment for local and small-server hosting.'
	];
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page">
	<section>
		<p class="eyebrow">Slice S08</p>
		<h1>Omoikane</h1>
		<p class="lede">
			A lightweight scheduling app for small groups to find the best date for an event.
		</p>
		<p class="cta"><a href="/new">Create your first event</a></p>
	</section>

	<section>
		<h2>Current state</h2>
		<p>
			The application now includes event creation, public response collection, ranked date
			results, and private admin management links.
		</p>
		<div class="status-card">
			<p><strong>Database path</strong>: <code>{data.databasePath}</code></p>
			<p><strong>Stored events</strong>: {data.eventCount}</p>
		</div>
	</section>

	<section>
		<h2>Next steps</h2>
		<ul>
			{#each nextSteps as step}
				<li>{step}</li>
			{/each}
		</ul>
		<p>
			Implementation guidance lives in <code>docs/</code>, starting with
			<code>docs/README.md</code>.
		</p>
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

	section + section {
		margin-top: 2.5rem;
	}

	h1,
	h2,
	p,
	ul {
		margin: 0;
	}

	h1 {
		font-size: clamp(2.5rem, 6vw, 4.5rem);
		line-height: 1;
		margin-top: 0.5rem;
	}

	h2 {
		font-size: 1.125rem;
		margin-bottom: 0.75rem;
	}

	.eyebrow {
		color: #38bdf8;
		font-size: 0.875rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.lede,
	.cta,
	li,
	section p {
		color: #cbd5e1;
		font-size: 1.05rem;
		line-height: 1.7;
	}

	.cta {
		margin-top: 1.5rem;
	}

	.cta a {
		display: inline-flex;
		padding: 0.85rem 1.25rem;
		border-radius: 999px;
		background: linear-gradient(135deg, #38bdf8, #818cf8);
		color: #020617;
		font-weight: 700;
		text-decoration: none;
	}

	ul {
		padding-left: 1.25rem;
	}

	code {
		font-family: 'SFMono-Regular', ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.95em;
	}

	strong {
		color: #f8fafc;
	}

	.status-card {
		margin-top: 1rem;
		padding: 1rem 1.125rem;
		border: 1px solid #334155;
		border-radius: 0.75rem;
		background: rgba(15, 23, 42, 0.65);
	}

	.status-card p + p {
		margin-top: 0.5rem;
	}

	@media (max-width: 640px) {
		.page {
			padding-top: 3rem;
		}

		.lede,
		li,
		section p {
			font-size: 1rem;
		}
	}
</style>
