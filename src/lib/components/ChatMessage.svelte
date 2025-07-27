<script lang="ts">
	import type { ChatMessage } from '$lib/stores.js';
	import { cn } from '$lib/utils.js';
	import { MESSAGE_ROLES, UI_TEXT, AVATARS } from '$lib/constants.js';

	interface Props {
		message: ChatMessage;
	}

	let { message }: Props = $props();

	function formatTime(timestamp: number): string {
		return new Date(timestamp).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatContent(content: string): string {
		return content.replace(/\n/g, '<br>');
	}
</script>

<div
	class={cn(
		'group flex w-full gap-3 p-4 text-sm',
		message.role === MESSAGE_ROLES.USER ? 'bg-muted/50' : 'bg-background'
	)}
>
	<div
		class={cn(
			'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full text-xs font-medium',
			message.role === MESSAGE_ROLES.USER 
				? 'bg-primary text-primary-foreground' 
				: 'bg-secondary text-secondary-foreground'
		)}
	>
		{message.role === MESSAGE_ROLES.USER ? AVATARS.USER_INITIAL : AVATARS.AI_INITIAL}
	</div>
	
	<div class="flex-1 space-y-2 overflow-hidden">
		<div class="flex items-center gap-2">
			<span class="font-medium capitalize">
				{message.role === MESSAGE_ROLES.USER ? UI_TEXT.YOU : UI_TEXT.ASSISTANT}
			</span>
			<span class="text-xs text-muted-foreground">
				{formatTime(message.timestamp)}
			</span>
		</div>
		
		<div class="prose prose-sm max-w-none text-foreground">
			{@html formatContent(message.content)}
		</div>
		
		{#if message.attachments && message.attachments.length > 0}
			<div class="flex flex-wrap gap-2">
				{#each message.attachments as file}
					<div class="rounded border bg-muted px-2 py-1 text-xs">
						📎 {file.name}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>