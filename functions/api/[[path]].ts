import type { CloudflareEnv } from '../../worker/env.ts';
import { handleEdgeRequest } from '../../worker/app.ts';

interface PagesFunctionContext {
  request: Request;
  env: CloudflareEnv;
}

export const onRequest = async (context: PagesFunctionContext): Promise<Response> => {
  return handleEdgeRequest(context.request, context.env);
};
