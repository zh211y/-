/* Node 后端服务：提供静态页面 + 模拟后台接口 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = process.env.PORT || 5500;

const mime = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg"
};

function loadAnimals() {
    const filePath = path.join(root, "uploads", "animals", "animals.json");
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/* 模拟数据库数据，真实项目可以替换为数据库查询结果 */
const dashboardData = {
    animals: loadAnimals(),
    menu: [
        ["icon-shouye6", "首页概览"],
        ["icon-jiankong", "实时监控"],
        ["icon-shijian", "事件管理"],
        ["icon-shebei", "设备管理"],
        ["icon-shuju", "数据统计"],
        ["icon-ditu", "地图总览"],
        ["icon-zhongguohangtiantubiaoheji-weizhuanlunkuo-", "关于产品"],
        ["icon-guanyuwomen", "关于我们", "./about-us.html"],
        ["icon-jiangbei", "团队荣誉", "./team-honor.html"]
    ],
    stats: [
        { icon: "icon-zaixian", color: "#e1f8ed", iconColor: "#15b970", title: "在线设备", value: "128", desc: "在线率 89.5%", trend: "up" },
        { icon: "icon-yujing", color: "#fff1dc", iconColor: "#f9a11b", title: "今日预警", value: "26", desc: "较昨日下降 12%", trend: "down" },
        { icon: "icon-shijian", color: "#ffe5e6", iconColor: "#f0444d", title: "未处理事件", value: "8", desc: "较昨日增加 5%", trend: "up" },
        { icon: "icon-shuju", color: "#eaf2ff", iconColor: "#3f83f7", title: "累计事件", value: "1,248", desc: "本月新增 312", trend: "" }
    ],
    events: [
        { type: "动物穿越", place: "可可西里路段<br>K120+300", time: "2026-07-28<br>14:34:56", level: "高危", state: "未处理", img: "./uploads/首页图片.jpg" },
        { type: "行人穿越", place: "五道梁路段<br>K98+150", time: "2026-07-28<br>14:28:11", level: "中危", state: "已处理", img: "./uploads/首页图片.jpg" },
        { type: "动物靠近", place: "唐古拉山口<br>K156+800", time: "2026-07-28<br>13:58:42", level: "中危", state: "未处理", img: "./uploads/首页图片.jpg" },
        { type: "设备离线", place: "安沱河路段<br>K75+600", time: "2026-07-28<br>13:20:33", level: "低危", state: "已处理", img: "./uploads/首页图片.jpg" },
        { type: "动物穿越", place: "沱沱河路段<br>K65+900", time: "2026-07-28<br>12:45:09", level: "高危", state: "未处理", img: "./uploads/首页图片.jpg" },
        { type: "行人靠近", place: "索南达杰保护站", time: "2026-07-28<br>12:30:21", level: "低危", state: "已处理", img: "./uploads/首页图片.jpg" }
    ],
    warnings: [
        { name: "高危", value: "35 (34.3%)", color: "#ff6464" },
        { name: "中危", value: "38 (37.3%)", color: "#ffa928" },
        { name: "低危", value: "29 (28.4%)", color: "#5fa4ff" }
    ],
    devices: [
        { name: "在线设备", value: "128 (89.5%)", color: "#17bd72" },
        { name: "离线设备", value: "13 (9.1%)", color: "#c7d0d8" },
        { name: "故障设备", value: "2 (1.4%)", color: "#ff6464" }
    ],
    env: [
        { icon: "icon-tianqi", name: "风速", value: "3.2 m/s" },
        { icon: "icon-tianqi", name: "温度", value: "-8 °C" },
        { icon: "icon-tianqi", name: "湿度", value: "45 %" },
        { icon: "icon-ditu", name: "海拔", value: "4200 m" }
    ]
};

function send(res, status, type, body) {
    res.writeHead(status, { "Content-Type": type });
    res.end(body);
}

function serveStatic(req, res) {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    const safePath = path.normalize(urlPath === "/" ? "/login.html" : urlPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(root, safePath);

    if (!filePath.startsWith(root)) {
        send(res, 403, "text/plain; charset=utf-8", "Forbidden");
        return;
    }

    fs.readFile(filePath, function (err, data) {
        if (err) {
            send(res, 404, "text/plain; charset=utf-8", "Not Found");
            return;
        }
        send(res, 200, mime[path.extname(filePath)] || "application/octet-stream", data);
    });
}

const server = http.createServer(function (req, res) {
    if (req.url === "/api/dashboard") {
        send(res, 200, "application/json; charset=utf-8", JSON.stringify(dashboardData));
        return;
    }

    serveStatic(req, res);
});

server.listen(port, function () {
    console.log("后台管理系统已启动：http://127.0.0.1:" + port);
});
