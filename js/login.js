/* 登录逻辑：用户名和密码正确后跳转到首页 */
const loginForm = document.querySelector("#loginForm");
const username = document.querySelector("#username");
const password = document.querySelector("#password");
const togglePassword = document.querySelector("#togglePassword");
const deviceLogin = document.querySelector("#deviceLogin");
const forgotPassword = document.querySelector("#forgotPassword");
const rememberMe = document.querySelector("#rememberMe");
const loginError = document.querySelector("#loginError");
const loginPage = document.querySelector("#loginPage");
const loginCard = document.querySelector("#loginCard");
const openLogin = document.querySelector("#openLogin");
const closeLogin = document.querySelector("#closeLogin");
const entryScene = document.querySelector("#entryScene");
let focusTimer;

function setLoginOpen(isOpen) {
    clearTimeout(focusTimer);
    loginPage.classList.toggle("is-login-open", isOpen);
    loginCard.inert = !isOpen;
    loginCard.setAttribute("aria-hidden", String(!isOpen));
    openLogin.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
        closeLogin.focus({ preventScroll: true });
        entryScene.inert = true;
        focusTimer = setTimeout(() => {
            (username.value ? password : username).focus({ preventScroll: true });
            if (matchMedia("(max-width: 760px)").matches) {
                loginCard.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "center" });
            }
        }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650);
    } else {
        entryScene.inert = false;
        openLogin.focus({ preventScroll: true });
    }
}

openLogin.addEventListener("click", () => setLoginOpen(true));
closeLogin.addEventListener("click", () => setLoginOpen(false));
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && loginPage.classList.contains("is-login-open")) {
        setLoginOpen(false);
    }
});

const validUsers = [
    {
        username: "zjc",
        password: "123456"
    },
    {
        username: "blj",
        password: "123456"
    },
    {
        username: "xxx",
        password: "123456"
    }
];   

function showError(message) {
    loginError.innerText = message;
}

function goDashboard(user) {
    localStorage.setItem("isLogin", "true");
    localStorage.setItem("loginUser", user);
    location.href = "./index.html";
}

loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const inputUser = username.value.trim();
    const inputPassword = password.value.trim();

    if (!inputUser || !inputPassword) {
        showError("请输入用户名和密码");
        return;
    }

    const matchedUser = validUsers.find(function (user) {
        return inputUser === user.username && inputPassword === user.password;
    });

    if (matchedUser) {
        if (rememberMe.checked) {
            localStorage.setItem("rememberUser", inputUser);
        } else {
            localStorage.removeItem("rememberUser");
        }
        goDashboard(inputUser);
        return;
    }

    showError("用户名或密码错误，请重新输入");
});

deviceLogin.addEventListener("click", function () {
    alert("民大学号登录功能暂未开通");
});

forgotPassword.addEventListener("click", function (e) {
    e.preventDefault();
    alert("忘记密码功能暂未开通");
});

togglePassword.addEventListener("click", function () {
    password.type = password.type === "password" ? "text" : "password";
    togglePassword.setAttribute("aria-label", password.type === "password" ? "显示密码" : "隐藏密码");
    togglePassword.setAttribute("aria-pressed", String(password.type === "text"));
});

const rememberedUser = localStorage.getItem("rememberUser");
if (rememberedUser) {
    username.value = rememberedUser;
}
