<script lang="ts">
	import Board from '$lib/board.svelte';
	import Chat from '$lib/chat.svelte';
</script>

<div class="container">
	<Board flip={false}/>
	<Chat />
</div>

<style>
	.container {
		display: flex;
		justify-content: center;
		padding: 20px;
	}
</style>
