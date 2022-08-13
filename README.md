# WASM on CloudFlare Workers

Minimal example of a CloudFlare Worker that calls into a WASM module.
The Worker is a JavaScript module bundled with wrangler and the WASM
module is written in Rust using wasm-bindgen to generate the JS shims
that handle passing arguments from JavaScript and returning values
from Rust.

## JavaScript Module

[src/worker.js](src/worker.js) is the Worker module. It passes the
last element of the request URL to the `greet` function exported by
the WASM module and returns the resulting string as the HTTP response.

`npm start` runs the Worker locally using Miniflare and demonstrates
using esbuild to bundle worker.js and the WASM shims into a single
`dist/worker.js` module. The esbuild config in [serve.js](serve.js)
declares "*.wasm" as external to preserve imports of WASM bytecode
which are resolved to `WebAssembly.Module` instances by the Workers
runtime.

## WASM Module

[rust/src/lib.rs](rust/src/lib.rs) contains the Rust code which called
from the Worker, a function named `greet` which takes a single
argument `name` and returns a String greeting in the form `"hello,
$name"`.

Compiling this Rust crate to WASM requires the [Rust
toolchain](https://rustup.rs/) and the `wasm-bindgen-cli` crate which
generates JavaScript shims necessary for passing arguments from
JavaScript and handling return values from Rust.

Build steps:

    cargo install wasm-bindgen-cli

    cargo build --release --target wasm32-unknown-unknown

    wasm-bindgen --target web --no-typescript           \
      --out-dir ../src/wasm                             \
      target/wasm32-unknown-unknown/release/greet.wasm
