import { parse } from 'discord-markdown-parser';

export interface FormattedSpan {
	text: string;
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
	strikethrough?: boolean;
	spoiler?: boolean;
	code?: boolean;
	url?: string;
}

interface StyleState {
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
	readonly [key: string]: unknown;
}

export function parseDiscordMarkdown(content: string): FormattedSpan[] {
	if (!content) {
		return [];
	}

	const ast = parse(content, 'normal') as readonly MarkdownNode[];
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
				case 'text': {
					if (typeof node.content === 'string' && node.content.length > 0) {
						spans.push({ text: node.content, ...currentStyle });
					}
					break;
				}

				case 'em': {
					if (Array.isArray(node.content)) {
						traverse(node.content, { ...currentStyle, italic: true });
					}
					break;
				}

				case 'strong': {
					if (Array.isArray(node.content)) {
						traverse(node.content, { ...currentStyle, bold: true });
					}
					break;
				}

				case 'underline': {
					if (Array.isArray(node.content)) {
						traverse(node.content, { ...currentStyle, underline: true });
					}
					break;
				}

				case 'strike': {
					if (Array.isArray(node.content)) {
						traverse(node.content, { ...currentStyle, strikethrough: true });
					}
					break;
				}

				case 'spoiler': {
					if (Array.isArray(node.content)) {
						traverse(node.content, { ...currentStyle, spoiler: true });
					}
					break;
				}

				case 'inlineCode': {
					const text = typeof node.content === 'string' ? node.content : extractPlainText(node.content);
					spans.push({ text, ...currentStyle, code: true });
					break;
				}

				case 'link':
				case 'url':
				case 'autolink': {
					const url = typeof node.target === 'string' ? node.target : (typeof node.content === 'string' ? node.content : extractPlainText(node.content));

					const text = extractPlainText(node.content) || url;
					spans.push({ text, ...currentStyle, url });
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

export function truncateSpans(spans: FormattedSpan[], maxVisibleChars: number = 256): FormattedSpan[] {
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
