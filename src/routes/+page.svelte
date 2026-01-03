<script lang="ts">
	import Board from '$lib/board.svelte';
	import Chat from '$lib/chat.svelte';
</script>

<h1>Welcome to SvelteKit</h1>
<div class="container">
	<Board />
	<Chat />
</div>

<style>
	.container {
		display: flex;
		justify-content: center;
		padding: 20px;
	}
</style>
