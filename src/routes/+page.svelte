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
	.page {
		max-width: 48rem;
		margin: 0 auto;
		padding: 2.25rem 1.5rem 5rem;
	}

	section {
		padding: 1.5rem;
		border: 1px solid var(--border);
		border-radius: 1.25rem;
		background: var(--surface);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		box-shadow: var(--panel-highlight), var(--shadow-soft);
		position: relative;
		overflow: hidden;
	}

	section:first-child {
		background:
			radial-gradient(circle at top right, rgba(255, 202, 34, 0.18), transparent 12rem),
			radial-gradient(circle at 78% 76%, rgba(64, 139, 239, 0.12), transparent 14rem),
			var(--surface);
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
		letter-spacing: -0.04em;
	}

	h2 {
		font-size: 1.125rem;
		margin-bottom: 0.75rem;
		letter-spacing: -0.02em;
	}

	.eyebrow {
		color: var(--accent-pink);
		font-size: 0.875rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.lede,
	.cta,
	li,
	section p {
		color: var(--text-muted);
		font-size: 1.05rem;
		line-height: 1.7;
	}

	.lede {
		max-width: 34rem;
	}

	.cta {
		margin-top: 1.5rem;
	}

	.cta a {
		display: inline-flex;
		align-items: center;
		padding: 0.85rem 1.25rem;
		border-radius: 999px;
		background: linear-gradient(
			135deg,
			var(--accent-green),
			var(--accent-yellow),
			var(--accent-pink),
			var(--accent-blue)
		);
		color: #ffffff;
		font-weight: 700;
		text-decoration: none;
		box-shadow: var(--shadow-button);
		transition: transform 160ms ease, box-shadow 160ms ease;
	}

	.cta a:hover {
		transform: translateY(-1px);
		box-shadow: 0 18px 34px rgba(244, 81, 151, 0.24);
	}

	ul {
		padding-left: 1.25rem;
	}

	code {
		font-family: 'SFMono-Regular', ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.95em;
	}

	strong {
		color: var(--text-strong);
	}

	.status-card {
		margin-top: 1rem;
		padding: 1rem 1.125rem;
		border: 1px solid rgba(64, 139, 239, 0.18);
		border-radius: 0.75rem;
		background: var(--surface-muted);
		box-shadow: var(--panel-highlight);
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
