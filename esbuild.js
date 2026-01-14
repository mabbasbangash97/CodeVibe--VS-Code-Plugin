const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

async function main() {
    const ctx = await esbuild.context({
        entryPoints: ['src/extension.ts'],
        bundle: true,
        format: 'cjs',
        minify: production,
        sourcemap: !production,
        sourcesContent: false,
        platform: 'node',
        outfile: 'dist/extension.js',
        external: ['vscode'],
        logLevel: 'info',
        plugins: [
            {
                name: 'copy-assets',
                setup(build) {
                    build.onEnd(() => {
                        // Copy webview assets
                        const srcWebview = path.join(__dirname, 'src', 'webview');
                        const distWebview = path.join(__dirname, 'dist', 'webview');

                        if (!fs.existsSync(distWebview)) {
                            fs.mkdirSync(distWebview, { recursive: true });
                        }

                        const files = ['sidebar.html', 'sidebar.css', 'sidebar.js', 'settings.html', 'settings.css', 'settings.js'];
                        files.forEach(file => {
                            const src = path.join(srcWebview, file);
                            const dest = path.join(distWebview, file);
                            if (fs.existsSync(src)) {
                                fs.copyFileSync(src, dest);
                            }
                        });
                    });
                }
            }
        ]
    });

    if (watch) {
        await ctx.watch();
        console.log('Watching for changes...');
    } else {
        await ctx.rebuild();
        await ctx.dispose();
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
