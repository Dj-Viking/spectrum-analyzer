import { WS_PORT } from "./common.mjs";
(async () => {
    const ws = new WebSocket(`ws://localhost:${WS_PORT}`);
    let app = await import("./app.mjs");
    let utils = await import("./utils.mjs");
    let meternode = await import("./meternode.mjs");
    ws.addEventListener('message', async (event) => {
        if (event.data.includes("mjs")) {
            const cachebust = "?v=" + (Date.now().toString());
            app = await import("./app.mjs" + cachebust);
            utils = await import("./utils.mjs" + cachebust);
            meternode = await import("./meternode.mjs" + cachebust);
            app.app(app, utils, meternode);
        }
    });
    app.app(app, utils, meternode);
})();
