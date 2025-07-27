<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { settingsStore, OPENAI_MODELS, type AppSettings } from '$lib/stores.js';
	import { cn } from '$lib/utils.js';

	interface Props {
		open: boolean;
	}

	let { open }: Props = $props();

	const dispatch = createEventDispatcher<{
		close: void;
	}>();

	let settings = $state<AppSettings>({ apiKey: '', model: 'gpt-4o-mini' });
	let tempSettings = $state<AppSettings>({ apiKey: '', model: 'gpt-4o-mini' });

	settingsStore.subscribe(value => {
		settings = value;
		tempSettings = { ...value };
	});

	function handleSave() {
		settingsStore.set(tempSettings);
		dispatch('close');
	}

	function handleCancel() {
		tempSettings = { ...settings };
		dispatch('close');
	}

	function handleOverlayClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleCancel();
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		onclick={handleOverlayClick}
		onkeydown={(e) => e.key === 'Escape' && handleCancel()}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg max-h-[90vh] overflow-y-auto">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold">Settings</h2>
				<button
					type="button"
					onclick={handleCancel}
					class="text-muted-foreground hover:text-foreground"
				>
					×
				</button>
			</div>

			<div class="space-y-4">
				<div>
					<label for="api-key" class="block text-sm font-medium">
						OpenAI API Key
					</label>
					<input
						id="api-key"
						type="password"
						bind:value={tempSettings.apiKey}
						placeholder="sk-..."
						class={cn(
							'mt-1 block w-full rounded-md border bg-background px-3 py-2 text-sm',
							'placeholder:text-muted-foreground',
							'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
						)}
					/>
					<p class="mt-1 text-xs text-muted-foreground">
						Your API key is stored locally and never sent to our servers.
					</p>
				</div>

				<div>
					<label for="model" class="block text-sm font-medium">
						Model
					</label>
					<select
						id="model"
						bind:value={tempSettings.model}
						class={cn(
							'mt-1 block w-full rounded-md border bg-background px-3 py-2 text-sm',
							'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
						)}
					>
						{#each OPENAI_MODELS as model}
							<option value={model}>{model}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="max-tokens" class="block text-sm font-medium">
						Max Tokens
					</label>
					<input
						id="max-tokens"
						type="number"
						bind:value={tempSettings.maxTokens}
						min="1"
						max="4096"
						class={cn(
							'mt-1 block w-full rounded-md border bg-background px-3 py-2 text-sm',
							'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
						)}
					/>
				</div>

				<div>
					<label for="temperature" class="block text-sm font-medium">
						Temperature ({tempSettings.temperature})
					</label>
					<input
						id="temperature"
						type="range"
						bind:value={tempSettings.temperature}
						min="0"
						max="2"
						step="0.1"
						class="mt-1 block w-full"
					/>
					<div class="mt-1 flex justify-between text-xs text-muted-foreground">
						<span>More focused</span>
						<span>More creative</span>
					</div>
				</div>

				<div>
					<label for="system-prompt" class="block text-sm font-medium">
						System Prompt
					</label>
					<textarea
						id="system-prompt"
						bind:value={tempSettings.systemPrompt}
						placeholder="You are a helpful assistant..."
						rows="3"
						class={cn(
							'mt-1 block w-full resize-none rounded-md border bg-background px-3 py-2 text-sm',
							'placeholder:text-muted-foreground',
							'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
						)}
					></textarea>
					<p class="mt-1 text-xs text-muted-foreground">
						Instructions that guide the AI's behavior and personality.
					</p>
				</div>

				<div>
					<label for="top-p" class="block text-sm font-medium">
						Top P ({tempSettings.topP})
					</label>
					<input
						id="top-p"
						type="range"
						bind:value={tempSettings.topP}
						min="0"
						max="1"
						step="0.1"
						class="mt-1 block w-full"
					/>
					<div class="mt-1 flex justify-between text-xs text-muted-foreground">
						<span>Less diverse</span>
						<span>More diverse</span>
					</div>
				</div>

				<div>
					<label for="presence-penalty" class="block text-sm font-medium">
						Presence Penalty ({tempSettings.presencePenalty})
					</label>
					<input
						id="presence-penalty"
						type="range"
						bind:value={tempSettings.presencePenalty}
						min="-2"
						max="2"
						step="0.1"
						class="mt-1 block w-full"
					/>
					<div class="mt-1 flex justify-between text-xs text-muted-foreground">
						<span>Repeat topics</span>
						<span>Avoid topics</span>
					</div>
				</div>

				<div>
					<label for="frequency-penalty" class="block text-sm font-medium">
						Frequency Penalty ({tempSettings.frequencyPenalty})
					</label>
					<input
						id="frequency-penalty"
						type="range"
						bind:value={tempSettings.frequencyPenalty}
						min="-2"
						max="2"
						step="0.1"
						class="mt-1 block w-full"
					/>
					<div class="mt-1 flex justify-between text-xs text-muted-foreground">
						<span>Repeat words</span>
						<span>Avoid repetition</span>
					</div>
				</div>
			</div>

			<div class="mt-6 flex gap-2">
				<button
					type="button"
					onclick={handleCancel}
					class={cn(
						'flex-1 rounded-md border px-3 py-2 text-sm',
						'hover:bg-accent hover:text-accent-foreground'
					)}
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={handleSave}
					class={cn(
						'flex-1 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground',
						'hover:bg-primary/90'
					)}
				>
					Save
				</button>
			</div>
		</div>
	</div>
{/if}