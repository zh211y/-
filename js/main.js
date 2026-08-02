/* 首页渲染：只渲染数据库接口返回的数据 */
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
const toggleAllEvents = document.querySelector("#toggleAllEvents");
const eventPagination = document.querySelector("#eventPagination");
const imageModal = document.querySelector("#imageModal");
const imageModalImg = document.querySelector("#imageModalImg");
const imageModalMask = document.querySelector("#imageModalMask");
const imageModalClose = document.querySelector("#imageModalClose");
const legendList = document.querySelector("#legendList");
const deviceList = document.querySelector("#deviceList");
const envList = document.querySelector("#envList");
const warningTotal = document.querySelector("#warningTotal");
const adminBtn = document.querySelector("#adminBtn");
const adminName = document.querySelector("#adminName");
const adminMenu = document.querySelector("#adminMenu");
const profileBtn = document.querySelector("#profileBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const DEFAULT_MENU = [
    ["icon-shouye6", "首页概览"],
    ["icon-jiankong", "实时监控", "./detect.html"],
    ["icon-shijian", "事件管理"],
    ["icon-shebei", "设备管理"],
    ["icon-shuju", "数据统计"],
    ["icon-ditu", "地图总览"],
    ["icon-zhongguohangtiantubiaoheji-weizhuanlunkuo-", "关于产品", "./about-product.html"],
    ["icon-guanyuwomen", "关于我们", "./about-us.html"],
    ["icon-jiangbei", "团队荣誉", "./team-honor.html"]
];
const EMPTY_DASHBOARD = {
    animals: [],
    menu: DEFAULT_MENU,
    stats: [],
    events: [],
    warnings: [],
    devices: [],
    env: []
};
let dashboardData = EMPTY_DASHBOARD;
let showingAllEvents = false;
let allEventItems = [];
const allEventsPageSize = 6;
let allEventsPage = 1;
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
    const animals = Array.isArray(dashboardData.animals) ? dashboardData.animals : [];
    if (!animals.length) {
        animalAtlasList.innerHTML = '<div class="empty-state">数据库暂无动物图鉴数据</div>';
        animalPageText.innerText = "0 / 0";
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
    const animals = Array.isArray(dashboardData.animals) ? dashboardData.animals : [];
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

function loadAnimalAtlas() {
    const animals = Array.isArray(dashboardData.animals) ? dashboardData.animals : [];
    if (animals.length) {
        return;
    }

    if (Array.isArray(window.animalAtlasData) && window.animalAtlasData.length) {
        dashboardData.animals = window.animalAtlasData;
        animalPageIndex = 0;
        renderAnimalAtlas();
        startAnimalPlay();
        return;
    }

    fetch("./uploads/animals/animals.json")
        .then(function (res) {
            if (!res.ok) {
                throw new Error("animal atlas not found");
            }
            return res.json();
        })
        .then(function (items) {
            dashboardData.animals = Array.isArray(items) ? items : [];
            animalPageIndex = 0;
            renderAnimalAtlas();
            startAnimalPlay();
        })
        .catch(function () {
            renderAnimalAtlas();
        });
}

function renderMenu() {
    const menu = Array.isArray(dashboardData.menu) && dashboardData.menu.length ? dashboardData.menu : DEFAULT_MENU;
    menuList.innerHTML = menu.map(function (item, index) {
        const href = index === 1 ? "./detect.html" : item[2];
        const alertText = index >= 2 && index <= 4 ? "暂未开通" : "";
        let content = '<span class="iconfont ' + item[0] + '"></span>' + item[1];
        if (href) {
            content = '<a href="' + href + '">' + content + '</a>';
        }
        return '<li class="' + (index === 0 ? "active" : "") + '" data-href="' + (href || "") + '" data-alert="' + alertText + '">' + content + '</li>';
    }).join("");
}

function renderStats() {
    const stats = Array.isArray(dashboardData.stats) ? dashboardData.stats : [];
    statsList.innerHTML = stats.map(function (item) {
        return '<div class="stat-card">' +
            '<span class="stat-icon iconfont ' + item.icon + '" style="background:' + item.color + ';color:' + item.iconColor + '"></span>' +
            '<div><h3>' + item.title + '</h3><strong>' + item.value + '</strong><p class="' + item.trend + '">' + item.desc + '</p></div>' +
            '</div>';
    }).join("");

}

function escapeAttr(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function normalizeEvent(item) {
    return {
        id: item.id || item.event_id || "",
        type: item.type || item.event_type || "动物靠近",
        label: item.label || "",
        confidence: Number(item.confidence || 0),
        place: item.place || "实时监控点位",
        time: item.time || String(item.created_at || "").replace(" ", "<br>"),
        level: item.level || "低危",
        state: item.state || "未处理",
        img: item.img || item.image || "./uploads/首页图片.jpg"
    };
}

function renderEvents() {
    const sourceEvents = showingAllEvents ? allEventItems : dashboardData.events;
    const events = Array.isArray(sourceEvents) ? sourceEvents.map(normalizeEvent) : [];
    const visibleEvents = getVisibleEvents(events);
    if (!events.length) {
        renderEventPagination(0);
        eventTable.innerHTML = '<tr><td colspan="7" class="empty-state">数据库暂无 YOLO 检测事件</td></tr>';
        return;
    }

    eventTable.innerHTML = visibleEvents.map(function (item) {
        const tagClass = item.type.indexOf("设备") > -1 || item.type.indexOf("行人靠近") > -1 ? "gray" : "green";
        const levelClass = item.level === "高危" ? "high" : item.level === "中危" ? "mid" : "low";
        const stateClass = stateClassName(item.state);
        const labelText = item.label ? '<br><small>' + item.label + ' ' + Math.round((item.confidence || 0) * 100) + '%</small>' : "";
        return '<tr>' +
            '<td><img class="event-img" src="' + item.img + '" alt=""></td>' +
            '<td><span class="tag ' + tagClass + '">' + item.type + labelText + '</span></td>' +
            '<td>' + item.place + '</td>' +
            '<td>' + item.time + '</td>' +
            '<td><span class="level ' + levelClass + '">' + item.level + '</span></td>' +
            '<td><select class="state state-select ' + stateClass + '" data-id="' + escapeAttr(item.id) + '">' + renderStateOptions(item.state) + '</select></td>' +
            '<td><a class="detail-link" href="#" data-image="' + escapeAttr(item.img) + '">查看详情</a></td>' +
            '</tr>';
    }).join("");
    renderEventPagination(events.length);
}

function stateClassName(state) {
    if (state === "已处理") {
        return "done";
    }
    if (state === "处理中") {
        return "doing";
    }
    return "todo";
}

function renderStateOptions(selected) {
    return ["未处理", "处理中", "已处理"].map(function (state) {
        return '<option value="' + state + '" ' + (state === selected ? "selected" : "") + '>' + state + '</option>';
    }).join("");
}

function getVisibleEvents(events) {
    if (!showingAllEvents) {
        return events;
    }

    const totalPages = Math.max(1, Math.ceil(events.length / allEventsPageSize));
    allEventsPage = Math.min(Math.max(1, allEventsPage), totalPages);
    const start = (allEventsPage - 1) * allEventsPageSize;
    return events.slice(start, start + allEventsPageSize);
}

function renderEventPagination(total) {
    if (!eventPagination) {
        return;
    }

    const totalPages = Math.max(1, Math.ceil(total / allEventsPageSize));
    if (!showingAllEvents || total <= allEventsPageSize) {
        eventPagination.classList.add("hide");
        eventPagination.innerHTML = "";
        return;
    }

    allEventsPage = Math.min(Math.max(1, allEventsPage), totalPages);
    const pageButtons = [];
    for (let page = 1; page <= totalPages; page += 1) {
        pageButtons.push(
            '<button type="button" class="' + (page === allEventsPage ? "active" : "") + '" data-page="' + page + '">' + page + '</button>'
        );
    }

    eventPagination.classList.remove("hide");
    eventPagination.innerHTML =
        '<button type="button" data-page="prev" ' + (allEventsPage === 1 ? "disabled" : "") + '>上一页</button>' +
        pageButtons.join("") +
        '<button type="button" data-page="next" ' + (allEventsPage === totalPages ? "disabled" : "") + '>下一页</button>' +
        '<span>第 ' + allEventsPage + ' / ' + totalPages + ' 页</span>';
}

function openImageModal(src) {
    if (!src || !imageModal || !imageModalImg) {
        return;
    }
    imageModalImg.src = src;
    imageModal.classList.remove("hide");
}

function closeImageModal() {
    if (!imageModal || !imageModalImg) {
        return;
    }
    imageModal.classList.add("hide");
    imageModalImg.src = "";
}

function loadAllEvents() {
    fetch(API_BASE + "/api/detections?ts=" + Date.now())
        .then(function (res) {
            if (!res.ok) {
                throw new Error("detections api error");
            }
            return res.json();
        })
        .then(function (items) {
            allEventItems = Array.isArray(items) ? items.slice().sort(function (a, b) {
                return Number(b.id || 0) - Number(a.id || 0);
            }) : [];
            renderEvents();
        });
}

function patchLocalEventState(id, state) {
    function updateList(list) {
        if (!Array.isArray(list)) {
            return;
        }
        list.forEach(function (item) {
            if (Number(item.id) === Number(id)) {
                item.state = state;
            }
        });
    }

    updateList(allEventItems);
    updateList(dashboardData.events);
}

function updateEventState(id, state, select) {
    if (!id) {
        return;
    }

    if (select) {
        select.disabled = true;
    }

    fetch(API_BASE + "/api/detections/" + encodeURIComponent(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: state })
    })
        .then(function (res) {
            if (!res.ok) {
                throw new Error("state api error");
            }
            return res.json();
        })
        .then(function () {
            patchLocalEventState(id, state);
            renderEvents();
            refreshDashboard();
        })
        .catch(function () {
            alert("状态保存失败，请确认 Node 服务正在运行");
            renderEvents();
        })
        .finally(function () {
            if (select) {
                select.disabled = false;
            }
        });
}

