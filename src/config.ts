import * as vscode from 'vscode';

export interface TranslationConfig {
    sourceLanguage: string;
    targetLanguage: string;
    translationService: string;
    threads: number;
    pdf2zhPath: string;
    outputDirectory: string;
    apiKeys: { [key: string]: string };
}

export class ConfigManager {
    private static readonly CONFIG_SECTION = 'pdfTranslate';

    static getConfig(): TranslationConfig {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);

        return {
            sourceLanguage: config.get('sourceLanguage', 'en'),
            targetLanguage: config.get('targetLanguage', 'zh'),
            translationService: config.get('translationService', 'bing'),
            threads: config.get('threads', 4),
            pdf2zhPath: config.get('pdf2zhPath', 'pdf2zh'),
            outputDirectory: config.get('outputDirectory', ''),
            apiKeys: config.get('apiKeys', {})
        };
    }

    static async updateConfig<K extends keyof TranslationConfig>(
        key: K,
        value: TranslationConfig[K],
        global: boolean = false
    ): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        await config.update(key, value, global ? vscode.ConfigurationTarget.Global : vscode.ConfigurationTarget.Workspace);
    }

    static async selectLanguages(): Promise<{ source: string; target: string } | undefined> {
        const languages = [
            { label: 'English', value: 'en', description: 'English' },
            { label: 'Simplified Chinese', value: 'zh', description: '简体中文' },
            { label: 'Traditional Chinese', value: 'zh-TW', description: '繁體中文' },
            { label: 'Japanese', value: 'ja', description: '日本語' },
            { label: 'Korean', value: 'ko', description: '한국어' },
            { label: 'French', value: 'fr', description: 'Français' },
            { label: 'German', value: 'de', description: 'Deutsch' },
            { label: 'Spanish', value: 'es', description: 'Español' },
            { label: 'Russian', value: 'ru', description: 'Русский' },
            { label: 'Italian', value: 'it', description: 'Italiano' },
            { label: 'Portuguese', value: 'pt', description: 'Português' },
            { label: 'Arabic', value: 'ar', description: 'العربية' },
            { label: 'Dutch', value: 'nl', description: 'Nederlands' },
            { label: 'Polish', value: 'pl', description: 'Polski' },
            { label: 'Turkish', value: 'tr', description: 'Türkçe' },
            { label: 'Vietnamese', value: 'vi', description: 'Tiếng Việt' },
            { label: 'Thai', value: 'th', description: 'ไทย' },
            { label: 'Indonesian', value: 'id', description: 'Bahasa Indonesia' },
            { label: 'Hindi', value: 'hi', description: 'हिन्दी' }
        ];

        const currentConfig = this.getConfig();

        const sourceLang = await vscode.window.showQuickPick(languages, {
            placeHolder: `Select source language (current: ${currentConfig.sourceLanguage})`,
            title: 'Source Language'
        });

        if (!sourceLang) {
            return undefined;
        }

        const targetLang = await vscode.window.showQuickPick(languages, {
            placeHolder: `Select target language (current: ${currentConfig.targetLanguage})`,
            title: 'Target Language'
        });

        if (!targetLang) {
            return undefined;
        }

        // Update configuration
        await this.updateConfig('sourceLanguage', sourceLang.value, true);
        await this.updateConfig('targetLanguage', targetLang.value, true);

        return {
            source: sourceLang.value,
            target: targetLang.value
        };
    }

    static getEnvironmentVariables(): { [key: string]: string } {
        const config = this.getConfig();
        const envVars: { [key: string]: string } = {};

        // Add API keys to environment variables
        for (const [key, value] of Object.entries(config.apiKeys)) {
            if (value) {
                envVars[key] = value;
            }
        }

        return envVars;
    }
}
