import { copyFileSync, mkdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { build } from 'esbuild';

const root = fileURLToPath(dirname(import.meta.url));
const dist = join(root, 'dist');

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

build({
    entryPoints: ["src/worker.js"],
    bundle: true,
    format: 'esm',
    outfile: join(dist, "worker.js"),
    sourcemap: true,
    external: ["*.wasm"],
    plugins: [plugin],
    logLevel: 'debug',
}).catch(() => process.exit(1));
