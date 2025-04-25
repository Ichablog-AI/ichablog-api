import appConfig from '@be/config';
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.text('Hello Bun!'));

const serverConfig = {
    port: appConfig.port,
    fetch: app.fetch,
    request: app.request,
};

if (import.meta.main) {
    // This tells Bun to start the HTTP server when you run this file directly
    Bun.serve(serverConfig);
    console.log(`🟢 Listening on http://localhost:${appConfig.port}`);
}

export default serverConfig;
