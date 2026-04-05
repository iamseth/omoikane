<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import logo from '$lib/assets/logo.png';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Omoikane</title>
	<meta
		name="description"
		content="Omoikane helps small groups find the best date for an event."
	/>
</svelte:head>

<div class="app-shell">
	<header class="site-header">
		<a class="brand" href="/" aria-label="Omoikane home">
			<img src={logo} alt="Omoikane logo" />
		</a>
	</header>

	<main>
		{@render children()}
	</main>
</div>

<style>
	:global(:root) {
		color-scheme: light;
		--bg: #fffaf5;
		--bg-accent: #fff1d6;
		--surface: rgba(255, 255, 255, 0.9);
		--surface-strong: #ffffff;
		--surface-muted: rgba(255, 248, 238, 0.92);
		--text: #27467f;
		--text-strong: #17345f;
		--text-muted: #5f7090;
		--border: rgba(39, 70, 127, 0.14);
		--border-strong: rgba(39, 70, 127, 0.24);
		--accent-blue: #408bef;
		--accent-green: #35c95f;
		--accent-orange: #ff9808;
		--accent-pink: #f45197;
		--accent-purple: #7d64d8;
		--accent-yellow: #ffca22;
		--success: #2fb95a;
		--danger: #e24a8d;
		--shadow: 0 24px 60px rgba(39, 70, 127, 0.12);
	}

	:global(body) {
		margin: 0;
		font-family:
			Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		background:
			radial-gradient(circle at top, rgba(255, 202, 34, 0.18), transparent 24rem),
			radial-gradient(circle at right top, rgba(64, 139, 239, 0.18), transparent 22rem),
			linear-gradient(180deg, var(--bg-accent), var(--bg));
		color: var(--text);
	}

	:global(a) {
		color: var(--accent-blue);
	}

	:global(a:hover) {
		color: var(--accent-purple);
	}

	.app-shell {
		min-height: 100vh;
	}

	.site-header {
		max-width: 72rem;
		margin: 0 auto;
		padding: 1.25rem 1.5rem 0.25rem;
	}

	.brand {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		width: 100%;
		min-height: 8.75rem;
		padding: 1.35rem 1.75rem;
		border: 1px solid var(--border);
		border-radius: 1.25rem;
		background:
			radial-gradient(circle at 84% 30%, rgba(255, 202, 34, 0.22), transparent 10rem),
			radial-gradient(circle at 92% 72%, rgba(64, 139, 239, 0.14), transparent 12rem),
			linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 250, 245, 0.92));
		box-shadow: var(--shadow);
		text-decoration: none;
		overflow: hidden;
	}

	.brand img {
		width: min(32rem, 50vw);
		max-width: 100%;
		height: auto;
		display: block;
		object-fit: contain;
		filter: drop-shadow(0 14px 24px rgba(39, 70, 127, 0.14));
		transform-origin: left center;
		transform: translateX(-0.25rem);
	}

	.brand:focus-visible {
		outline: 2px solid var(--accent-blue);
		outline-offset: 4px;
	}

	@media (max-width: 640px) {
		.site-header {
			padding-top: 1rem;
			padding-bottom: 0;
		}

		.brand {
			min-height: 6.5rem;
			padding: 0.9rem 1rem;
			border-radius: 1rem;
		}

		.brand img {
			width: min(24rem, 100%);
			transform: none;
		}
	}
</style>
