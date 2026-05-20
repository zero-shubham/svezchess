export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
	id: number;
	message: string;
	type: ToastType;
	leaving: boolean;
}

class ToastStore {
	items = $state<Toast[]>([]);
	#nextId = 0;

	add(message: string, type: ToastType = 'info', duration = 4000): number {
		const id = this.#nextId++;
		this.items = [...this.items, { id, message, type, leaving: false }];

		if (duration > 0) {
			setTimeout(() => this.dismiss(id), duration);
		}

		return id;
	}

	dismiss(id: number) {
		this.items = this.items.map((t) => (t.id === id ? { ...t, leaving: true } : t));
		setTimeout(() => {
			this.items = this.items.filter((t) => t.id !== id);
		}, 300);
	}

	success(message: string, duration?: number) {
		return this.add(message, 'success', duration);
	}

	error(message: string, duration?: number) {
		return this.add(message, 'error', duration);
	}

	warning(message: string, duration?: number) {
		return this.add(message, 'warning', duration);
	}

	info(message: string, duration?: number) {
		return this.add(message, 'info', duration);
	}
}

export const toasts = new ToastStore();
