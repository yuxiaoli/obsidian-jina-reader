import { Plugin, Notice, MarkdownView, Editor, Modal, App } from "obsidian";
import { JinaReaderSettings, DEFAULT_SETTINGS, JinaReaderSettingTab } from "./settings";
import { detectUrl, UrlMatch } from "./urlDetection";
import { fetchJinaReaderMarkdown } from "./jinaReader";
import { fetchJinaSearchMarkdown } from "./jinaSearch";
import { parseDotenv } from "./dotenv";

class ConfirmModal extends Modal {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;

    constructor(app: App, message: string, onConfirm: () => void, onCancel: () => void) {
        super(app);
        this.message = message;
        this.onConfirm = onConfirm;
        this.onCancel = onCancel;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl("p", { text: this.message });

        const buttonContainer = contentEl.createDiv({ attr: { style: "display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;" } });
        
        const confirmButton = buttonContainer.createEl("button", { text: "Yes, apply" });
        confirmButton.addEventListener("click", () => {
            this.close();
            this.onConfirm();
        });

        const cancelButton = buttonContainer.createEl("button", { text: "Cancel" });
        cancelButton.addEventListener("click", () => {
            this.close();
            this.onCancel();
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

class SearchModal extends Modal {
    initialQuery: string;
    onSubmit: (query: string) => void;

    constructor(app: App, initialQuery: string, onSubmit: (query: string) => void) {
        super(app);
        this.initialQuery = initialQuery;
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl("h2", { text: "Search with Jina" });
        const input = contentEl.createEl("input", {
            attr: {
                type: "text",
                placeholder: "Enter a search query",
                "aria-label": "Jina Search query"
            }
        });
        input.value = this.initialQuery;
        input.style.width = "100%";

        const submit = () => {
            const query = input.value.trim();
            if (!query) {
                new Notice("Jina Search: Enter a search query.");
                return;
            }
            this.close();
            this.onSubmit(query);
        };

        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                submit();
            }
        });

        const buttonContainer = contentEl.createDiv({
            attr: { style: "display: flex; justify-content: flex-end; margin-top: 16px;" }
        });
        const searchButton = buttonContainer.createEl("button", { text: "Search" });
        searchButton.addEventListener("click", submit);
        input.focus();
    }

    onClose() {
        this.contentEl.empty();
    }
}

export default class JinaReaderPlugin extends Plugin {
    settings: JinaReaderSettings;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new JinaReaderSettingTab(this.app, this));

        this.addCommand({
            id: "jina-reader-fetch-default",
            name: "Fetch URL using Default Behavior",
            editorCallback: async (editor: Editor, view: MarkdownView) => {
                await this.executeFetch(editor, view, "insert_below");
            }
        });