function renderSideInfo() {
    const warnings = Array.isArray(dashboardData.warnings) ? dashboardData.warnings : [];
    const devices = Array.isArray(dashboardData.devices) ? dashboardData.devices : [];
    const env = Array.isArray(dashboardData.env) ? dashboardData.env : [];
    const totalWarnings = warnings.reduce(function (sum, item) {
        const match = String(item.value || "").match(/\d+/);
        return sum + (match ? Number(match[0]) : 0);
    }, 0);

    if (warningTotal) {
        warningTotal.innerHTML = totalWarnings + "<em>总预警</em>";
    }

    legendList.innerHTML = warnings.length ? warnings.map(function (item) {
        return '<li><span class="dot" style="background:' + item.color + '"></span>' + item.name + '<b>' + item.value + '</b></li>';
    }).join("") : '<li class="empty-state">暂无预警分布数据</li>';

    deviceList.innerHTML = devices.length ? devices.map(function (item) {
        return '<li><span class="dot" style="background:' + item.color + '"></span>' + item.name + '<b>' + item.value + '</b></li>';
    }).join("") : '<li class="empty-state">暂无设备数据</li>';

    envList.innerHTML = env.length ? env.map(function (item) {
        return '<div class="env-item"><span class="iconfont ' + item.icon + '"></span><div><p>' + item.name + '</p><strong>' + item.value + '</strong></div></div>';
    }).join("") : '<div class="empty-state">暂无环境数据</div>';
}

