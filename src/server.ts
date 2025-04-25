import routes from '@be/routes';
import { Hono } from 'hono';

export function createApp() {
    const app = new Hono();
    app.get('/', (c) => c.text('🚀 API ready!'));
    app.route('/', routes);

    return app;
}
