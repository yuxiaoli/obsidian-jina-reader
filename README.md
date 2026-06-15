# Jina Reader for Obsidian

Jina Reader is an Obsidian plugin that allows you to easily fetch the Markdown content of any web page using the [Jina Reader API](https://jina.ai/reader) and apply it directly into your active note.

## Features

- Extract clean Markdown from any URL using Jina Reader.
- Replace your entire note with the fetched content or insert it right below the detected URL.
- Automatically detects the URL from your current text selection, the current line, or the entire note.
- Protects your notes by warning you if the content changes while a fetch request is pending.

## Installation

### Manual Installation

1. Download the latest release from the GitHub repository (if available) or build it yourself.
2. Extract the plugin folder containing `main.js`, `manifest.json`, and `styles.css` (if any).
3. Move the extracted folder into your Obsidian vault's plugin directory:
   `YourVault/.obsidian/plugins/jina-reader/`
4. Restart Obsidian.

### Enabling the Plugin

1. Open Obsidian and go to **Settings** > **Community Plugins**.
2. Make sure **Safe Mode** is disabled.
3. Find **Jina Reader** in the list of installed plugins and toggle it on to enable it.

## Configuration

### Setting the Jina API Key via `.env`

You can use a `.env` file to securely store your Jina API Key.

1. Create a plain text file named `.env` in the root directory of your Obsidian vault.
   *Example:* `YourVault/.env`
2. Add your Jina API Key to the file using the following format:
   ```env
   JINA_API_KEY=your_actual_api_key_here
   ```

### Plugin Settings

You can customize the plugin behavior in **Settings** > **Jina Reader**:

- **API Key Environment Variable**: The name of the environment variable or `.env` key to use (Default: `JINA_API_KEY`).
- **Require API Key**: If enabled, the plugin will require an API key to function.
- **Load .env from Vault Root**: Whether to attempt loading the `.env` file.
- **Reader Base URL**: The endpoint for Jina Reader (Default: `https://r.jina.ai/`).
- **Timeout**: The network request timeout in seconds.
- **Default Behavior**: Choose how the fetched Markdown is applied (either `replace` or `insert_below`).

## Usage

1. Paste or write a URL in your Obsidian note (e.g., `https://example.com`).
2. Open the Command Palette (`Ctrl/Cmd + P`).
3. Run one of the following commands:
   - **Jina Reader: Fetch URL using Default Behavior**
   - **Jina Reader: Replace Note with Markdown**
   - **Jina Reader: Insert Markdown Below URL**

### Behaviors Explained

- **Replace**: Completely overwrites the current note's content with the fetched Markdown. Ideal for capturing full articles into a new, empty note.
- **Insert Below**: Inserts the fetched Markdown directly below the line where the URL was found. Great for annotating links or adding article summaries within a larger document.

### Assigning a Hotkey

To make fetching even faster, you can assign a hotkey (like `Ctrl+Alt+J` or `Cmd+Opt+J`):
1. Go to **Settings** > **Hotkeys**.
2. Search for "Jina Reader".
3. Click the `+` icon next to the command you want and press your desired key combination.

## Troubleshooting

- **No URL found?** Check that the current note contains a valid `http://` or `https://` URL. Make sure it's selected, on your current line, or somewhere in the note.
- **.env file issues?** Check that `.env` is located exactly in the vault root, not inside a subfolder or the `.obsidian` folder.
- **API Key not loading from OS?** Restart Obsidian if you're using OS environment variables instead of a `.env` file.
- **Missing API key errors?** If you set "Require API Key" to true, verify that your configured key name matches what's in the `.env` file.
- **Plugin not working?** Ensure the plugin is enabled in **Community Plugins**.
