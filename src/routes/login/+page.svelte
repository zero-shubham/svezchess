<script lang="ts">
	import { goto } from '$app/navigation';

	const API_BASE = '/api/v1';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		const body = { email, password };

		try {
			const res = await fetch(`${API_BASE}/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(body)
			});

			const data = await res.json();

			if (!res.ok) {
				error = data.error || 'Login failed';
				return;
			}

			await goto('/');
		} catch {
			error = 'Network error. Is the server running?';
		} finally {
			loading = false;
		}
	}
</script>

<div class="auth-page">
	<form class="auth-form" onsubmit={handleSubmit}>
		<h1>Login</h1>

		{#if error}
			<p class="error">{error}</p>
		{/if}

		<label>
			Email
			<input
				type="email"
				bind:value={email}
				required
				autocomplete="email"
				placeholder="user@example.com"
			/>
		</label>

		<label>
			Password
			<input
				type="password"
				bind:value={password}
				required
				autocomplete="current-password"
				placeholder="••••••••"
			/>
		</label>

		<button type="submit" disabled={loading}>
			{loading ? 'Logging in...' : 'Login'}
		</button>

		<p class="switch">
			Don't have an account? <a href="/signup">Sign up</a>
		</p>
	</form>
</div>

<style>
	.auth-page {
		display: flex;
		justify-content: center;
		padding: 40px 20px;
	}

	.auth-form {
		width: 100%;
		max-width: 360px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	h1 {
		margin: 0;
		font-size: 1.5rem;
		text-align: center;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 0.875rem;
		color: #555;
	}

	input {
		padding: 8px 12px;
		border: 1px solid #ccc;
		border-radius: 6px;
		font-size: 1rem;
		outline: none;
		transition: border-color 0.15s;
	}

	input:focus {
		border-color: var(--color-dark-accent);
	}

	button {
		padding: 10px;
		background: var(--color-dark-accent);
		color: #fff;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		cursor: pointer;
		transition: filter 0.15s;
	}

	button:hover:not(:disabled) {
		filter: brightness(0.85);
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.error {
		margin: 0;
		color: #d32f2f;
		font-size: 0.875rem;
		text-align: center;
		background: #fdecea;
		padding: 8px;
		border-radius: 6px;
	}

	.switch {
		margin: 0;
		font-size: 0.875rem;
		text-align: center;
		color: #555;
	}

	.switch a {
		color: var(--color-dark-accent);
		text-decoration: none;
	}

	.switch a:hover {
		text-decoration: underline;
	}
</style>
