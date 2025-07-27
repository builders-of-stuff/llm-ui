<script lang="ts">
	import { UI_TEXT } from '../../constants.js';
	
	interface Props {
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let { size = 'md', class: className = '' }: Props = $props();

	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-6 w-6', 
		lg: 'h-8 w-8'
	};
</script>

<div class={`animate-spin rounded-full border-2 border-muted border-t-primary ${sizeClasses[size]} ${className}`} role="status" aria-label="Loading">
	<span class="sr-only">{UI_TEXT.LOADING}</span>
</div>