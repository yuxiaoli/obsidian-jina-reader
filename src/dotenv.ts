export function parseDotenv(content: string): Record<string, string> {
    const result: Record<string, string> = {};
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
        const trimmed = line.trim();
        // Ignore empty lines and comments
        if (!trimmed || trimmed.startsWith('#')) {
            continue;
        }

        const equalIndex = trimmed.indexOf('=');
        if (equalIndex === -1) {
            continue;
        }

        const key = trimmed.slice(0, equalIndex).trim();
        let value = trimmed.slice(equalIndex + 1).trim();

        // Handle optional quotes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        if (key) {
            result[key] = value;
        }
    }

    return result;
}
