import {
    jsonResponse,
    optionsResponse,
    readDetections,
    writeDetections
} from "../../_shared.js";

export function onRequestOptions() {
    return optionsResponse();
}

export async function onRequestPatch({ request, env, params }) {
    try {
        const payload = await request.json();
        const items = await readDetections(env);
        const item = items.find(row => Number(row.id) === Number(params.id));
        if (!item) {
            return jsonResponse({ ok: false, error: "not found" }, 404);
        }

        if (typeof payload.state === "string") {
            item.state = payload.state;
        }

        await writeDetections(env, items);
        return jsonResponse({ ok: true, item });
    } catch (error) {
        return jsonResponse({ ok: false, error: String(error.message || error) }, 400);
    }
}
