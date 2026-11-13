import type { CloudflareEnv } from './env.ts';
import { handleEdgeRequest } from './app.ts';

export default {
  async fetch(request: Request, env: CloudflareEnv): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/')) {
      return handleEdgeRequest(request, env);
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Static ASSETS binding is not configured.', { status: 404 });
  },
};
