<script lang="ts">
	import { toasts } from './toast.svelte.ts';
	import type { ToastType } from './toast.svelte.ts';
</script>

{#if toasts.items.length > 0}
	<div class="toast-container">
		{#each toasts.items as t (t.id)}
			<button
				class="toast toast-{t.type}"
				class:leaving={t.leaving}
				onclick={() => toasts.dismiss(t.id)}
			>
				<span class="toast-icon">
					{#if t.type === 'success'}
						✓
					{:else if t.type === 'error'}
						✕
					{:else if t.type === 'warning'}
						⚠
					{:else}
						ℹ
					{/if}
				</span>
				<span class="toast-message">{t.message}</span>
			</button>
		{/each}
	</div>
{/if}

<style>
	.toast-container {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: 360px;
	}

	.toast {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.75rem 1rem;
		border: none;
		border-radius: 6px;
		font-size: 0.9rem;
		line-height: 1.3;
		cursor: pointer;
		color: #fff;
		text-align: left;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
		animation: slide-in 0.25s ease-out;
		transition:
			opacity 0.3s ease,
			transform 0.3s ease;
	}

	.toast.leaving {
		opacity: 0;
		transform: translateX(100%);
	}

	.toast-success {
		background-color: var(--color-success);
	}

	.toast-error {
		background-color: var(--color-error);
	}

	.toast-warning {
		background-color: #b8860b;
	}

	.toast-info {
		background-color: #3b4953;
	}

	.toast-icon {
		flex-shrink: 0;
		font-size: 1rem;
		line-height: 1;
	}

	.toast-message {
		flex: 1;
	}

	@keyframes slide-in {
		from {
			opacity: 0;
			transform: translateX(100%);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>
