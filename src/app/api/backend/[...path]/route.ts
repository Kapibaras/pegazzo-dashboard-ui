import { NextRequest, NextResponse } from 'next/server';

const getApiUrl = () => process.env.MONOLITH_API_BASE_URL || 'http://localhost:8000';

async function proxyRequest(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = `/pegazzo/${path.join('/')}`;
  const url = new URL(targetPath, getApiUrl());
  url.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete('host');

  const res = await fetch(url.toString(), {
    method: request.method,
    headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
  });

  const responseHeaders = new Headers(res.headers);
  responseHeaders.delete('transfer-encoding');

  return new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
