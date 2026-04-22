<script lang="ts">
	import Board from '$lib/board.svelte';
	import Chat from '$lib/chat.svelte';
	import type { InstructorMove } from '$lib/types';

	let instructorMove: InstructorMove | null = $state(null);
</script>

		<!-- { actor: 'instructor', message: 'Welcome to the chess lesson!' },
		{ actor: 'student', message: 'Hello, I am ready to learn.' } -->

<div class="container">
	<Board flip={false} {instructorMove} handleInvalidInstructorMove={()=> alert("invalid move")}/>
	<Chat />
</div>

<style>
	.container {
		display: flex;
		justify-content: center;
		padding: 20px;
	}
</style>
