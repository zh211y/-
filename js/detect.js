const modelText = document.querySelector("#modelText");
const statusText = document.querySelector("#statusText");
const resultImage = document.querySelector("#resultImage");
const preview = document.querySelector(".preview");
const cameraInput = document.querySelector("#cameraInput");
const liveBadge = document.querySelector("#liveBadge");
const detectList = document.querySelector("#detectList");

const MYCAM_BASE = "http://127.0.0.1:8010";
const CONFIDENCE = "0.25";
let isStreaming = false;

function resetPreview() {
    resultImage.removeAttribute("src");
    resultImage.style.display = "none";
    preview.classList.remove("has-image");
    liveBadge.classList.remove("online");
}

function startRealtime() {
    const camera = Number(cameraInput.value || 0);
    resetPreview();
    resultImage.src = MYCAM_BASE + "/video-feed?camera=" + camera + "&conf=" + CONFIDENCE + "&t=" + Date.now();
    resultImage.style.display = "block";
    preview.classList.add("has-image");
    liveBadge.classList.add("online");
    modelText.innerText = "实时监控已连接";
    statusText.innerText = "正在同步实时预测画面";
    detectList.innerHTML = "<li>实时监控中 <b>live</b></li>";
    isStreaming = true;
}

function showOffline() {
    isStreaming = false;
    resetPreview();
    modelText.innerText = "实时监控未连接";
    statusText.innerText = "等待实时检测同步";
    detectList.innerHTML = "<li>实时监控未连接 <b>offline</b></li>";
}

function syncRealtime() {
    fetch(MYCAM_BASE + "/status", { cache: "no-store" })
        .then(function (res) {
            if (!res.ok) {
                throw new Error("realtime offline");
            }
            return res.json();
        })
        .then(function () {
            if (!isStreaming) {
                startRealtime();
            }
        })
        .catch(showOffline);
}

resetPreview();
syncRealtime();
setInterval(syncRealtime, 2000);
