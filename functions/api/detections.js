const KEY = "detections";

function headers() {
    return {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };
}

function json(data, status = 200) {
    return new Response(JSON.stringify(data), { status, headers: headers() });
}

async function readItems(env) {
    const text = await env.DETECTIONS_KV.get(KEY);
    if (!text) return [];
    try {
        const items = JSON.parse(text);
        return Array.isArray(items) ? items : [];
    } catch {
        return [];
    }
}

export function onRequestOptions() {
    return new Response(null, { status: 204, headers: headers() });
}

export async function onRequestGet({ env }) {
    return json(await readItems(env));
}

export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const items = Array.isArray(body) ? body : (Array.isArray(body.items) ? body.items : []);
        await env.DETECTIONS_KV.put(KEY, JSON.stringify(items.slice(-300)));
        return json({ ok: true, count: items.length });
    } catch (error) {
        return json({ ok: false, error: String(error.message || error) }, 400);
    }
}
