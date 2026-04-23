import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host'
]);

function buildTargetUrl(path: string[], req: NextRequest) {
  const target = new URL(`${config.serverApiBaseUrl}/${path.join('/')}`);
  target.search = req.nextUrl.search;
  return target;
}

async function proxyHandler(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const targetUrl = buildTargetUrl(path, req);

  const headers = new Headers(req.headers);
  for (const header of HOP_BY_HOP_HEADERS) {
    headers.delete(header);
  }

  const upstreamInit: RequestInit & { duplex?: 'half' } = {
    method: req.method,
    headers,
    duplex: 'half',
    cache: 'no-store'
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    upstreamInit.body = req.body;
  }

  const upstreamResponse = await fetch(targetUrl, upstreamInit);

  const responseHeaders = new Headers(upstreamResponse.headers);
  for (const header of HOP_BY_HOP_HEADERS) {
    responseHeaders.delete(header);
  }

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders
  });
}

export { proxyHandler as GET, proxyHandler as POST, proxyHandler as PUT, proxyHandler as PATCH, proxyHandler as DELETE, proxyHandler as OPTIONS };
