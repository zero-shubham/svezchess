<script lang="ts">
	import logo from '$lib/assets/logo.svg';
	let { children } = $props();
</script>

<div class="layout">
	<header class="logo">
		<img src={logo} alt="ezchess" />
	</header>
	<main>
		{@render children()}
	</main>
</div>

<style>
	.logo {
		width: 80px;
    }
 

	.logo img {
		width: 100%;
		height: auto;
		display: block;
	}
</style>