        this.addCommand({
            id: "jina-search-insert-results",
            name: "Search and insert results",
            editorCallback: (editor: Editor) => {
                const selectedQuery = editor.getSelection().trim();
                if (selectedQuery) {
                    void this.executeSearch(editor, selectedQuery);
                    return;
                }

                new SearchModal(this.app, "", (query) => {
                    void this.executeSearch(editor, query);
                }).open();
            }
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async resolveApiKey(): Promise<string | null> {
        const keyName = this.settings.apiKeyEnvVar || "JINA_API_KEY";
        
        // 1. process.env
        try {
            if (typeof process !== 'undefined' && process.env && process.env[keyName]) {
                return process.env[keyName] as string;
            }
        } catch (e) {
            // Ignore
        }

        // 2. .env file
        if (this.settings.loadDotEnvFromVaultRoot) {
            const dotEnvPath = this.settings.dotEnvFileName || ".env";
            const adapter = this.app.vault.adapter;
            if (await adapter.exists(dotEnvPath)) {
                try {
                    const content = await adapter.read(dotEnvPath);
                    const dotenvValues = parseDotenv(content);
                    if (dotenvValues[keyName]) {
                        return dotenvValues[keyName];
                    }
                } catch (e) {
                    new Notice(`Jina Reader: Error reading ${dotEnvPath} file.`);
                }
            } else if (this.settings.requireApiKey) {
                new Notice(`Jina Reader: ${dotEnvPath} file not found at vault root.`);
            }
        }

        return null;
    }

    async executeFetch(editor: Editor, view: MarkdownView, behavior: 'replace' | 'insert_below') {
        const urlMatch = detectUrl(editor);
        if (!urlMatch) {
            new Notice("Jina Reader: No URL found in the current selection, line, or note.");
            return;
        }

        const apiKey = await this.resolveApiKey();
        if (!apiKey && this.settings.requireApiKey) {
            new Notice(`Jina Reader: Missing API key. Expected in process.env or .env file as ${this.settings.apiKeyEnvVar}.`);
            return;
        }

        const initialContent = editor.getValue();
        new Notice("Jina Reader: fetching Markdown...");

        try {
            const markdown = await fetchJinaReaderMarkdown(urlMatch.url, this.settings, apiKey);
            
            const currentContent = editor.getValue();
            if (currentContent !== initialContent) {
                new ConfirmModal(this.app, "The note content changed while fetching. Do you still want to apply the fetched Markdown?", () => {
                    this.applyMarkdown(editor, behavior, markdown, urlMatch);
                }, () => {
                    new Notice("Jina Reader: Aborted applying Markdown.");
                }).open();
            } else {
                this.applyMarkdown(editor, behavior, markdown, urlMatch);
            }

        } catch (error: any) {
            console.error("Jina Reader Error:", error);
            new Notice(`Jina Reader Error: ${error.message}`);
        }
    }

    async executeSearch(editor: Editor, query: string) {
        const apiKey = await this.resolveApiKey();
        if (!apiKey) {
            new Notice(`Jina Search: API key is required. Please set ${this.settings.apiKeyEnvVar} in your .env file.`);
            return;
        }

        const initialContent = editor.getValue();
        const insertionPosition = editor.getCursor("to");
        new Notice("Jina Search: searching...");

        try {
            const results = await fetchJinaSearchMarkdown(query, this.settings, apiKey);
            const markdown = `## Jina Search: ${query.replace(/\s+/g, " ")}\n\n${results}`;
            const insertResults = () => {
                const position = editor.getValue() === initialContent
                    ? insertionPosition
                    : editor.getCursor();
                editor.replaceRange(`\n\n${markdown}`, position);
                new Notice("Jina Search: results inserted.");
            };

            if (editor.getValue() !== initialContent) {
                new ConfirmModal(
                    this.app,
                    "The note changed while searching. Insert the results at the current cursor?",
                    insertResults,
                    () => new Notice("Jina Search: Aborted inserting results.")
                ).open();
            } else {
                insertResults();
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("Jina Search Error:", error);
            new Notice(`Jina Search Error: ${message}`);
        }
    }

    applyMarkdown(editor: Editor, behavior: 'replace' | 'insert_below', markdown: string, urlMatch: UrlMatch) {
        if (behavior === "replace") {
            editor.setValue(markdown);
            new Notice("Jina Reader: note replaced with Markdown.");
        } else if (behavior === "insert_below") {
            if (urlMatch.lineIndex !== null) {
                const lineContent = editor.getLine(urlMatch.lineIndex);
                editor.replaceRange(`\n\n${markdown}`, { line: urlMatch.lineIndex, ch: lineContent.length });
            } else {
                // Fallback to end of note
                const lastLine = editor.lineCount() - 1;
                const lastLineLength = editor.getLine(lastLine).length;
                editor.replaceRange(`\n\n${markdown}`, { line: lastLine, ch: lastLineLength });
            }
            new Notice("Jina Reader: Markdown inserted.");
        } else {
            new Notice(`Jina Reader: Invalid behavior ${behavior}`);
        }
    }
}
