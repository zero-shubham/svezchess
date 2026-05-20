<script lang="ts">
	import '../app.css';
	import logo from '$lib/assets/logo.svg';
	import Toast from '$lib/toast.svelte';
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

<Toast />

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
