<script lang="ts">
	import { goto } from '$app/navigation';

	const API_BASE = '/api/v1';

	let email = $state('');
	let username = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const res = await fetch(`${API_BASE}/users/`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ email, username, password })
			});

			const data = await res.json();

			if (!res.ok) {
				error = data.error || 'Signup failed';
				return;
			}

			await goto('/login');
		} catch {
			error = 'Network error. Is the server running?';
		} finally {
			loading = false;
		}
	}
</script>

<div class="auth-page">
	<form class="auth-form" onsubmit={handleSubmit}>
		<h1>Sign up</h1>

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
			Full Name
			<input
				type="text"
				bind:value={username}
				required
				minlength="1"
				autocomplete="name"
				placeholder="Your full name"
			/>
		</label>

		<label>
			Password
			<input
				type="password"
				bind:value={password}
				required
				minlength="8"
				autocomplete="new-password"
				placeholder="••••••••"
			/>
		</label>

		<button type="submit" disabled={loading}>
			{loading ? 'Creating account...' : 'Sign up'}
		</button>

		<p class="switch">
			Already have an account? <a href="/login">Login</a>
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
