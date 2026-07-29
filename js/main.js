/* 首页渲染：把接口或 data.js 中的数据渲染到页面 */
if (localStorage.getItem("isLogin") !== "true") {
    location.href = "./login.html";
}

const menuList = document.querySelector("#menuList");
const animalAtlasList = document.querySelector("#animalAtlasList");
const animalPrev = document.querySelector("#animalPrev");
const animalNext = document.querySelector("#animalNext");
const animalPageText = document.querySelector("#animalPageText");
const weatherCity = document.querySelector("#weatherCity");
const weatherTemp = document.querySelector("#weatherTemp");
const weatherDesc = document.querySelector("#weatherDesc");
const clockText = document.querySelector("#clockText");
const statsList = document.querySelector("#statsList");
const eventTable = document.querySelector("#eventTable");
const legendList = document.querySelector("#legendList");
const deviceList = document.querySelector("#deviceList");
const envList = document.querySelector("#envList");
const adminBtn = document.querySelector("#adminBtn");
const adminName = document.querySelector("#adminName");
const adminMenu = document.querySelector("#adminMenu");
const profileBtn = document.querySelector("#profileBtn");
const logoutBtn = document.querySelector("#logoutBtn");
let dashboardData = appData;
const animalPageSize = 4;
let animalPageIndex = 0;
let animalTimer = null;
const qinghaiCities = {
    xining: { name: "西宁", latitude: 36.62, longitude: 101.78 },
    haidong: { name: "海东", latitude: 36.50, longitude: 102.10 },
    haibei: { name: "海北", latitude: 36.95, longitude: 100.90 },
    huangnan: { name: "黄南", latitude: 35.52, longitude: 102.02 },
    hainan: { name: "海南", latitude: 36.28, longitude: 100.62 },
    guoluo: { name: "果洛", latitude: 34.47, longitude: 100.25 },
    yushu: { name: "玉树", latitude: 33.00, longitude: 97.01 },
    haixi: { name: "海西", latitude: 37.37, longitude: 97.37 }
};
const weatherCodeMap = {
    0: "晴",
    1: "大部晴朗",
    2: "局部多云",
    3: "阴",
    45: "有雾",
    48: "雾凇",
    51: "小毛毛雨",
    53: "中等毛毛雨",
    55: "大毛毛雨",
    61: "小雨",
    63: "中雨",
    65: "大雨",
    71: "小雪",
    73: "中雪",
    75: "大雪",
    80: "小阵雨",
    81: "中阵雨",
    82: "强阵雨",
    95: "雷雨",
    96: "雷雨伴冰雹",
    99: "强雷雨伴冰雹"
};

function updateWeather(cityKey) {
    const city = qinghaiCities[cityKey] || qinghaiCities.xining;
    const apiUrl = "https://api.open-meteo.com/v1/forecast?latitude=" + city.latitude +
        "&longitude=" + city.longitude +
        "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m" +
        "&timezone=Asia%2FShanghai";

    weatherTemp.innerText = "--°C";
    weatherDesc.innerText = city.name + "实时天气加载中";

    fetch(apiUrl)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            const current = data.current || {};
            const temp = Math.round(current.temperature_2m);
            const desc = weatherCodeMap[current.weather_code] || "实时天气";
            const humidity = current.relative_humidity_2m;
            const wind = Math.round(current.wind_speed_10m || 0);

            weatherTemp.innerText = temp + "°C";
            weatherDesc.innerText = city.name + " " + desc + " 湿度" + humidity + "% 风速" + wind + "km/h";
        })
        .catch(function () {
            weatherTemp.innerText = "--°C";
            weatherDesc.innerText = "天气获取失败，请稍后重试";
        });
}

function padTime(value) {
    return String(value).padStart(2, "0");
}

function updateClock() {
    const now = new Date();
    const text = now.getFullYear() + "-" +
        padTime(now.getMonth() + 1) + "-" +
        padTime(now.getDate()) + " " +
        padTime(now.getHours()) + ":" +
        padTime(now.getMinutes()) + ":" +
        padTime(now.getSeconds());
    clockText.innerText = text;
}

function renderAdminName() {
    const loginUser = localStorage.getItem("loginUser") || "管理员";
    adminName.innerText = "管理员：" + loginUser;
}

function renderAnimalAtlas() {
    const animals = dashboardData.animals || dashboardData.carousel || [];
    if (!animals.length) {
        return;
    }

    const totalPages = Math.ceil(animals.length / animalPageSize);
    const start = animalPageIndex * animalPageSize;
    const pageAnimals = animals.slice(start, start + animalPageSize);

    animalAtlasList.innerHTML = pageAnimals.map(function (item) {
        const rank = String(item.rank || "").padStart(2, "0");
        return '<article class="animal-card">' +
            '<span class="animal-rank">' + rank + '</span>' +
            '<div class="animal-img"><img src="' + item.img + '" alt="' + item.title + '"></div>' +
            '<div class="animal-info">' +
            '<h4>' + item.title + '</h4>' +
            '<p>' + item.desc + '</p>' +
            '</div>' +
            '</article>';
    }).join("");

    animalPageText.innerText = (animalPageIndex + 1) + " / " + totalPages;
}

