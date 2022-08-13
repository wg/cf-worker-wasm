import { copyFileSync, mkdirSync } from 'fs';
import process from 'process';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { build } from 'esbuild';
import { Log, LogLevel, Miniflare } from 'miniflare';

const root   = fileURLToPath(dirname(import.meta.url));
const dist   = join(root, 'dist');
const worker = join(dist, "worker.js");

let plugin = {
    name: 'copy-wasm-plugin',

    setup(build) {
        let filter = /\.wasm$/;

        build.onResolve({ filter, namespace: 'file' }, (args) => {
            let src = resolve(args.resolveDir, args.path);
            let dst = resolve(dist, args.path);
            mkdirSync(dirname(dst), { recursive: true });
            copyFileSync(src, dst);
            return null;
        });
    }
};

await build({
    entryPoints: ["src/worker.js"],
    bundle: true,
    format: 'esm',
    outfile: worker,
    sourcemap: true,
    external: ["*.wasm"],
    logLevel: 'debug',
    watch: true,
    plugins: [plugin],
});

const miniflare = new Miniflare({
    scriptPath: worker,
    modules: true,
    modulesRules: [{
        type: "CompiledWasm",
        include: ["**/*.wasm"],
    }],
    log: new Log(LogLevel.DEBUG),
    watch: true,
});

let server = await miniflare.startServer();

process.on('SIGINT', async () => {
    server.close();
    await miniflare.dispose();
});
