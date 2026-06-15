import { requestUrl, RequestUrlResponse } from "obsidian";
import { JinaReaderSettings } from "./settings";

export async function fetchJinaReaderMarkdown(url: string, settings: JinaReaderSettings, apiKey: string | null): Promise<string> {
    let baseUrl = settings.readerBaseUrl;
    if (!baseUrl.endsWith("/")) {
        baseUrl += "/";
    }

    const targetUrl = baseUrl + encodeURIComponent(url);

    const headers: Record<string, string> = {
        "Accept": settings.accept
    };

    if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const fetchPromise = requestUrl({
        url: targetUrl,
        method: "GET",
        headers: headers,
        throw: false,
    });

    const timeoutPromise = new Promise<RequestUrlResponse>((_, reject) => {
        setTimeout(() => {
            reject(new Error("Request timed out"));
        }, settings.timeoutSeconds * 1000);
    });

    try {
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (response.status >= 400) {
            throw new Error(`HTTP Error ${response.status}: ${response.text}`);
        }

        return response.text;
    } catch (error) {
        throw error;
    }
}
