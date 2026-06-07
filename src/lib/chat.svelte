<script lang="ts">
	type Actor = 'instructor' | 'student';

	interface Message {
		actor: Actor;
		message: string;
	}

	let { messages = [], onsend }: { messages?: Message[]; onsend?: (text: string) => void } =
		$props();

	let minimized = $state(false);
	let newMessage = $state('');
	let isSmallScreen = $state(false);

	$effect(() => {
		const mql = window.matchMedia('(max-width: 800px)');
		isSmallScreen = mql.matches;
		const handler = (e: MediaQueryListEvent) => (isSmallScreen = e.matches);
		mql.addEventListener('change', handler);
		return () => mql.removeEventListener('change', handler);
	});

	function toggle() {
		if (!isSmallScreen) return;
		minimized = !minimized;
	}

	function sendMessage() {
		if (newMessage.trim()) {
			onsend?.(newMessage);
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
	<div class="header" onclick={toggle}>
		<span class="title">Chat</span>
		<button class="toggle-btn">
			{minimized ? '▲' : '▼'}
		</button>
	</div>

	{#if !minimized || !isSmallScreen}
		<div class="content">
			<div class="messages">
				{#if messages.length === 0}
					<div class="empty-state">Wait for your instructor to begin..</div>
				{/if}
				{#each messages as msg, i (i)}
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
					onkeydown={handleKeydown}
					disabled={messages.length === 0}
				/>
				<button disabled={messages.length === 0} onclick={sendMessage}>Send</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.chat-window {
		position: fixed;
		bottom: 0;
		right: 0px;
		width: 400px;
		height: 100%;
		background-color: white;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		border: 1px solid #ccc;
		font-family: sans-serif;
		z-index: 1000;
		transition: transform 0.3s ease;
	}

	.chat-window.minimized {
		/* width: 200px; */
	}

	.header {
		background-color: var(--color-dark-accent);
		color: white;
		padding: 10px 15px;
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

	@media (min-width: 801px) {
		.toggle-btn {
			display: none;
		}

		.header {
			cursor: default;
		}
	}

	.content {
		height: 95%;
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

	.empty-state {
		text-align: center;
		color: #999;
		font-style: italic;
		margin: auto;
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
		background-color: var(--color-success);
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
		border-color: var(--color-success);
	}

	.input-area button {
		padding: 8px 15px;
		background-color: var(--color-success);
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.input-area button:hover {
		opacity: 0.9;
	}

	.input-area button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	@media (max-width: 800px) {
		.chat-window {
			position: fixed;
			bottom: 0;
			width: 90%;
			right: auto;
			left: 50%;
			transform: translateX(-50%);
			max-height: 50%;
			display: flex;
			flex-direction: column;
			min-height: fit-content;
			border-radius: 8px 8px 0 0;
		}

		.header {
			border-radius: 8px 8px 0 0;
		}

		.content {
			flex: 1;
			height: auto;
			min-height: 0;
		}
	}
</style>
