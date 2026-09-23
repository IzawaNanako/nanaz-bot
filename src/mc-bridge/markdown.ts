import type { Message } from 'discord.js';
import { parse } from 'discord-markdown-parser';
import type { FormattedSpan, MarkdownNode, StyleState } from './types.js';

export function parseDiscordMarkdown(message: Message): FormattedSpan[] {
	const content = message.content;
	if (!content) {
		return [];
	}

	const ast: readonly MarkdownNode[] = parse(content, 'normal');
	const spans: FormattedSpan[] = [];

	function extractPlainText(nodeContent?: string | readonly MarkdownNode[]): string {
		if (typeof nodeContent === 'string') {
			return nodeContent;
		}
		if (Array.isArray(nodeContent)) {
			return nodeContent.map((child: MarkdownNode) => extractPlainText(child.content)).join('');
		}
		return '';
	}

	function traverse(nodes: readonly MarkdownNode[], currentStyle: StyleState): void {
		for (const node of nodes) {
			switch (node.type) {
				case 'everyone':
				case 'here': {
					spans.push({
						text: `@${node.type}`,
						bold: true,
						...currentStyle,
					});
					break;
				}
				case 'user':
				case 'mention': {
					const userId = typeof node.id === 'string' ? node.id : '';
					let name = '@user';

					if (message && userId) {
						const member = message.mentions.members?.get(userId) ?? message.guild?.members.cache.get(userId);
						const user = message.mentions.users?.get(userId) ?? message.client.users.cache.get(userId);
						name = member?.displayName ?? user?.username ?? `@${userId}`;
					}

					spans.push({
						text: name.startsWith('@') ? name : `@${name}`,
						bold: true,
						...currentStyle,
					});
					break;
				}
				case 'role': {
					const roleId = typeof node.id === 'string' ? node.id : '';
					let roleName = '@role';

					if (message && roleId) {
						const role = message.mentions.roles?.get(roleId) ?? message.guild?.roles.cache.get(roleId);
						roleName = role?.name ?? `@${roleId}`;
					}

					spans.push({
						text: roleName.startsWith('@') ? roleName : `@${roleName}`,
						bold: true,
						...currentStyle,
					});
					break;
				}
				case 'channel': {
					const channelId = typeof node.id === 'string' ? node.id : '';
					let chanName = '#channel';

					if (message && channelId) {
						const chan = message.guild?.channels.cache.get(channelId);
						chanName = chan?.name ?? `#${channelId}`;
					}

					spans.push({
						text: chanName.startsWith('#') ? chanName : `#${chanName}`,
						bold: true,
						...currentStyle,
					});
					break;
				}
				case 'br': {
					spans.push({
						text: '\n',
						...currentStyle,
					});
					break;
				}
				case 'text': {
					if (typeof node.content === 'string' && node.content.length > 0) {
						spans.push({
							text: node.content,
							...currentStyle,
						});
					}
					break;
				}
				case 'em': {
					if (Array.isArray(node.content)) {
						traverse(node.content, {
							...currentStyle,
							italic: true,
						});
					}
					break;
				}
				case 'strong': {
					if (Array.isArray(node.content)) {
						traverse(node.content, {
							...currentStyle,
							bold: true,
						});
					}
					break;
				}
				case 'underline': {
					if (Array.isArray(node.content)) {
						traverse(node.content, {
							...currentStyle,
							underline: true,
						});
					}
					break;
				}
				case 'strikethrough': {
					if (Array.isArray(node.content)) {
						traverse(node.content, {
							...currentStyle,
							strikethrough: true,
						});
					}
					break;
				}
				case 'spoiler': {
					if (Array.isArray(node.content)) {
						traverse(node.content, {
							...currentStyle,
							spoiler: true,
						});
					}
					break;
				}
				case 'inlineCode': {
					const text = typeof node.content === 'string' ? node.content : extractPlainText(node.content);
					spans.push({ text, ...currentStyle, code: true });
					break;
				}
				case 'emoji': {
					const emojiName = typeof node.name === 'string' ? node.name : 'emoji';
					spans.push({
						text: `:${emojiName}:`,
						...currentStyle,
					});
					break;
				}
				case 'twemoji': {
					const emojiText = typeof node.name === 'string' ? node.name : (typeof node.content === 'string' ? node.content : extractPlainText(node.content));
					if (emojiText) {
						spans.push({
							text: emojiText,
							...currentStyle,
						});
					}
					break;
				}
				case 'url':
				case 'autolink': {
					const url = typeof node.target === 'string' ? node.target : (typeof node.content === 'string' ? node.content : extractPlainText(node.content));

					const text = extractPlainText(node.content) || url;

					spans.push({
						text,
						...currentStyle,
						url,
						hoverText: wrapHoverText(url, 45, 240),
					});
					break;
				}
				default: {
					if (Array.isArray(node.content)) {
						traverse(node.content, currentStyle);
					} else if (typeof node.content === 'string' && node.content.length > 0) {
						spans.push({ text: node.content, ...currentStyle });
					}
					break;
				}
			}
		}
	}

	traverse(ast, {});
	return spans;
}

export function truncateSpans(spans: FormattedSpan[], maxVisibleChars: number = 240): FormattedSpan[] {
	const truncated: FormattedSpan[] = [];
	let currentLength = 0;

	for (const span of spans) {
		if (!span.text) {
			continue;
		}

		const remaining = maxVisibleChars - currentLength;

		if (remaining <= 0) {
			break;
		}

		if (span.text.length <= remaining) {
			truncated.push(span);
			currentLength += span.text.length;
		} else {
			const cutLength = Math.max(0, remaining - 3);
			const slice = span.text.slice(0, cutLength);

			truncated.push({
				...span,
				text: `${slice}...`,
			});
			break;
		}
	}

	return truncated;
}

export function truncate(text: string, maxLength: number = 240): string {
	if (!text || text.length <= maxLength) {
		return text ?? '';
	}
	const cutLength = Math.max(0, maxLength - 3);
	return `${text.slice(0, cutLength)}...`;
}

export function wrapHoverText(text: string, maxLineLength: number = 45, maxTotalLength: number = 240): string {
	if (!text) {
		return '';
	}

	let content = text;
	if (content.length > maxTotalLength) {
		content = `${content.slice(0, maxTotalLength - 3)}...`;
	}

	const lines: string[] = [];
	const rawParagraphs = content.split('\n');

	for (const paragraph of rawParagraphs) {
		if (paragraph.length <= maxLineLength) {
			lines.push(paragraph);
			continue;
		}

		let currentLine = '';
		const words = paragraph.split(' ');

		for (const word of words) {
			if (word.length > maxLineLength) {
				if (currentLine) {
					lines.push(currentLine);
				}
				for (let i = 0; i < word.length; i += maxLineLength) {
					lines.push(word.slice(i, i + maxLineLength));
				}
				currentLine = '';
				continue;
			}

			if (currentLine.length + word.length + 1 > maxLineLength) {
				lines.push(currentLine);
				currentLine = word;
				continue;
			}
			currentLine = currentLine ? `${currentLine} ${word}` : word;
		}

		if (currentLine) {
			lines.push(currentLine);
		}
	}

	return lines.join('\n');
}
