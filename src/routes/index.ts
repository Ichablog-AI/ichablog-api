import health from '@be/routes/health';
import { Hono } from 'hono';

const routes = new Hono();

routes.route('/health', health);

export default routes;
