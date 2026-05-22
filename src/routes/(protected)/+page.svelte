<script lang="ts">
	import Board from '$lib/board.svelte';
	import Chat from '$lib/chat.svelte';
	import UserMenu from '$lib/usermenu.svelte';
	import { ws } from '../../lib/ws.svelte.ts';
	import type { InstructorMove } from '$lib/types';
	import type { WSMessage } from '../../lib/ws.svelte.ts';

	type Actor = 'instructor' | 'student';
	interface Message {
		actor: Actor;
		message: string;
	}

	function squareToRowCol(square: string): [number, number] {
		const col = square.charCodeAt(0) - 97;
		const row = 8 - parseInt(square[1]);
		return [row, col];
	}

	function rowColToLAN(from: { r: number; c: number }, to: { r: number; c: number }): string {
		const fromFile = String.fromCharCode(97 + from.c);
		const fromRank = 8 - from.r;
		const toFile = String.fromCharCode(97 + to.c);
		const toRank = 8 - to.r;
		return `${fromFile}${fromRank}-${toFile}${toRank}`;
	}

	function lanToInstructorMove(lan: string): InstructorMove | null {
		const dashIndex = lan.indexOf('-');
		if (dashIndex === -1) return null;
		const from = lan.substring(0, dashIndex);
		const toRaw = lan.substring(dashIndex + 1);
		const to = toRaw.replace(/[qrbnQRBN]$/, '');
		const [fromR, fromC] = squareToRowCol(from);
		const [toR, toC] = squareToRowCol(to);
		return { currentPosition: [fromR, fromC], movePosition: [toR, toC] };
	}

	let instructorMove: InstructorMove | null = $state(null);
	let chatMessages: Message[] = $state([]);

	$effect(() => {
		// const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		// ws.connect(`${protocol}//${window.location.host}/api/v1/ws/game`);
		// return () => ws.disconnect();
	});

	$effect(() => {
		function handleGameMessage(msg: WSMessage) {
			if (msg.subtype === 'explain') {
				const payload = msg.payload as { message: string } | undefined;
				if (payload?.message) {
					chatMessages = [...chatMessages, { actor: 'instructor', message: payload.message }];
				}
			} else if (msg.subtype === 'move_result') {
				const text = typeof msg.payload === 'string' ? msg.payload : JSON.stringify(msg.payload);
				chatMessages = [...chatMessages, { actor: 'instructor', message: text }];
			} else if (msg.subtype === 'move') {
				const payload = msg.payload as { move: string } | undefined;
				if (payload?.move) {
					const parsed = lanToInstructorMove(payload.move);
					if (parsed) instructorMove = { ...parsed };
				}
			}
		}
		ws.on('GAME', handleGameMessage);
		return () => ws.off('GAME', handleGameMessage);
	});

	function handleInvalidInstructorMove(reason: string) {
		ws.send({ type: 'GAME', subtype: 'error', payload: `invalid instructor move: ${reason}` });
	}

	function handleSendMessage(text: string) {
		chatMessages = [...chatMessages, { actor: 'student', message: text }];
		ws.send({ type: 'GAME', subtype: 'explain', payload: text });
	}

	function handleStudentMove(move: { from: { r: number; c: number }; to: { r: number; c: number }; fen: string }) {
		const lan = rowColToLAN(move.from, move.to);
		ws.send({ type: 'GAME', subtype: 'move', payload: { move: lan, fen: move.fen } });
	}
</script>

<div class="container">
		<Board flip={false} {instructorMove} {handleInvalidInstructorMove} onstudentmove={handleStudentMove} />
	<Chat messages={chatMessages} onsend={handleSendMessage} />
</div>

<UserMenu />

<style>
	.container {
		display: flex;
		justify-content: center;
		padding: 20px;
	}
</style>
