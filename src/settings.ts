import { App, PluginSettingTab, Setting } from "obsidian";
import JinaReaderPlugin from "./main";

export interface JinaReaderSettings {
    apiKeyEnvVar: string;
    requireApiKey: boolean;
    loadDotEnvFromVaultRoot: boolean;
    dotEnvFileName: string;
    readerBaseUrl: string;
    timeoutSeconds: number;
    accept: string;
    defaultBehavior: 'replace' | 'insert_below';
}

export const DEFAULT_SETTINGS: JinaReaderSettings = {
    apiKeyEnvVar: "JINA_API_KEY",
    requireApiKey: false,
    loadDotEnvFromVaultRoot: true,
    dotEnvFileName: ".env",
    readerBaseUrl: "https://r.jina.ai/",
    timeoutSeconds: 60,
    accept: "text/plain; charset=utf-8",
    defaultBehavior: "replace"
};

export class JinaReaderSettingTab extends PluginSettingTab {
    plugin: JinaReaderPlugin;

    constructor(app: App, plugin: JinaReaderPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName("API Key Environment Variable")
            .setDesc("The name of the environment variable or .env key that contains the Jina API key.")
            .addText(text => text
                .setPlaceholder("JINA_API_KEY")
                .setValue(this.plugin.settings.apiKeyEnvVar)
                .onChange(async (value) => {
                    this.plugin.settings.apiKeyEnvVar = value || DEFAULT_SETTINGS.apiKeyEnvVar;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("Require API Key")
            .setDesc("If enabled, the plugin will fail with an error message if the API key cannot be found.")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.requireApiKey)
                .onChange(async (value) => {
                    this.plugin.settings.requireApiKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("Load .env from Vault Root")
            .setDesc("Attempt to load a .env file from the Obsidian vault root directory.")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.loadDotEnvFromVaultRoot)
                .onChange(async (value) => {
                    this.plugin.settings.loadDotEnvFromVaultRoot = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(".env File Name")
            .setDesc("The name of the dotenv file to load from the vault root.")
            .addText(text => text
                .setPlaceholder(".env")
                .setValue(this.plugin.settings.dotEnvFileName)
                .onChange(async (value) => {
                    this.plugin.settings.dotEnvFileName = value || DEFAULT_SETTINGS.dotEnvFileName;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("Reader Base URL")
            .setDesc("The Jina Reader base URL.")
            .addText(text => text
                .setPlaceholder("https://r.jina.ai/")
                .setValue(this.plugin.settings.readerBaseUrl)
                .onChange(async (value) => {
                    this.plugin.settings.readerBaseUrl = value || DEFAULT_SETTINGS.readerBaseUrl;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("Timeout (Seconds)")
            .setDesc("HTTP request timeout in seconds.")
            .addText(text => text
                .setPlaceholder("60")
                .setValue(this.plugin.settings.timeoutSeconds.toString())
                .onChange(async (value) => {
                    const parsed = parseInt(value, 10);
                    if (!isNaN(parsed) && parsed > 0) {
                        this.plugin.settings.timeoutSeconds = parsed;
                        await this.plugin.saveSettings();
                    }
                }));

        new Setting(containerEl)
            .setName("Accept Header")
            .setDesc("HTTP Accept header for the request.")
            .addText(text => text
                .setPlaceholder("text/plain; charset=utf-8")
                .setValue(this.plugin.settings.accept)
                .onChange(async (value) => {
                    this.plugin.settings.accept = value || DEFAULT_SETTINGS.accept;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("Default Behavior")
            .setDesc("The default behavior when fetching Markdown content.")
            .addDropdown(dropdown => dropdown
                .addOption("replace", "Replace")
                .addOption("insert_below", "Insert Below")
                .setValue(this.plugin.settings.defaultBehavior)
                .onChange(async (value: 'replace' | 'insert_below') => {
                    this.plugin.settings.defaultBehavior = value;
                    await this.plugin.saveSettings();
                }));
    }
}
