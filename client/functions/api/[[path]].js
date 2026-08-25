export async function onRequest(context) {
  const url = new URL(context.request.url);
  const apiPath = url.pathname.replace('/api', '') || '/';
  const targetUrl = `http://104.207.93.209:3002/api${apiPath}${url.search}`;
  const headers = new Headers();
  for (const [key, val] of context.request.headers.entries()) {
    if (!['host', 'cf-connecting-ip', 'cf-ray'].includes(key.toLowerCase())) {
      headers.set(key, val);
    }
  }
  let body = undefined;
  if (!['GET', 'HEAD'].includes(context.request.method)) {
    body = await context.request.arrayBuffer();
  }
  const response = await fetch(targetUrl, { method: context.request.method, headers, body });
  const newHeaders = new Headers(response.headers);
  newHeaders.set('Access-Control-Allow-Origin', '*');
  return new Response(response.body, { status: response.status, headers: newHeaders });
}
