import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { GlobalStats } from '@models/globalStats.js';
import { getConfig } from '@utils/config.js';

let genAI: GoogleGenerativeAI | null = null;

const safetySettings = [
	{
		category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
		threshold: HarmBlockThreshold.BLOCK_NONE,
	},
	{
		category: HarmCategory.HARM_CATEGORY_HARASSMENT,
		threshold: HarmBlockThreshold.BLOCK_NONE,
	},
	{
		category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
		threshold: HarmBlockThreshold.BLOCK_NONE,
	},
	{
		category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
		threshold: HarmBlockThreshold.BLOCK_NONE,
	},
];

/**
 * @param isMaster Whether the message is from the bot owner or not.
 */
export async function generateWithAI(message: string, isMaster: boolean = false): Promise<string> {
	if (!genAI) {
		const geminiAPIKey = process.env.GEMINI_API_KEY;
		if (!geminiAPIKey) {
			throw new Error('Gemini API key is missing from .env.');
		}
		genAI = new GoogleGenerativeAI(geminiAPIKey);
	}

	const [stats] = await GlobalStats.findOrCreate({
		where: {
			id: 1,
		},
	});

	const aiConfig = getConfig().ai;
	const modelName = aiConfig.modelName;

	if (!modelName) {
		throw new Error('AI model name not found.');
	}

	const date = new Date();
	const time = date.toLocaleString();
	const whoSpeaking = isMaster ? aiConfig.ownerName : 'Visitor';
	const facts = `Current date and time: ${time}, Who is speaking to you: ${whoSpeaking}.`;

	const userMessage = message
		.replace(new RegExp(`^<@!?${process.env.CLIENT_ID}>`), '')
		.trim();

	const model = genAI.getGenerativeModel({
		model: modelName,
		safetySettings: safetySettings,
	});

	const generationConfig = {
		temperature: aiConfig.temperature,
		topK: 1,
		topP: 1,
		maxOutputTokens: 2048,
	};

	const parts = [{
		text: `rule: aiConfig.rules, preset: aiConfig.preset, facts: ${facts}, input: ${userMessage}`,
	}];

	const result = await model.generateContent({
		contents: [{
			role: 'user',
			parts,
		}],
		generationConfig,
	});

	const reply = result.response.text();

	await stats.update({
		totalReplies: stats.totalReplies + 1,
	});

	return reply;
}
