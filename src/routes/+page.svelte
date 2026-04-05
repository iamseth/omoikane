<script lang="ts">
	const nextSteps = [
		'Create the SQLite schema and initialization flow.',
		'Build event creation with a public slug and secret admin URL.',
		'Render the event calendar and availability selection UI.'
	];
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page">
	<section>
		<p class="eyebrow">Slice S01</p>
		<h1>Omoikane</h1>
		<p class="lede">
			A lightweight scheduling app for small groups to find the best date for an event.
		</p>
	</section>

	<section>
		<h2>Current state</h2>
		<p>
			The application scaffold is in place with SvelteKit, TypeScript, and the Node adapter.
		</p>
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
	li,
	section p {
		color: #cbd5e1;
		font-size: 1.05rem;
		line-height: 1.7;
	}

	ul {
		padding-left: 1.25rem;
	}

	code {
		font-family: 'SFMono-Regular', ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.95em;
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
