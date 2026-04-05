<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

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

{@render children()}
