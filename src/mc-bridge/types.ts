export type EventType =
	| 'auth'
	| 'chat_mc_to_discord'
	| 'system_mc_to_discord'
	| 'chat_discord_to_mc';

export interface BaseMessage {
	type: EventType;
}

export interface AuthPayload extends BaseMessage {
	type: 'auth';
	data: {
		secret: string;
	};
}

export interface McChatPayload extends BaseMessage {
	type: 'chat_mc_to_discord';
	data: {
		username: string;
		uuid: string;
		message: string;
	};
}

export interface McSystemPayload extends BaseMessage {
	type: 'system_mc_to_discord';
	data: {
		message: string;
		eventType: 'join' | 'leave' | 'death' | 'advancement' | 'start' | 'stop' | 'console';
	};
}

export interface DiscordChatPayload extends BaseMessage {
	type: 'chat_discord_to_mc';
	data: {
		username: string;
		message: string;
		mentions: string[];
		attachments: string[];
		isEveryonePing: boolean;
		renderMarkdown: boolean;
	};
}

export type IncomingMcPayload = AuthPayload | McChatPayload | McSystemPayload;
