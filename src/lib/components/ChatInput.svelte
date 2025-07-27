<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { cn } from '$lib/utils.js';

	interface Props {
		disabled?: boolean;
		placeholder?: string;
	}

	let { disabled = false, placeholder = 'Type your message...' }: Props = $props();

	const dispatch = createEventDispatcher<{
		send: { content: string; attachments: File[] };
	}>();

	let textarea: HTMLTextAreaElement;
	let content = $state('');
	let attachments = $state<File[]>([]);
	let fileInput: HTMLInputElement;
	let isDragOver = $state(false);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSend();
		}
	}

	function handleSend() {
		if (!content.trim() && attachments.length === 0) return;
		
		dispatch('send', { content: content.trim(), attachments: [...attachments] });
		content = '';
		attachments = [];
		
		if (textarea) {
			textarea.style.height = 'auto';
		}
	}

	function handleInput() {
		if (textarea) {
			textarea.style.height = 'auto';
			textarea.style.height = textarea.scrollHeight + 'px';
		}
	}

	function handleFileSelect() {
		if (fileInput?.files) {
			attachments = [...attachments, ...Array.from(fileInput.files)];
			fileInput.value = '';
		}
	}

	function removeAttachment(index: number) {
		attachments = attachments.filter((_, i) => i !== index);
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		isDragOver = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		isDragOver = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		isDragOver = false;

		const files = event.dataTransfer?.files;
		if (files) {
			const newFiles = Array.from(files).filter(file => {
				// Filter for supported file types
				const supportedTypes = ['image/', 'text/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
				return supportedTypes.some(type => file.type.startsWith(type)) || 
					   ['.pdf', '.doc', '.docx', '.txt', '.md'].some(ext => file.name.toLowerCase().endsWith(ext));
			});
			attachments = [...attachments, ...newFiles];
		}
	}
</script>

<div 
	class={cn(
		"border-t bg-background p-4 transition-colors",
		isDragOver && "bg-accent/50 border-accent"
	)}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
>
	{#if isDragOver}
		<div class="mb-3 rounded-lg border-2 border-dashed border-accent bg-accent/10 p-4 text-center text-sm text-muted-foreground">
			Drop files here to attach them
		</div>
	{/if}

	{#if attachments.length > 0}
		<div class="mb-3 flex flex-wrap gap-2">
			{#each attachments as file, index}
				<div class="flex items-center gap-2 rounded border bg-muted px-2 py-1 text-xs">
					<span>📎 {file.name}</span>
					<button
						type="button"
						onclick={() => removeAttachment(index)}
						class="text-muted-foreground hover:text-foreground"
					>
						×
					</button>
				</div>
			{/each}
		</div>
	{/if}

	<div class="flex gap-2">
		<div class="relative flex-1">
			<textarea
				bind:this={textarea}
				bind:value={content}
				{disabled}
				{placeholder}
				rows="1"
				class={cn(
					'max-h-32 min-h-[2.5rem] w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm',
					'placeholder:text-muted-foreground',
					'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
					'disabled:cursor-not-allowed disabled:opacity-50'
				)}
				onkeydown={handleKeydown}
				oninput={handleInput}
			></textarea>
		</div>

		<div class="flex gap-1">
			<input
				bind:this={fileInput}
				type="file"
				multiple
				accept="image/*,text/*,.pdf,.doc,.docx"
				class="hidden"
				onchange={handleFileSelect}
			/>
			
			<button
				type="button"
				onclick={() => fileInput?.click()}
				{disabled}
				class={cn(
					'flex h-10 w-10 items-center justify-center rounded-lg border text-sm',
					'hover:bg-accent hover:text-accent-foreground',
					'disabled:cursor-not-allowed disabled:opacity-50'
				)}
				title="Attach file"
			>
				📎
			</button>

			<button
				type="button"
				onclick={handleSend}
				disabled={disabled || (!content.trim() && attachments.length === 0)}
				class={cn(
					'flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm',
					'hover:bg-primary/90',
					'disabled:cursor-not-allowed disabled:opacity-50'
				)}
				title="Send message"
			>
				↗
			</button>
		</div>
	</div>
</div>