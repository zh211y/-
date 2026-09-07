const KEY = "detections";

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*"
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

function todayText() {
    const local = new Date(Date.now() + 8 * 60 * 60 * 1000);
    return local.toISOString().slice(0, 10);
}

function countToday(items) {
    const today = todayText();
    return items.filter(item => String(item.created_at || "").startsWith(today)).length;
}

function levelItems(items) {
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

export async function onRequestGet({ env }) {
    const items = await readItems(env);
    const recent = items.slice().sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 6);
    const todo = items.filter(item => item.state === "未处理").length;

    return json({
        animals: [],
        menu: [
            ["icon-shouye6", "首页概览"],
            ["icon-jiankong", "实时监控", "./detect.html"],
            ["icon-shijian", "事件管理"],
            ["icon-shebei", "设备管理"],
            ["icon-shuju", "数据统计"],
            ["icon-ditu", "地图总览"],
            ["icon-zhongguohangtiantubiaoheji-weizhuanlunkuo-", "关于产品", "./about-product.html"],
            ["icon-guanyuwomen", "关于我们", "./about-us.html"],
            ["icon-jiangbei", "团队荣誉", "./team-honor.html"]
        ],
        stats: [
            { icon: "icon-zaixian", color: "#e1f8ed", iconColor: "#15b970", title: "在线设备", value: "0", desc: "在线率 0%", trend: "up" },
            { icon: "icon-yujing", color: "#fff1dc", iconColor: "#f9a11b", title: "今日预警", value: String(countToday(items)), desc: "来自本地 YOLO 同步", trend: "" },
            { icon: "icon-shijian", color: "#ffe5e6", iconColor: "#f0444d", title: "未处理事件", value: String(todo), desc: "等待处置", trend: "up" },
            { icon: "icon-shuju", color: "#eaf2ff", iconColor: "#3f83f7", title: "累计事件", value: String(items.length), desc: "线上 JSON 同步", trend: "" }
        ],
        events: recent.map(item => ({
            id: item.id,
            type: item.event_type,
            label: item.label,
            confidence: Number(item.confidence || 0),
            place: item.place,
            time: String(item.created_at || "").replace(" ", "<br>"),
            level: item.level,
            state: item.state,
            img: item.image
        })),
        warnings: levelItems(items),
        devices: [],
        env: []
    });
}
