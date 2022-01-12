import module from './wasm/greet_bg.wasm';
import init, { greet } from './wasm/greet.js';

const instance = await init(module);

export default {
    async fetch(request) {
        let name  = request.url.split('/').pop();
        let hello = greet(name);
        return new Response(hello);
    }
}
