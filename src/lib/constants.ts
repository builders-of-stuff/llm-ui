// Message roles
export const MESSAGE_ROLES = {
	USER: 'user',
	ASSISTANT: 'assistant',
	SYSTEM: 'system'
} as const;

export type MessageRole = typeof MESSAGE_ROLES[keyof typeof MESSAGE_ROLES];

// UI Text
export const UI_TEXT = {
	WELCOME_TITLE: 'Welcome to LLM UI',
	LOADING: 'Loading...',
	THINKING: 'Thinking...',
	TYPING: 'Typing...',
	NEW_CHAT: 'New Chat',
	OPEN_SETTINGS: 'Open Settings',
	SETTINGS: 'Settings',
	ASSISTANT: 'Assistant',
	YOU: 'You',
	SAVE: 'Save',
	CANCEL: 'Cancel'
} as const;

// Placeholders
export const PLACEHOLDERS = {
	API_KEY: 'sk-...',
	SYSTEM_PROMPT: 'You are a helpful assistant...',
	MESSAGE_DEFAULT: 'Type your message...',
	MESSAGE_NO_API_KEY: 'Configure API key in settings first...'
} as const;

// Messages
export const MESSAGES = {
	API_KEY_REQUIRED: 'Please configure your OpenAI API key in settings to get started.',
	START_CONVERSATION: 'Start a conversation by typing a message below.',
	API_KEY_SECURITY: 'Your API key is stored locally and never sent to our servers.',
	SYSTEM_PROMPT_HELP: 'Instructions that guide the AI\'s behavior and personality.',
	TEMPERATURE_LOW: 'More focused',
	TEMPERATURE_HIGH: 'More creative',
	TOP_P_LOW: 'Less diverse',
	TOP_P_HIGH: 'More diverse',
	PRESENCE_PENALTY_LOW: 'Repeat topics',
	PRESENCE_PENALTY_HIGH: 'Avoid topics',
	FREQUENCY_PENALTY_LOW: 'Repeat words',
	FREQUENCY_PENALTY_HIGH: 'Avoid repetition'
} as const;

// Form Labels
export const LABELS = {
	OPENAI_API_KEY: 'OpenAI API Key',
	MODEL: 'Model',
	MAX_TOKENS: 'Max Tokens',
	TEMPERATURE: 'Temperature',
	SYSTEM_PROMPT: 'System Prompt',
	TOP_P: 'Top P',
	PRESENCE_PENALTY: 'Presence Penalty',
	FREQUENCY_PENALTY: 'Frequency Penalty'
} as const;

// Avatar initials
export const AVATARS = {
	USER_INITIAL: 'U',
	AI_INITIAL: 'AI'
} as const;

// Loading states
export const LOADING_STATES = {
	IDLE: 'idle',
	LOADING: 'loading',
	STREAMING: 'streaming'
} as const;

export type LoadingState = typeof LOADING_STATES[keyof typeof LOADING_STATES];