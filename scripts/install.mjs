import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const args = process.argv.slice(2);
let vaultPath = args[0];

async function run() {
    if (!vaultPath) {
        vaultPath = await new Promise(resolve => {
            rl.question('Please enter the absolute path to your Obsidian vault: ', resolve);
        });
    }
    rl.close();

    if (!vaultPath || !fs.existsSync(vaultPath)) {
        console.error('\n❌ Error: The specified vault path does not exist.');
        process.exit(1);
    }

    const pluginPath = path.join(vaultPath, '.obsidian', 'plugins', 'jina-reader');

    try {
        console.log('\n📦 Building the plugin...');
        execSync('npm run build', { stdio: 'inherit' });

        console.log(`\n📁 Creating directory: ${pluginPath}`);
        fs.mkdirSync(pluginPath, { recursive: true });

        console.log('📄 Copying files...');
        fs.copyFileSync('main.js', path.join(pluginPath, 'main.js'));
        fs.copyFileSync('manifest.json', path.join(pluginPath, 'manifest.json'));
        
        if (fs.existsSync('styles.css')) {
            fs.copyFileSync('styles.css', path.join(pluginPath, 'styles.css'));
        }

        console.log('\n✅ Plugin successfully installed/updated in your vault!');
        console.log('🔄 Please restart Obsidian or reload the plugin to apply changes.');
    } catch (error) {
        console.error('\n❌ Installation failed:', error.message);
        process.exit(1);
    }
}

run();
