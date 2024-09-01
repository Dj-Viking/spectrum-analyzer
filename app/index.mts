import { WS_PORT } from "./common.mjs";

(async () => {
    
    const ws = new WebSocket(`ws://localhost:${WS_PORT}`)

    let app = await import("./app.mjs");
    
    ws.addEventListener('message', async (event) => {
        console.log("MESSAGE CAME IN", event);
        if (event.data.includes("hot")) {
            const cachebust = "?v=" + (Date.now().toString())
            app = await import("./app.mjs" + cachebust);
            app.app();
        }
    });
    app.app();
    
})();