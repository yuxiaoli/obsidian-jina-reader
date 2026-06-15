import { requestUrl, RequestUrlResponse } from "obsidian";
import { JinaReaderSettings } from "./settings";

export async function fetchJinaSearchMarkdown(
    query: string,
    settings: JinaReaderSettings,
    apiKey: string | null
): Promise<string> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
        throw new Error("Search query cannot be empty");
    }

    if (!apiKey) {
        throw new Error("API key is required for Jina Search");
    }

    let baseUrl = settings.searchBaseUrl;
    if (!baseUrl.endsWith("/")) {
        baseUrl += "/";
    }

    const params = new URLSearchParams();
    params.set("type", settings.searchType);
    params.set("num", settings.searchResultCount.toString());
    if (settings.searchProvider !== "default") {
        params.set("provider", settings.searchProvider);
    }

    const targetUrl = `${baseUrl}${encodeURIComponent(normalizedQuery)}?${params.toString()}`;
    const headers: Record<string, string> = {
        "Accept": "text/plain",
        "Authorization": `Bearer ${apiKey}`
    };

    const searchPromise = requestUrl({
        url: targetUrl,
        method: "GET",
        headers,
        throw: false
    });
    const timeoutPromise = new Promise<RequestUrlResponse>((_, reject) => {
        setTimeout(() => {
            reject(new Error("Search request timed out"));
        }, settings.timeoutSeconds * 1000);
    });

    const response = await Promise.race([searchPromise, timeoutPromise]);
    if (response.status >= 400) {
        const details = response.text.trim().slice(0, 500);
        throw new Error(`Search HTTP ${response.status}${details ? `: ${details}` : ""}`);
    }

    const markdown = response.text.trim();
    if (!markdown) {
        throw new Error("Jina Search returned an empty response");
    }

    return markdown;
}