function showAnimalPage(index) {
    const animals = dashboardData.animals || dashboardData.carousel || [];
    const totalPages = Math.ceil(animals.length / animalPageSize);
    if (!totalPages) {
        return;
    }

    animalPageIndex = (index + totalPages) % totalPages;
    renderAnimalAtlas();
}

function startAnimalPlay() {
    clearInterval(animalTimer);
    animalTimer = setInterval(function () {
        showAnimalPage(animalPageIndex + 1);
    }, 4500);
}

function renderMenu() {
    menuList.innerHTML = dashboardData.menu.map(function (item, index) {
        let content = '<span class="iconfont ' + item[0] + '"></span>' + item[1];
        if (item[2]) {
            content = '<a href="' + item[2] + '">' + content + '</a>';
        }
        return '<li class="' + (index === 0 ? "active" : "") + '">' + content + '</li>';
    }).join("");
}

function renderStats() {
    statsList.innerHTML = dashboardData.stats.map(function (item) {
        return '<div class="stat-card">' +
            '<span class="stat-icon iconfont ' + item.icon + '" style="background:' + item.color + ';color:' + item.iconColor + '"></span>' +
            '<div><h3>' + item.title + '</h3><strong>' + item.value + '</strong><p class="' + item.trend + '">' + item.desc + '</p></div>' +
            '</div>';
    }).join("");
}

function renderEvents() {
    eventTable.innerHTML = dashboardData.events.map(function (item) {
        const tagClass = item.type.indexOf("设备") > -1 || item.type.indexOf("行人靠近") > -1 ? "gray" : "green";
        const levelClass = item.level === "高危" ? "high" : item.level === "中危" ? "mid" : "low";
        const stateClass = item.state === "已处理" ? "done" : "todo";
        return '<tr>' +
            '<td><img class="event-img" src="' + item.img + '" alt=""></td>' +
            '<td><span class="tag ' + tagClass + '">' + item.type + '</span></td>' +
            '<td>' + item.place + '</td>' +
            '<td>' + item.time + '</td>' +
            '<td><span class="level ' + levelClass + '">' + item.level + '</span></td>' +
            '<td><span class="state ' + stateClass + '">' + item.state + '</span></td>' +
            '<td><a class="detail-link" href="#">查看详情</a></td>' +
            '</tr>';
    }).join("");
}

function renderSideInfo() {
    legendList.innerHTML = dashboardData.warnings.map(function (item) {
        return '<li><span class="dot" style="background:' + item.color + '"></span>' + item.name + '<b>' + item.value + '</b></li>';
    }).join("");

    deviceList.innerHTML = dashboardData.devices.map(function (item) {
        return '<li><span class="dot" style="background:' + item.color + '"></span>' + item.name + '<b>' + item.value + '</b></li>';
    }).join("");

    envList.innerHTML = dashboardData.env.map(function (item) {
        return '<div class="env-item"><span class="iconfont ' + item.icon + '"></span><div><p>' + item.name + '</p><strong>' + item.value + '</strong></div></div>';
    }).join("");
}

function initDashboard(data) {
    dashboardData = data || appData;
    if (!dashboardData.animals || dashboardData.animals.length < appData.animals.length) {
        dashboardData.animals = appData.animals || appData.carousel;
    }
    animalPageIndex = 0;
    renderAnimalAtlas();
    startAnimalPlay();
    renderMenu();
    renderStats();
    renderEvents();
    renderSideInfo();
    renderAdminName();
}

adminBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    adminMenu.classList.toggle("hide");
});

adminMenu.addEventListener("click", function (e) {
    e.stopPropagation();
});

profileBtn.addEventListener("click", function () {
    alert("个人资料功能暂未开通");
    adminMenu.classList.add("hide");
});

logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("loginUser");
    location.href = "./login.html";
});

document.addEventListener("click", function () {
    adminMenu.classList.add("hide");
});

animalPrev.addEventListener("click", function () {
    showAnimalPage(animalPageIndex - 1);
    startAnimalPlay();
});

animalNext.addEventListener("click", function () {
    showAnimalPage(animalPageIndex + 1);
    startAnimalPlay();
});

weatherCity.addEventListener("change", function () {
    updateWeather(weatherCity.value);
});

/* 模拟后端接口：使用 server.js 启动时会读取接口，直接打开页面时使用本地数据 */
fetch("/api/dashboard")
    .then(function (res) {
        return res.ok ? res.json() : appData;
    })
    .then(initDashboard)
    .catch(function () {
        initDashboard(appData);
    });

updateWeather(weatherCity.value);
updateClock();
setInterval(updateClock, 1000);
