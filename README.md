# Zitoun

## Getting Started

To get started with this api, simply paste this command into your terminal:

```sh
bun install

bun run dev

bun run build

bun run compile
```

you need to have bun installed. you can install it with [bun install](https://bun.sh/install) and also some environment variables need to be set.

```sh
ZITADEL_DOMAIN="<ZITADEL_URL>"
ZITADEL_JWKS_URI="<ZITADEL_JWKS_URI>"
ZITADEL_PAT="<MACHINE_USER_ZITADEL_PAT>"
PORT=3000
```

## TODO

- [ ] Fix compatibility with node (might not get impllmented due to compile is awesome)

This project when built can only be run with bun to use it with node you need add some plugins to adapt elysia for node like in this error:

```plaintext
/.../zitoun/dist/app.js:12125
        throw new Error(".listen() is designed to run on Bun only. If you are running Elysia in other environment please use a dedicated plugin or export the handler via Elysia.fetch");
        ^

Error: .listen() is designed to run on Bun only. If you are running Elysia in other environment please use a dedicated plugin or export the handler via Elysia.fetch
    at _Elysia.listen (/Users/zine/Developer/lower-prio/zitoun/dist/app.js:12125:15)
    at Object.<anonymous> (/Users/zine/Developer/lower-prio/zitoun/dist/app.js:14411:4)
    at Module._compile (node:internal/modules/cjs/loader:1572:14)
    at Object..js (node:internal/modules/cjs/loader:1709:10)
    at Module.load (node:internal/modules/cjs/loader:1315:32)
    at Function._load (node:internal/modules/cjs/loader:1125:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:216:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:170:5)
    at node:internal/main/run_main_module:36:49

Node.js v23.1.0
```
