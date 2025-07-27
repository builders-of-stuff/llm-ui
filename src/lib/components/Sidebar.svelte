<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { sessionsStore, currentSessionIdStore, createNewSession, deleteSession, type ChatSession } from '$lib/stores.js';
	import { cn } from '$lib/utils.js';

	const dispatch = createEventDispatcher<{
		'settings-open': void;
	}>();

	let sessions = $state<ChatSession[]>([]);
	let currentSessionId = $state<string | null>(null);

	sessionsStore.subscribe(value => sessions = value);
	currentSessionIdStore.subscribe(value => currentSessionId = value);

	function handleNewChat() {
		createNewSession();
	}

	function handleSelectSession(sessionId: string) {
		currentSessionIdStore.set(sessionId);
	}

	function handleDeleteSession(event: Event, sessionId: string) {
		event.stopPropagation();
		if (confirm('Delete this chat?')) {
			deleteSession(sessionId);
		}
	}

	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		if (date.toDateString() === today.toDateString()) {
			return 'Today';
		} else if (date.toDateString() === yesterday.toDateString()) {
			return 'Yesterday';
		} else {
			return date.toLocaleDateString();
		}
	}
</script>

<div class="flex h-full w-64 flex-col border-r bg-muted/30">
	<div class="border-b p-4">
		<button
			type="button"
			onclick={handleNewChat}
			class={cn(
				'flex w-full items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm',
				'hover:bg-accent hover:text-accent-foreground'
			)}
		>
			<span class="text-base">+</span>
			New Chat
		</button>
	</div>

	<div class="flex-1 overflow-y-auto p-2">
		{#if sessions.length === 0}
			<div class="p-4 text-center text-sm text-muted-foreground">
				No chats yet
			</div>
		{:else}
			{#each sessions as session (session.id)}
				<div
					class={cn(
						'group flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm',
						'hover:bg-accent hover:text-accent-foreground cursor-pointer',
						currentSessionId === session.id ? 'bg-accent text-accent-foreground' : ''
					)}
					onclick={() => handleSelectSession(session.id)}
					onkeydown={(e) => e.key === 'Enter' && handleSelectSession(session.id)}
					role="button"
					tabindex="0"
				>
					<div class="flex-1 overflow-hidden">
						<div class="truncate font-medium">
							{session.title}
						</div>
						<div class="text-xs text-muted-foreground">
							{formatDate(session.updatedAt)}
						</div>
					</div>
					
					<button
						type="button"
						onclick={(e) => handleDeleteSession(e, session.id)}
						class={cn(
							'opacity-0 hover:text-destructive group-hover:opacity-100',
							'transition-opacity'
						)}
						title="Delete chat"
					>
						🗑
					</button>
				</div>
			{/each}
		{/if}
	</div>

	<div class="border-t p-4">
		<button
			type="button"
			onclick={() => dispatch('settings-open')}
			class={cn(
				'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm',
				'hover:bg-accent hover:text-accent-foreground'
			)}
		>
			<span class="text-base">⚙️</span>
			Settings
		</button>
	</div>
</div>