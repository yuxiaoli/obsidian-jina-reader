import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const releaseDir = path.join(process.cwd(), 'release');

function run() {
    try {
        console.log('📦 Building the plugin for production...');
        execSync('npm run build', { stdio: 'inherit' });

        console.log(`\n📁 Creating release directory: ${releaseDir}`);
        if (!fs.existsSync(releaseDir)) {
            fs.mkdirSync(releaseDir, { recursive: true });
        }

        console.log('📄 Copying release files...');
        const filesToCopy = ['main.js', 'manifest.json', 'versions.json', 'styles.css'];
        
        for (const file of filesToCopy) {
            if (fs.existsSync(file)) {
                fs.copyFileSync(file, path.join(releaseDir, file));
                console.log(`  - Copied ${file}`);
            }
        }

        console.log('\n✅ Publish preparation complete!');
        console.log(`The files in the 'release/' directory are ready to be attached to a GitHub Release.`);
    } catch (error) {
        console.error('\n❌ Publish failed:', error.message);
        process.exit(1);
    }
}

run();
