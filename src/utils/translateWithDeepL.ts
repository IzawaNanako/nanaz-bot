import 'dotenv/config.js';
import { GlobalStats } from '@models/globalStats.js';
import { TargetLanguageCode, Translator } from 'deepl-node';

/**
 * Map a possibly unsupported language code to a supported one.
 * @param language The language to map.
 * @returns Mapped language code.
 */
function mapLanguageCode(language: string) {
    switch (language) {
        case 'zh-CN':
            return 'zh-HANS';
        case 'zh-TW':
            return 'zh-HANT';
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

/**
 * Translate a string using DeepL.
 * @param message The message to translate.
 * @param language The language to translate to, e.g. 'en-US'.
 * @returns Returns the translated string.
 */
export async function translateWithDeepL(message: string, language: string) {
    const [stats] = await GlobalStats.findOrCreate({
        where: {
            id: 1,
        }
    });

    const supportedLanguages = await translator.getTargetLanguages();

    let targetLanguage = mapLanguageCode(language) as TargetLanguageCode;

    if (!supportedLanguages.some((lang) => lang.code === targetLanguage || targetLanguage === 'zh-HANT' as TargetLanguageCode)) {
        targetLanguage = 'en-US';
    }

    const result = await translator.translateText(message, null, targetLanguage);

    stats.update({
        totalTranslations: stats.totalTranslations + 1,
    });

    return result.text;
};
