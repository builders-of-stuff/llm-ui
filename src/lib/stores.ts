import { browser } from '$app/environment';

export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: number;
	attachments?: File[];
}

export interface ChatSession {
	id: string;
	title: string;
	messages: ChatMessage[];
	createdAt: number;
	updatedAt: number;
}

export interface AppSettings {
	apiKey: string;
	model: string;
	maxTokens?: number;
	temperature?: number;
	systemPrompt?: string;
	topP?: number;
	presencePenalty?: number;
	frequencyPenalty?: number;
}

const STORAGE_KEYS = {
	SESSIONS: 'llm-ui-sessions',
	SETTINGS: 'llm-ui-settings',
	CURRENT_SESSION: 'llm-ui-current-session'
} as const;

export const OPENAI_MODELS = [
	'gpt-4o',
	'gpt-4o-mini',
	'gpt-4-turbo',
	'gpt-4',
	'gpt-3.5-turbo'
] as const;

class LocalStorageStore<T> {
	private key: string;
	private defaultValue: T;
	private listeners: Set<(value: T) => void> = new Set();
	private _value: T;

	constructor(key: string, defaultValue: T) {
		this.key = key;
		this.defaultValue = defaultValue;
		this._value = this.load();
	}

	private load(): T {
		if (!browser) return this.defaultValue;
		try {
			const stored = localStorage.getItem(this.key);
			return stored ? JSON.parse(stored) : this.defaultValue;
		} catch {
			return this.defaultValue;
		}
	}

	private save(value: T): void {
		if (!browser) return;
		try {
			localStorage.setItem(this.key, JSON.stringify(value));
		} catch (error) {
			console.error(`Failed to save to localStorage: ${error}`);
		}
	}

	get value(): T {
		return this._value;
	}

	set(value: T): void {
		this._value = value;
		this.save(value);
		this.listeners.forEach(listener => listener(value));
	}

	update(updater: (value: T) => T): void {
		this.set(updater(this._value));
	}

	subscribe(listener: (value: T) => void): () => void {
		this.listeners.add(listener);
		listener(this._value);
		return () => this.listeners.delete(listener);
	}
}

export const sessionsStore = new LocalStorageStore<ChatSession[]>(STORAGE_KEYS.SESSIONS, []);
export const settingsStore = new LocalStorageStore<AppSettings>(STORAGE_KEYS.SETTINGS, {
	apiKey: '',
	model: 'gpt-4o-mini',
	maxTokens: 2048,
	temperature: 0.7,
	systemPrompt: '',
	topP: 1.0,
	presencePenalty: 0,
	frequencyPenalty: 0
});
export const currentSessionIdStore = new LocalStorageStore<string | null>(STORAGE_KEYS.CURRENT_SESSION, null);

export function createNewSession(): ChatSession {
	const session: ChatSession = {
		id: crypto.randomUUID(),
		title: 'New Chat',
		messages: [],
		createdAt: Date.now(),
		updatedAt: Date.now()
	};
	
	sessionsStore.update(sessions => [session, ...sessions]);
	currentSessionIdStore.set(session.id);
	
	return session;
}

export function getCurrentSession(): ChatSession | null {
	const currentId = currentSessionIdStore.value;
	if (!currentId) return null;
	
	return sessionsStore.value.find(s => s.id === currentId) || null;
}

export function updateSession(sessionId: string, updater: (session: ChatSession) => ChatSession): void {
	sessionsStore.update(sessions => 
		sessions.map(s => s.id === sessionId ? updater(s) : s)
	);
}

export function deleteSession(sessionId: string): void {
	sessionsStore.update(sessions => sessions.filter(s => s.id !== sessionId));
	
	if (currentSessionIdStore.value === sessionId) {
		const remaining = sessionsStore.value;
		currentSessionIdStore.set(remaining.length > 0 ? remaining[0].id : null);
	}
}

export function addMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): void {
	const newMessage: ChatMessage = {
		...message,
		id: crypto.randomUUID(),
		timestamp: Date.now()
	};

	updateSession(sessionId, session => {
		const updatedSession = {
			...session,
			messages: [...session.messages, newMessage],
			updatedAt: Date.now()
		};

		// Auto-generate title from first user message
		if (session.messages.length === 0 && message.role === 'user') {
			updatedSession.title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
		}

		return updatedSession;
	});
}