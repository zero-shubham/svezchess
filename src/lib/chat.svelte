<script lang="ts">
	type Actor = 'instructor' | 'student';

	interface Message {
		actor: Actor;
		message: string;
	}

	export let messages: Message[] = [
		{ actor: 'instructor', message: 'Welcome to the chess lesson!' },
		{ actor: 'student', message: 'Hello, I am ready to learn.' }
	];

	let minimized = false;
	let newMessage = '';

	function toggle() {
		minimized = !minimized;
	}

	function sendMessage() {
		if (newMessage.trim()) {
			messages = [...messages, { actor: 'student', message: newMessage }];
			newMessage = '';
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			sendMessage();
		}
	}
</script>

<div class="chat-window" class:minimized>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="header" on:click={toggle}>
		<span class="title">Chat</span>
		<button class="toggle-btn">
			{minimized ? '▲' : '▼'}
		</button>
	</div>

	{#if !minimized}
		<div class="content">
			<div class="messages">
				{#each messages as msg}
					<div class="message-row {msg.actor}">
						<div class="bubble">
							<span class="actor-label">{msg.actor}</span>
							<p>{msg.message}</p>
						</div>
					</div>
				{/each}
			</div>
			<div class="input-area">
				<input
					type="text"
					placeholder="Type your queries..."
					bind:value={newMessage}
					on:keydown={handleKeydown}
				/>
				<button on:click={sendMessage}>Send</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.chat-window {
		position: fixed;
		bottom: 0;
		right: 20px;
		width: 300px;
		background-color: white;
		border-radius: 8px 8px 0 0;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		border: 1px solid #ccc;
		font-family: sans-serif;
		z-index: 1000;
		transition: transform 0.3s ease;
	}

	.chat-window.minimized {
		width: 200px;
	}

	.header {
		background-color: #3b4953;
		color: white;
		padding: 10px 15px;
		border-radius: 8px 8px 0 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
		user-select: none;
		transition:
			background-color 0.2s,
			opacity 0.2s;
	}

	.header:hover {
		background-color: rgba(59, 73, 83, 0.9);
	}

	.title {
		font-weight: bold;
	}

	.toggle-btn {
		background: none;
		border: none;
		color: white;
		font-size: 1.2rem;
		cursor: pointer;
		padding: 0;
	}

	.content {
		height: 350px;
		display: flex;
		flex-direction: column;
		background-color: #f9f9f9;
	}

	.messages {
		flex: 1;
		overflow-y: auto;
		padding: 10px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.message-row {
		display: flex;
	}

	.message-row.instructor {
		justify-content: flex-start;
	}

	.message-row.student {
		justify-content: flex-end;
	}

	.bubble {
		max-width: 80%;
		padding: 8px 12px;
		border-radius: 12px;
		position: relative;
		font-size: 0.9rem;
		line-height: 1.4;
	}

	.instructor .bubble {
		background-color: #e0e0e0;
		color: #333;
		border-bottom-left-radius: 2px;
	}

	.student .bubble {
		background-color: #5a7863;
		color: white;
		border-bottom-right-radius: 2px;
	}

	.actor-label {
		display: block;
		font-size: 0.7rem;
		margin-bottom: 2px;
		opacity: 0.8;
		text-transform: uppercase;
		font-weight: bold;
	}

	p {
		margin: 0;
	}

	.input-area {
		display: flex;
		padding: 10px;
		border-top: 1px solid #eee;
		background-color: white;
	}

	.input-area input {
		flex: 1;
		padding: 8px;
		border: 1px solid #ddd;
		border-radius: 4px;
		margin-right: 8px;
		outline: none;
	}

	.input-area input:focus {
		border-color: #5a7863;
	}

	.input-area button {
		padding: 8px 15px;
		background-color: #4a6352;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.input-area button:hover {
		opacity: 0.9;
	}
</style>
