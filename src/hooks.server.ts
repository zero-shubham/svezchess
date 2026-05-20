import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

const API_BASE = 'http://localhost:8080/api/v1';
const CACHE_TTL = 60_000;

const userCache = new Map<string, { user: App.Locals['user']; at: number }>();

function isProtected(id: string | null): boolean {
	if (!id) return false;
	return id.startsWith('/(protected)');
}

async function getUser(sessionToken: string | undefined): Promise<App.Locals['user'] | null> {
	if (!sessionToken) return null;

	const cached = userCache.get(sessionToken);
	if (cached && Date.now() - cached.at < CACHE_TTL) {
		return cached.user;
	}

	try {
		const res = await fetch(`${API_BASE}/auth/me`, {
			headers: { Cookie: `session_token=${sessionToken}` }
		});
		if (!res.ok) {
			userCache.delete(sessionToken);
			return null;
		}
		const user = await res.json();
		userCache.set(sessionToken, { user, at: Date.now() });
		return user;
	} catch {
		return null;
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get('session_token');

	if (isProtected(event.route.id)) {
		const user = await getUser(sessionToken);
		if (!user) {
			throw redirect(307, '/login');
		}
		event.locals.user = user;
	}

	return resolve(event);
};
