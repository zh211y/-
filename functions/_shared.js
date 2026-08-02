const DETECTIONS_KEY = "detections";

export function corsHeaders(contentType = "application/json; charset=utf-8") {
    return {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };
}

export function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: corsHeaders()
    });
}

export function optionsResponse() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders()
    });
}

export async function readDetections(env) {
    const text = await env.DETECTIONS_KV.get(DETECTIONS_KEY);
    if (!text) {
        return [];
    }

    try {
        const items = JSON.parse(text);
        return Array.isArray(items) ? items : [];
    } catch {
        return [];
    }
}

export async function writeDetections(env, items) {
    await env.DETECTIONS_KV.put(DETECTIONS_KEY, JSON.stringify(items));
}

export function createdAtText() {
    const now = new Date();
    const offsetMs = 8 * 60 * 60 * 1000;
    const local = new Date(now.getTime() + offsetMs);
    return local.toISOString().slice(0, 19).replace("T", " ");
}

export function eventLevel(confidence) {
    if (confidence >= 0.75) return "高危";
    if (confidence >= 0.45) return "中危";
    return "低危";
}

export function normalizeImage(payload) {
    if (payload.image_base64) {
        const text = String(payload.image_base64);
        return text.startsWith("data:image/")
            ? text
            : "data:image/jpeg;base64," + text.replace(/^data:image\/\w+;base64,/, "");
    }
    return payload.image || "./uploads/首页图片.jpg";
}

export function countToday(items) {
    const today = createdAtText().slice(0, 10);
    return items.filter(item => String(item.created_at || "").startsWith(today)).length;
}

export function levelItems(items) {
    const names = ["高危", "中危", "低危"];
    const colors = { "高危": "#ff6464", "中危": "#ffa928", "低危": "#5fa4ff" };
    const total = items.length || 1;
    return names.map(name => {
        const count = items.filter(item => item.level === name).length;
        return {
            name,
            value: count + " (" + Math.round(count / total * 1000) / 10 + "%)",
            color: colors[name]
        };
    });
}
