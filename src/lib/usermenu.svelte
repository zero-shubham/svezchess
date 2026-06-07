<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import userIcon from '$lib/assets/user.svg';

	let menuOpen = $state(false);
	let loggingOut = $state(false);

	const API_BASE = 'http://localhost:8080/api/v1';

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}

	async function logout() {
		if (loggingOut) return;
		loggingOut = true;
		try {
			await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
		} finally {
			loggingOut = false;
			goto(resolve('/login'));
		}
	}
</script>

<button class="user-btn" onclick={toggleMenu} aria-label="User menu">
	<img src={userIcon} alt="User" width="32" height="32" />
</button>

{#if menuOpen}
	<div
		class="backdrop"
		onclick={closeMenu}
		onkeydown={(e) => e.key === 'Escape' && closeMenu()}
	></div>
	<div class="menu">
		<button class="menu-item" onclick={logout} disabled={loggingOut}>
			{loggingOut ? 'Logging out...' : 'Logout'}
		</button>
	</div>
{/if}

<style>
	.user-btn {
		position: fixed;
		bottom: 24px;
		left: 24px;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: none;
		background: var(--color-dark-accent);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		transition: background 0.15s;
		padding: 0;
	}

	.user-btn img {
		filter: invert(1);
	}

	.user-btn:hover {
		opacity: 0.9;
	}

	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 101;
	}

	.menu {
		position: fixed;
		bottom: 80px;
		left: 24px;
		z-index: 102;
		background: var(--color-dark-accent);
		border-radius: 8px;
		padding: 4px;
		min-width: 140px;
		/* box-shadow: 0 4px 16px 10px var(--color-dark-accent); */
	}

	.menu-item {
		display: block;
		width: 100%;
		padding: 10px 16px;
		border: none;
		background: none;
		color: #e0e0e0;
		font-size: 14px;
		text-align: left;
		cursor: pointer;
		border-radius: 6px;
	}

	.menu-item:hover {
		opacity: 0.8;
	}

	.menu-item:disabled {
		opacity: 0.5;
		cursor: default;
	}
</style>
