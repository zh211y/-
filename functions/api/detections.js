import {
    createdAtText,
    eventLevel,
    jsonResponse,
    normalizeImage,
    optionsResponse,
    readDetections,
    writeDetections
} from "../_shared.js";

export function onRequestOptions() {
    return optionsResponse();
}

export async function onRequestGet({ env }) {
    const items = await readDetections(env);
    return jsonResponse(items);
}

export async function onRequestPost({ request, env }) {
    try {
        const payload = await request.json();
        const items = await readDetections(env);
        const confidence = Number(payload.confidence || 0);
        const createdAt = createdAtText();
        const id = items.length ? Math.max(...items.map(row => Number(row.id) || 0)) + 1 : 1;
        const item = {
            id,
            event_type: payload.event_type || "动物靠近",
            label: payload.label || "unknown",
            confidence,
            camera: Number(payload.camera || 0),
            level: payload.level || eventLevel(confidence),
            state: payload.state || "未处理",
            place: payload.place || "实时监控点位",
            image: normalizeImage(payload),
            created_at: createdAt
        };

        items.push(item);
        await writeDetections(env, items);
        return jsonResponse({ ok: true, item });
    } catch (error) {
        return jsonResponse({ ok: false, error: String(error.message || error) }, 400);
    }
}
