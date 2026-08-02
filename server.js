const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 5500);
const dataDir = path.join(root, "data");
const detectionsFile = path.join(dataDir, "detections.json");
const detectionImageDir = path.join(root, "uploads", "detections");

const mime = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".mp4": "video/mp4"
};

function ensureDataFile() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(detectionImageDir)) {
        fs.mkdirSync(detectionImageDir, { recursive: true });
    }
    if (!fs.existsSync(detectionsFile)) {
        fs.writeFileSync(detectionsFile, "[]", "utf8");
    }
}

function readDetections() {
    ensureDataFile();
    try {
        const text = fs.readFileSync(detectionsFile, "utf8");
        const items = JSON.parse(text);
        return Array.isArray(items) ? items : [];
    } catch {
        return [];
    }
}

function writeDetections(items) {
    ensureDataFile();
    fs.writeFileSync(detectionsFile, JSON.stringify(items, null, 2), "utf8");
}

function send(res, status, type, body) {
    res.writeHead(status, {
        "Content-Type": type,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end(body);
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", chunk => {
            body += chunk;
            if (body.length > 1024 * 1024) {
                reject(new Error("body too large"));
            }
        });
        req.on("end", () => resolve(body));
        req.on("error", reject);
    });
}

function eventLevel(confidence) {
    if (confidence >= 0.75) return "高危";
    if (confidence >= 0.45) return "中危";
    return "低危";
}

function saveSnapshot(payload, id, createdAt) {
    if (!payload.image_base64) {
        return payload.image || "./uploads/首页图片.jpg";
    }

    const cleanBase64 = String(payload.image_base64).replace(/^data:image\/\w+;base64,/, "");
    const fileName = "detection-" + id + "-" + createdAt.replace(/[-: ]/g, "") + ".jpg";
    const filePath = path.join(detectionImageDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(cleanBase64, "base64"));
    return "./uploads/detections/" + fileName;
}

function saveDetection(payload) {
    const items = readDetections();
    const confidence = Number(payload.confidence || 0);
    const now = new Date();
    const createdAt = now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0") + " " +
        String(now.getHours()).padStart(2, "0") + ":" +
        String(now.getMinutes()).padStart(2, "0") + ":" +
        String(now.getSeconds()).padStart(2, "0");

    const id = items.length ? Math.max(...items.map(row => Number(row.id) || 0)) + 1 : 1;
    const image = saveSnapshot(payload, id, createdAt);

    const item = {
        id,
        event_type: payload.event_type || "动物靠近",
        label: payload.label || "unknown",
        confidence,
        camera: Number(payload.camera || 0),
        level: payload.level || eventLevel(confidence),
        state: payload.state || "未处理",
        place: payload.place || "实时监控点位",
        image,
        created_at: createdAt
    };
    items.push(item);
    writeDetections(items);
    return item;
}

function updateDetection(id, payload) {
    const items = readDetections();
    const item = items.find(row => Number(row.id) === Number(id));
    if (!item) {
        return null;
    }

    if (typeof payload.state === "string") {
        item.state = payload.state;
    }

    writeDetections(items);
    return item;
}

function countToday(items) {
    const now = new Date();
    const today = now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0");
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

function dashboardPayload() {
    const items = readDetections();
    const recent = items.slice().sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 6);
    const todo = items.filter(item => item.state === "未处理").length;

    return {
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
            { icon: "icon-shuju", color: "#eaf2ff", iconColor: "#3f83f7", title: "累计事件", value: String(items.length), desc: "JSON 文件实时统计", trend: "" }
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
    };
}

function serveStatic(req, res) {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    const safePath = path.normalize(urlPath === "/" ? "/login.html" : urlPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(root, safePath);

    if (!filePath.startsWith(root)) {
        send(res, 403, "text/plain; charset=utf-8", "Forbidden");
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            send(res, 404, "text/plain; charset=utf-8", "Not Found");
            return;
        }
        send(res, 200, mime[path.extname(filePath)] || "application/octet-stream", data);
    });
}

const server = http.createServer(async (req, res) => {
    const pathname = req.url.split("?")[0];

    if (req.method === "OPTIONS") {
        send(res, 204, "text/plain; charset=utf-8", "");
        return;
    }

    if (req.method === "GET" && pathname === "/api/dashboard") {
        send(res, 200, "application/json; charset=utf-8", JSON.stringify(dashboardPayload()));
        return;
    }

    if (req.method === "GET" && pathname === "/api/detections") {
        send(res, 200, "application/json; charset=utf-8", JSON.stringify(readDetections()));
        return;
    }

    if (req.method === "POST" && pathname === "/api/detections") {
        try {
            const body = await readBody(req);
            const item = saveDetection(JSON.parse(body || "{}"));
            send(res, 200, "application/json; charset=utf-8", JSON.stringify({ ok: true, item }));
        } catch (error) {
            send(res, 400, "application/json; charset=utf-8", JSON.stringify({ ok: false, error: String(error.message || error) }));
        }
        return;
    }

    const updateMatch = pathname.match(/^\/api\/detections\/(\d+)$/);
    if (req.method === "PATCH" && updateMatch) {
        try {
            const body = await readBody(req);
            const item = updateDetection(updateMatch[1], JSON.parse(body || "{}"));
            if (!item) {
                send(res, 404, "application/json; charset=utf-8", JSON.stringify({ ok: false, error: "not found" }));
                return;
            }
            send(res, 200, "application/json; charset=utf-8", JSON.stringify({ ok: true, item }));
        } catch (error) {
            send(res, 400, "application/json; charset=utf-8", JSON.stringify({ ok: false, error: String(error.message || error) }));
        }
        return;
    }

    serveStatic(req, res);
});

ensureDataFile();
server.listen(port, () => {
    console.log("WildGuard Node server: http://127.0.0.1:" + port);
    console.log("Detection data file: " + detectionsFile);
});
