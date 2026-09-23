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

export interface FormattedSpan {
	text: string;
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
	strikethrough?: boolean;
	spoiler?: boolean;
	code?: boolean;
	url?: string;
	hoverText?: string;
}

export interface StyleState {
	readonly bold?: boolean;
	readonly italic?: boolean;
	readonly underline?: boolean;
	readonly strikethrough?: boolean;
	readonly spoiler?: boolean;
	readonly code?: boolean;
}

export interface MarkdownNode {
	readonly type: string;
	readonly content?: string | readonly MarkdownNode[];
	readonly target?: string;
	readonly id?: unknown;
	readonly name?: string;
	readonly animated?: boolean;
	readonly [key: string]: unknown;
}

export interface ReplyData {
	author: string;
	preview: string;
	hoverText: string;
}

export interface DiscordChatPayload extends BaseMessage {
	type: 'chat_discord_to_mc';
	data: {
		username: string;
		message: string;
		spans: FormattedSpan[];
		mentions: string[];
		attachments: string[];
		isEveryonePing: boolean;
		renderMarkdown: boolean;
		roleColor?: number;
		replyData: ReplyData | undefined;
	};
}

export type IncomingMcPayload = AuthPayload | McChatPayload | McSystemPayload;
