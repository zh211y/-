const KEY = "detections";

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    });
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
    return json({}, 204);
}

export async function onRequestPatch({ request, env, params }) {
    const body = await request.json();
    const items = await readItems(env);
    const item = items.find(row => Number(row.id) === Number(params.id));
    if (!item) {
        return json({ ok: false, error: "not found" }, 404);
    }
    if (typeof body.state === "string") {
        item.state = body.state;
    }
    await env.DETECTIONS_KV.put(KEY, JSON.stringify(items));
    return json({ ok: true, item });
}
