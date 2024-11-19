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

const DeepLAPIKey = process.env.DEEPL_API_KEY;
if (!DeepLAPIKey) {
    console.error('DeepL API key not found.');
    process.exit(1);
}

const translator = new Translator(DeepLAPIKey);

async function translateWithDeepL(message: string, language: string) {
    const supportedLanguages = await translator.getTargetLanguages();
    let targetLanguage = mapLanguageCode(language) as TargetLanguageCode;

    if (!supportedLanguages.some(lang => lang.code === language)) {
        targetLanguage = 'en-US';
    }

    const result = await translator.translateText(message, null, targetLanguage);

    return result.text;
};

export default translateWithDeepL;