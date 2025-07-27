import { createOpenAI } from '@ai-sdk/openai';
import { generateText, type CoreMessage } from 'ai';
import type { ChatMessage, AppSettings } from './stores.js';

export async function sendMessage(
	messages: ChatMessage[],
	settings: AppSettings
): Promise<string> {
	if (!settings.apiKey) {
		throw new Error('OpenAI API key is required');
	}

	const openai = createOpenAI({
		apiKey: settings.apiKey,
	});

	const coreMessages: CoreMessage[] = [];
	
	// Add system message if provided
	if (settings.systemPrompt?.trim()) {
		coreMessages.push({
			role: 'system',
			content: settings.systemPrompt.trim()
		});
	}

	// Process chat messages with attachments
	for (const msg of messages) {
		if (msg.attachments && msg.attachments.length > 0) {
			// Handle messages with attachments (images)
			const parts: any[] = [{ type: 'text', text: msg.content }];
			
			for (const file of msg.attachments) {
				if (file.type.startsWith('image/')) {
					const base64 = await fileToBase64(file);
					parts.push({
						type: 'image',
						image: `data:${file.type};base64,${base64}`
					});
				}
			}
			
			coreMessages.push({
				role: msg.role,
				content: parts
			});
		} else {
			coreMessages.push({
				role: msg.role,
				content: msg.content
			});
		}
	}

	try {
		const result = await generateText({
			model: openai(settings.model as any),
			messages: coreMessages,
			maxTokens: settings.maxTokens || 2048,
			temperature: settings.temperature || 0.7,
			topP: settings.topP,
			presencePenalty: settings.presencePenalty,
			frequencyPenalty: settings.frequencyPenalty,
		});

		return result.text;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`OpenAI API Error: ${error.message}`);
		}
		throw new Error('Unknown error occurred');
	}
}

export async function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}