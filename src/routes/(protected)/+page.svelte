<script lang="ts">
	import Board from '$lib/board.svelte';
	import Captured from '$lib/captured.svelte';
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

	type CapturedPayload = { white: string[]; black: string[] };

	let instructorMove: InstructorMove | null = $state(null);
	let chatMessages: Message[] = $state([]);
	let fenState: string | null = $state(null);
	let flip = $state(false);
	let capturedPieces: CapturedPayload = $state({
		white: [],
		black: []
	});

	$effect(() => {
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		ws.connect(`${protocol}//${window.location.host}/api/v1/ws/game`);
		return () => ws.disconnect();
	});

	$effect(() => {
		function handleGameMessage(msg: WSMessage) {
			if (msg.subtype === 'explain') {
				const payload = msg.payload as { message: string } | undefined;
				if (payload?.message) {
					chatMessages = [...chatMessages, { actor: 'instructor', message: payload.message }];
				}
			} else if (msg.subtype === 'start_game') {
				const payload = msg.payload as
					| { level: number; fen: string; white: string; session_id?: string }
					| undefined;
				if (payload?.fen) {
					fenState = payload.fen;
				}
				if (payload?.white) {
					flip = payload.white === 'instructor';
				}
			} else if (msg.subtype === 'move') {
				const payload = msg.payload as { move: string; fen: string; message: string } | undefined;
				if (payload?.move) {
					instructorMove = { san: payload.move, fen: payload.fen ?? '' };
				}
			} else if (msg.subtype === 'move_result') {
				const payload = msg.payload as { grade: string; delta: number; reason: string } | undefined;
				if (payload) {
					chatMessages = [
						...chatMessages,
						{
							actor: 'instructor',
							message: `Score: ${payload.grade} (${payload.delta >= 0 ? '+' : ''}${payload.delta})`
						}
					];
				}
			} else if (msg.subtype === 'captured') {
				const payload = msg.payload as CapturedPayload | undefined;

				if (payload) {
					capturedPieces = payload;
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
		ws.send({ type: 'GAME', subtype: 'query', payload: { query: text, fen: fenState ?? '' } });
	}

	function handleStudentMove(san: string, fen: string) {
		ws.send({ type: 'GAME', subtype: 'move', payload: { move: san, fen: fen } });
	}

	function handleCapture(captured: { white?: string; black?: string }) {
		if ((flip && captured.white) || (!flip && captured.black)) {
			return;
		}

		capturedPieces = {
			white: captured.white ? [...capturedPieces.white, captured.white] : capturedPieces.white,
			black: captured.black ? [...capturedPieces.black, captured.black] : capturedPieces.black
		};
	}
</script>

<div class="container">
	<div class="board-area">
		<Captured pieces={!flip ? capturedPieces.black : capturedPieces.white} />
		<Board
			{flip}
			{instructorMove}
			{handleInvalidInstructorMove}
			onstudentmove={handleStudentMove}
			oncapture={handleCapture}
			bind:fenState
		/>
		<Captured pieces={!flip ? capturedPieces.white : capturedPieces.black} />
	</div>
	<Chat messages={chatMessages} onsend={handleSendMessage} />
</div>

<UserMenu />

<style>
	.container {
		display: flex;
		justify-content: center;
		padding: 20px;
	}

	.board-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		max-width: 600px;
		width: 100%;
	}
</style>
