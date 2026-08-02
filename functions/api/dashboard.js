import {
    countToday,
    jsonResponse,
    levelItems,
    optionsResponse,
    readDetections
} from "../_shared.js";

export function onRequestOptions() {
    return optionsResponse();
}

export async function onRequestGet({ env }) {
    const items = await readDetections(env);
    const recent = items.slice().sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 6);
    const todo = items.filter(item => item.state === "未处理").length;

    return jsonResponse({
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
            { icon: "icon-yujing", color: "#fff1dc", iconColor: "#f9a11b", title: "今日预警", value: String(countToday(items)), desc: "来自 YOLO 实时检测", trend: "" },
            { icon: "icon-shijian", color: "#ffe5e6", iconColor: "#f0444d", title: "未处理事件", value: String(todo), desc: "等待处置", trend: "up" },
            { icon: "icon-shuju", color: "#eaf2ff", iconColor: "#3f83f7", title: "累计事件", value: String(items.length), desc: "Cloudflare 线上数据", trend: "" }
        ],
        events: recent.map(item => ({
            id: item.id,
            type: item.event_type,
            label: item.label,
            confidence: Math.round(Number(item.confidence || 0) * 1000) / 1000,
            place: item.place,
            time: String(item.created_at).replace(" ", "<br>"),
            level: item.level,
            state: item.state,
            img: item.image
        })),
        warnings: levelItems(items),
        devices: [],
        env: []
    });
}