function initDashboard(data) {
    const currentAnimals = Array.isArray(dashboardData.animals) ? dashboardData.animals : [];
    dashboardData = Object.assign({}, EMPTY_DASHBOARD, data || {});
    if (!Array.isArray(dashboardData.menu) || !dashboardData.menu.length) {
        dashboardData.menu = DEFAULT_MENU;
    }
    if ((!Array.isArray(dashboardData.animals) || !dashboardData.animals.length) && currentAnimals.length) {
        dashboardData.animals = currentAnimals;
    }
    animalPageIndex = 0;
    renderAnimalAtlas();
    loadAnimalAtlas();
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

menuList.addEventListener("click", function (event) {
    const item = event.target.closest("li[data-href]");
    if (item && item.dataset.alert) {
        event.preventDefault();
        alert(item.dataset.alert);
        return;
    }
    if (item && item.dataset.href) {
        location.href = item.dataset.href;
    }
});

eventTable.addEventListener("click", function (event) {
    const link = event.target.closest(".detail-link");
    if (!link) {
        return;
    }
    event.preventDefault();
    openImageModal(link.dataset.image);
});

eventTable.addEventListener("change", function (event) {
    const select = event.target.closest(".state-select");
    if (!select) {
        return;
    }
    select.className = "state state-select " + stateClassName(select.value);
    updateEventState(select.dataset.id, select.value, select);
});

if (toggleAllEvents) {
    toggleAllEvents.addEventListener("click", function (event) {
        event.preventDefault();
        showingAllEvents = !showingAllEvents;
        toggleAllEvents.innerText = showingAllEvents ? "收起" : "查看更多";
        if (showingAllEvents) {
            allEventsPage = 1;
            loadAllEvents();
        } else {
            renderEvents();
        }
    });
}

if (eventPagination) {
    eventPagination.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-page]");
        if (!button || button.disabled) {
            return;
        }

        const totalPages = Math.max(1, Math.ceil(allEventItems.length / allEventsPageSize));
        if (button.dataset.page === "prev") {
            allEventsPage -= 1;
        } else if (button.dataset.page === "next") {
            allEventsPage += 1;
        } else {
            allEventsPage = Number(button.dataset.page);
        }

        allEventsPage = Math.min(Math.max(1, allEventsPage), totalPages);
        renderEvents();
    });
}

if (imageModalMask) {
    imageModalMask.addEventListener("click", closeImageModal);
}

if (imageModalClose) {
    imageModalClose.addEventListener("click", closeImageModal);
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeImageModal();
    }
});

/* Node.js JSON 数据接口 */
const API_BASE = location.port === "5500" ? "" : "http://127.0.0.1:5500";

function refreshDashboard() {
    fetch(API_BASE + "/api/dashboard?ts=" + Date.now())
        .then(function (res) {
            if (!res.ok) {
                throw new Error("dashboard api error");
            }
            return res.json();
        })
        .then(initDashboard)
        .then(function () {
            if (showingAllEvents) {
                loadAllEvents();
            }
        })
        .catch(function () {
            if (!dashboardData || dashboardData === EMPTY_DASHBOARD) {
                initDashboard(EMPTY_DASHBOARD);
            }
        });
}

refreshDashboard();
setInterval(refreshDashboard, 3000);

updateWeather(weatherCity.value);
updateClock();
setInterval(updateClock, 1000);
