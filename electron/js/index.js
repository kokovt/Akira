const toggleButton = document.getElementById("toggle-sidebar-img");
const sidebar = document.getElementById("sidebar");
const mainChat = document.getElementById("main-chat");
const messageHolder = document.getElementById("chat-holder");
const messageBox = document.getElementById("message-box");

let sidebarVisible = true;

window.akiraAPI.getBotName().then((botName) => {
    if (botName) {
        document.getElementById("bot-name").innerText = botName;
    }
});

function toggleSidebar() {
    sidebarVisible = !sidebarVisible;

    sidebar.hidden = !sidebar.hidden;
    if (sidebarVisible) {
        toggleButton.src = "./image/close_sidebar.svg";
        mainChat.style.width = "calc(100% - 300px)";
        mainChat.style.left = "300px";
    } else {
        toggleButton.src = "./image/open_sidebar.svg";
        mainChat.style.width = "100%";
        mainChat.style.left = "0px";
    }
}

messageBox.onkeyup = async (event) => {
    if (event.key == "Enter" && !event.shiftKey) {
        /**
         * @type {string}
         */
        const value = messageBox.value;
        messageBox.value = "";

        const div = document.createElement("div");

        div.innerHTML = `<div box-="square" shear-="top">
   <div class="header">
       <div></div>
       <span>${document.getElementById("username").textContent}</span>
       </div>
       ${value.replaceAll("&", "&#38;").replaceAll("<", "&#60;").replaceAll(">", "&#62;").replaceAll("\"", "&#34;").replaceAll("'", "&#39;").replaceAll("\n", "<br/>")}
</div>`;

        messageHolder.appendChild(div);

        const response = await window.akiraAPI.chat(value);

        const div2 = document.createElement("div");

        div2.innerHTML = `<div box-="square" shear-="top">
   <div class="header">
       <span>${document.getElementById("bot-name").innerText}</span>
       </div>
       ${response.replaceAll("&", "&#38;").replaceAll("<", "&#60;").replaceAll(">", "&#62;").replaceAll("\"", "&#34;").replaceAll("'", "&#39;").replaceAll("\n", "<br/>")}
</div>`;

        messageHolder.appendChild(div2);
    }
}