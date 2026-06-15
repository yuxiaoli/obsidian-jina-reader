import { Editor } from "obsidian";

export interface UrlMatch {
    url: string;
    lineIndex: number | null;
}

// Matches http:// or https:// followed by non-whitespace characters.
// Excludes common trailing punctuation that might be part of markdown syntax.
const URL_REGEX = /https?:\/\/[^\s)\]>"]+/i;

export function extractUrlFromText(text: string): string | null {
    const match = text.match(URL_REGEX);
    return match ? match[0] : null;
}

export function detectUrl(editor: Editor): UrlMatch | null {
    // 1. Selected text
    const selection = editor.getSelection();
    if (selection) {
        const url = extractUrlFromText(selection);
        if (url) {
            const cursor = editor.getCursor("from");
            return { url, lineIndex: cursor.line };
        }
    }

    return null;
}
