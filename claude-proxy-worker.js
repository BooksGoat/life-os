export default {
  async fetch(request) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'x-api-key, anthropic-version, content-type, anthropic-beta',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const url = new URL(request.url);
    const anthropicUrl = 'https://api.anthropic.com' + url.pathname;

    const fwdHeaders = new Headers();
    for (const [k, v] of request.headers) {
      // Forward only Anthropic-relevant headers, drop browser-specific ones
      if (['x-api-key','anthropic-version','content-type','anthropic-beta'].includes(k.toLowerCase())) {
        fwdHeaders.set(k, v);
      }
    }

    let upstreamResp;
    try {
      upstreamResp = await fetch(anthropicUrl, {
        method: 'POST',
        headers: fwdHeaders,
        body: request.body,
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: { message: 'Upstream fetch failed: ' + e.message } }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const resp = new Response(upstreamResp.body, {
      status: upstreamResp.status,
      headers: upstreamResp.headers,
    });
    resp.headers.set('Access-Control-Allow-Origin', '*');
    return resp;
  }
};
