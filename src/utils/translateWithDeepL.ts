import 'dotenv/config.js';
import { TargetLanguageCode, Translator } from 'deepl-node';

function mapLanguageCode(language: string) {
    switch (language) {
        case 'zh-CN':
        case 'zh-TW':
            return 'zh';
        case 'es-ES':
        case 'es-419':
            return 'es';
        case 'sv-SE':
            return 'sv';
        default:
            return language;
    }
}

const possibleLanguages = [
    'id',
    'en-US',
    'en-GB',
    'bg',
    'cs',
    'da',
    'de',
    'el',
    'fi',
    'fr',
    'hu',
    'it',
    'ja',
    'ko',
    'lt',
    'nl',
    'pl',
    'pt-BR',
    'ro',
    'ru',
    'sv-SE',
    'tr',
    'uk',
    'es',
    'zh-CN',
    'zh-TW',
].map(mapLanguageCode);

const DeepLAPIKey = process.env.DEEPL_API_KEY;
if (!DeepLAPIKey) {
    console.error('DeepL API key not found.');
    process.exit(1);
}

const translator = new Translator(DeepLAPIKey);

async function translateWithDeepL(message: string, language: string) {
    if (!possibleLanguages.includes(language)) {
        language = 'en-US';
    }

    const result = await translator.translateText(message, null, language as TargetLanguageCode);

    return result.text;
};

export default translateWithDeepL;