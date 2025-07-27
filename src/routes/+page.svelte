<script lang="ts">
	import { browser } from '$app/environment';
	import ChatMessage from '$lib/components/ChatMessage.svelte';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import {
		sessionsStore,
		currentSessionIdStore,
		settingsStore,
		createNewSession,
		getCurrentSession,
		addMessage,
		type ChatSession,
		type AppSettings
	} from '$lib/stores.js';
	import { sendMessage } from '$lib/api.js';

	let currentSession = $state<ChatSession | null>(null);
	let settings = $state<AppSettings>({ apiKey: '', model: 'gpt-4o-mini' });
	let isLoading = $state(false);
	let showSettings = $state(false);
	let error = $state<string | null>(null);

	currentSessionIdStore.subscribe(() => {
		currentSession = getCurrentSession();
	});

	settingsStore.subscribe(value => {
		settings = value;
	});

	sessionsStore.subscribe(() => {
		currentSession = getCurrentSession();
	});

	$effect(() => {
		if (browser && !currentSession && sessionsStore.value.length === 0) {
			createNewSession();
		}
	});

	async function handleSendMessage(event: CustomEvent<{ content: string; attachments: File[] }>) {
		if (!currentSession) return;
		if (!settings.apiKey) {
			showSettings = true;
			return;
		}

		const { content, attachments } = event.detail;
		error = null;
		isLoading = true;

		try {
			addMessage(currentSession.id, {
				role: 'user',
				content,
				attachments
			});

			const updatedSession = getCurrentSession();
			if (!updatedSession) return;

			const response = await sendMessage(updatedSession.messages, settings);

			addMessage(currentSession.id, {
				role: 'assistant',
				content: response
			});
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			isLoading = false;
		}
	}

	let messagesContainer: HTMLDivElement;

	function scrollToBottom() {
		if (browser && messagesContainer) {
			setTimeout(() => {
				messagesContainer.scrollTo({ 
					top: messagesContainer.scrollHeight, 
					behavior: 'smooth' 
				});
			}, 50);
		}
	}

	$effect(() => {
		if (currentSession?.messages) {
			scrollToBottom();
		}
	});
</script>

<svelte:head>
	<title>LLM UI</title>
	<meta name="description" content="Simple chat interface for OpenAI models" />
</svelte:head>

<div class="flex h-screen bg-background">
	<Sidebar on:settings-open={() => showSettings = true} />
	
	<div class="flex flex-1 flex-col">
		{#if currentSession}
			<div bind:this={messagesContainer} class="flex-1 overflow-y-auto">
				{#if currentSession.messages.length === 0}
					<div class="flex h-full items-center justify-center">
						<div class="text-center">
							<h1 class="text-2xl font-semibold mb-2">Welcome to LLM UI</h1>
							<p class="text-muted-foreground mb-4">
								{#if !settings.apiKey}
									Please configure your OpenAI API key in settings to get started.
								{:else}
									Start a conversation by typing a message below.
								{/if}
							</p>
							{#if !settings.apiKey}
								<button
									type="button"
									onclick={() => showSettings = true}
									class="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
								>
									Open Settings
								</button>
							{/if}
						</div>
					</div>
				{:else}
					{#each currentSession.messages as message (message.id)}
						<ChatMessage {message} />
					{/each}
					
					{#if isLoading}
						<div class="flex gap-3 p-4 text-sm">
							<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
								AI
							</div>
							<div class="flex-1">
								<div class="font-medium mb-2">Assistant</div>
								<div class="text-muted-foreground">Thinking...</div>
							</div>
						</div>
					{/if}
				{/if}
			</div>
			
			{#if error}
				<div class="border-t bg-destructive/10 p-4 text-sm text-destructive">
					{error}
				</div>
			{/if}
			
			<ChatInput
				disabled={isLoading || !settings.apiKey}
				placeholder={!settings.apiKey ? 'Configure API key in settings first...' : 'Type your message...'}
				on:send={handleSendMessage}
			/>
		{:else}
			<div class="flex h-full items-center justify-center">
				<div class="text-center text-muted-foreground">
					Loading...
				</div>
			</div>
		{/if}
	</div>
</div>

<Settings
	open={showSettings}
	on:close={() => showSettings = false}
/>
