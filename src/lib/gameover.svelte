<script lang="ts">
	export let winner: 'white' | 'black' | 'draw' | null = null;
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{#if winner}
	<div class="game-over-container">
		<div class="message">
			{#if winner === 'draw'}
				<p>STALEMATE!</p>
			{:else}
				<p>CHECK MATE!</p>
				<p class="sub-text">{winner.toUpperCase()} WINS</p>
			{/if}
		</div>
	</div>
{/if}

<style>
	.game-over-container {
		position: absolute;
		bottom: 40%;
		left: 50%;
		transform: translateX(-50%);
		padding: 15px 30px;
		border-radius: 8px;
		z-index: 100;
		pointer-events: none;
		white-space: nowrap;
	}

	.message {
		font-family: 'Press Start 2P', system-ui;
		color: var(--color-error);
		text-align: center;
		text-shadow: 2px 2px 0px #000;
		font-size: 1.5rem;
		animation: pulse 2s infinite;
	}

	.sub-text {
		font-size: 0.8rem;
		color: var(--color-success);
		margin-top: 10px;
		text-shadow: 1px 1px 0px #000;
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
		100% {
			transform: scale(1);
		}
	}
</style>
