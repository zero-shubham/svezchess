import { toasts } from './toast.svelte.ts';

type WSType = 'GAME' | 'NOTIFICATION' | 'PING';

interface WSMessage {
	type: WSType;
	subtype?: string;
	payload?: any;
}

type Handler = (msg: WSMessage) => void;

class WSManager {
	#socket: WebSocket | null = null;
	#handlers = new Map<WSType, Set<Handler>>();
	#pingInterval: number | null = null;

	connect(url: string) {
		if (this.#socket) this.disconnect();
		const ws = new WebSocket(url);
		this.#socket = ws;

		ws.onmessage = (event) => {
			try {
				const msg: WSMessage = JSON.parse(event.data);
				if (msg.type === 'NOTIFICATION') {
					this.#handleNotification(msg);
				}
				const handlers = this.#handlers.get(msg.type);
				if (handlers) {
					for (const h of handlers) h(msg);
				}
			} catch {
				// ignore malformed
			}
		};

		ws.onclose = () => {
			this.#socket = null;
			this.#stopPing();
		};

		ws.onerror = () => {
			// onclose will fire after this
		};

		this.#startPing();
	}

	disconnect() {
		this.#stopPing();
		this.#socket?.close();
		this.#socket = null;
	}

	#startPing() {
		this.#stopPing();
		this.#pingInterval = window.setInterval(() => {
			this.send({ type: 'PING' });
		}, 60_000);
	}

	#stopPing() {
		if (this.#pingInterval !== null) {
			clearInterval(this.#pingInterval);
			this.#pingInterval = null;
		}
	}

	send(msg: WSMessage) {
		if (this.#socket?.readyState === WebSocket.OPEN) {
			this.#socket.send(JSON.stringify(msg));
		}
	}

	on(type: WSType, handler: Handler) {
		if (!this.#handlers.has(type)) {
			this.#handlers.set(type, new Set());
		}
		this.#handlers.get(type)!.add(handler);
	}

	off(type: WSType, handler: Handler) {
		this.#handlers.get(type)?.delete(handler);
	}

	#handleNotification(msg: WSMessage) {
		const text = typeof msg.payload === 'string' ? msg.payload : JSON.stringify(msg.payload);
		switch (msg.subtype) {
			case 'success':
				toasts.success(text);
				break;
			case 'error':
				toasts.error(text);
				break;
			case 'warn':
				toasts.warning(text);
				break;
			case 'info':
				toasts.info(text);
				break;
			default:
				toasts.info(text);
		}
	}
}

export const ws = new WSManager();
export type { WSMessage, WSType, Handler };
