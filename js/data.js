/* 页面数据：统一放在 JS 中，方便后续替换成接口返回的数据 */
const appData = {
    animals: [
        { rank: 1, title: "黑颈鹤", desc: "高原湿地代表鸟类，常见于青海湖、玉树等湿地环境。", img: "./uploads/animals/animal-01-black-necked-crane.jpg", source: "https://en.wikipedia.org/wiki/Black-necked_crane" },
        { rank: 2, title: "藏原羚", desc: "青藏高原草地上的敏捷动物，常在开阔草原活动。", img: "./uploads/animals/animal-02-tibetan-gazelle.jpg", source: "https://en.wikipedia.org/wiki/Goa_(antelope)" },
        { rank: 3, title: "藏野驴", desc: "高原荒漠和草地常见大型野生动物，具有较强奔跑能力。", img: "./uploads/animals/animal-03-kiang.jpg", source: "https://en.wikipedia.org/wiki/Kiang" },
        { rank: 4, title: "雪豹", desc: "高山生态系统旗舰物种，是高原生态健康的重要象征。", img: "./uploads/animals/animal-04-snow-leopard.jpg", source: "https://en.wikipedia.org/wiki/Snow_leopard" },
        { rank: 5, title: "藏羚羊", desc: "青藏高原特有珍稀动物，迁徙通道保护十分重要。", img: "./uploads/animals/animal-05-tibetan-antelope.png", source: "https://en.wikipedia.org/wiki/Tibetan_antelope" },
        { rank: 6, title: "野牦牛", desc: "体型强健的大型高原动物，主要活动于高寒草地。", img: "./uploads/animals/animal-06-wild-yak.jpg", source: "https://en.wikipedia.org/wiki/Wild_yak" },
        { rank: 7, title: "白唇鹿", desc: "中国特有鹿科动物，多见于高山灌丛和草甸区域。", img: "./uploads/animals/animal-07-white-lipped-deer.jpg", source: "https://en.wikipedia.org/wiki/Thorold's_deer" },
        { rank: 8, title: "岩羊", desc: "常活动在高山岩坡地带，是雪豹等猛兽的重要猎物。", img: "./uploads/animals/animal-08-bharal.jpg", source: "https://en.wikipedia.org/wiki/Bharal" },
        { rank: 9, title: "盘羊", desc: "大型野生羊类，常栖息于高山草原和山地环境。", img: "./uploads/animals/animal-09-argali.jpg", source: "https://en.wikipedia.org/wiki/Argali" },
        { rank: 10, title: "兔狲", desc: "小型野生猫科动物，适应高寒荒漠和草原环境。", img: "./uploads/animals/animal-10-pallas-s-cat.jpg", source: "https://en.wikipedia.org/wiki/Pallas's_cat" },
        { rank: 11, title: "藏狐", desc: "青藏高原常见野生犬科动物，外形具有明显辨识度。", img: "./uploads/animals/animal-11-tibetan-fox.jpg", source: "https://en.wikipedia.org/wiki/Tibetan_fox" },
        { rank: 12, title: "喜马拉雅旱獭", desc: "高原草甸常见啮齿动物，常以洞穴群形式生活。", img: "./uploads/animals/animal-12-himalayan-marmot.jpg", source: "https://en.wikipedia.org/wiki/Himalayan_marmot" },
        { rank: 13, title: "棕熊", desc: "高原山地生态系统中的大型兽类，需要较大活动空间。", img: "./uploads/animals/animal-13-brown-bear.jpg", source: "https://en.wikipedia.org/wiki/Brown_bear" },
        { rank: 14, title: "狼", desc: "高原生态链中的重要捕食者，常在草原和山地活动。", img: "./uploads/animals/animal-14-wolf.jpg", source: "https://en.wikipedia.org/wiki/Wolf" },
        { rank: 15, title: "猞猁", desc: "中型猫科动物，多生活在山地林缘和灌丛环境。", img: "./uploads/animals/animal-15-eurasian-lynx.jpg", source: "https://en.wikipedia.org/wiki/Eurasian_lynx" },
        { rank: 16, title: "猎隼", desc: "珍贵猛禽，常在开阔地带捕食小型鸟兽。", img: "./uploads/animals/animal-16-saker-falcon.jpg", source: "https://en.wikipedia.org/wiki/Saker_falcon" },
        { rank: 17, title: "斑头雁", desc: "青海湖等湿地常见候鸟，具有高海拔迁飞能力。", img: "./uploads/animals/animal-17-bar-headed-goose.jpg", source: "https://en.wikipedia.org/wiki/Bar-headed_goose" },
        { rank: 18, title: "赤麻鸭", desc: "高原湖泊、河流湿地常见水鸟，羽色醒目。", img: "./uploads/animals/animal-18-ruddy-shelduck.jpg", source: "https://en.wikipedia.org/wiki/Ruddy_shelduck" },
        { rank: 19, title: "胡兀鹫", desc: "高山大型猛禽，在生态系统中承担清道夫角色。", img: "./uploads/animals/animal-19-bearded-vulture.jpg", source: "https://en.wikipedia.org/wiki/Bearded_vulture" },
        { rank: 20, title: "高山兀鹫", desc: "大型高原猛禽，常在山地和草原上空盘旋。", img: "./uploads/animals/animal-20-himalayan-vulture.jpg", source: "https://en.wikipedia.org/wiki/Himalayan_vulture" }
    ],
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
