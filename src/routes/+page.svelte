<script lang="ts">
	import { browser } from '$app/environment';
	import ChatMessage from '$lib/components/ChatMessage.svelte';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import {
		sessionsStore,
		currentSessionIdStore,
		settingsStore,
		createNewSession,
		getCurrentSession,
		addMessage,
		updateMessageContent,
		type ChatSession,
		type AppSettings
	} from '$lib/stores.js';
	import { streamMessage } from '$lib/api.js';
	import { MESSAGE_ROLES, UI_TEXT, MESSAGES, PLACEHOLDERS, AVATARS } from '$lib/constants.js';

	let currentSession = $state<ChatSession | null>(null);
	let settings = $state<AppSettings>({ apiKey: '', model: 'gpt-4.1' });
	let isLoading = $state(false);
	let isStreaming = $state(false);
	let showSettings = $state(false);
	let error = $state<string | null>(null);

	currentSessionIdStore.subscribe(() => {
		currentSession = getCurrentSession();
	});

	settingsStore.subscribe((value) => {
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
				role: MESSAGE_ROLES.USER,
				content,
				attachments
			});

			const updatedSession = getCurrentSession();
			if (!updatedSession) return;

			// Show loading state first
			await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay for UX

			// Create a placeholder message for the assistant response
			const assistantMessage = addMessage(currentSession.id, {
				role: MESSAGE_ROLES.ASSISTANT,
				content: ''
			});

			isLoading = false;
			isStreaming = true;

			// Stream the response
			let fullResponse = '';
			for await (const chunk of streamMessage(updatedSession.messages, settings)) {
				fullResponse += chunk;
				updateMessageContent(currentSession.id, assistantMessage.id, fullResponse);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			isLoading = false;
			isStreaming = false;
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
	<Sidebar onsettingsopen={() => (showSettings = true)} />

	<div class="flex flex-1 flex-col">
		{#if currentSession}
			<div bind:this={messagesContainer} class="flex-1 overflow-y-auto">
				{#if currentSession.messages.length === 0}
					<div class="flex h-full items-center justify-center">
						<div class="text-center">
							<h1 class="mb-2 text-2xl font-semibold">{UI_TEXT.WELCOME_TITLE}</h1>
							<p class="mb-4 text-muted-foreground">
								{#if !settings.apiKey}
									{MESSAGES.API_KEY_REQUIRED}
								{:else}
									{MESSAGES.START_CONVERSATION}
								{/if}
							</p>
							{#if !settings.apiKey}
								<button
									type="button"
									onclick={() => (showSettings = true)}
									class="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
								>
									{UI_TEXT.OPEN_SETTINGS}
								</button>
							{/if}
						</div>
					</div>
				{:else}
					{#each currentSession.messages as message (message.id)}
						<ChatMessage {message} />
					{/each}

					{#if isLoading || isStreaming}
						<div class="flex gap-3 p-4 text-sm">
							<div
								class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground"
							>
								{AVATARS.AI_INITIAL}
							</div>
							<div class="flex-1">
								<div class="mb-2 font-medium">{UI_TEXT.ASSISTANT}</div>
								<div class="flex items-center gap-2 text-muted-foreground">
									<Spinner size="sm" />
									<span>{isLoading ? UI_TEXT.THINKING : UI_TEXT.TYPING}</span>
								</div>
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
				disabled={isLoading || isStreaming || !settings.apiKey}
				placeholder={!settings.apiKey
					? PLACEHOLDERS.MESSAGE_NO_API_KEY
					: PLACEHOLDERS.MESSAGE_DEFAULT}
				on:send={handleSendMessage}
			/>
		{:else}
			<div class="flex h-full items-center justify-center">
				<div class="text-center text-muted-foreground">{UI_TEXT.LOADING}</div>
			</div>
		{/if}
	</div>
</div>

<Settings open={showSettings} onclose={() => (showSettings = false)} />
