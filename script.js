let prompt = document.querySelector("#prompt");
let container = document.querySelector(".container");
let btn = document.querySelector("#btn");
let chatContainer = document.querySelector(".chat-container");
let userMsg = null;
let chatHistory = {};

const Api_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=API_URL';

function createChatBox(html, className) {
    let div = document.createElement("div");
    div.classList.add(className);
    div.innerHTML = html;
    return div;
}

async function getApiResponse(aiChatBox) {
    let textElement = aiChatBox.querySelector(".text");
    const id = aiChatBox.getAttribute("data-id");

    try {
        let response = await fetch(Api_url, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: userMsg }
                        ]
                    }
                ]
            })
        });

        let data = await response.json();
        let apiResponse = data?.candidates[0].content.parts[0].text;
        textElement.innerText = apiResponse;

        // Save AI response in memory
        if (chatHistory[id]) {
            chatHistory[id].ai = apiResponse;
        }

    } catch (error) {
        console.error("API Error:", error);
        textElement.innerText = "Error fetching response.";
    } finally {
        aiChatBox.querySelector(".loading").style.display = "none";
    }
}

function showLoading(id) {
    const html = `<div class="img">
                    <img src="chatgpt_logo.webp" alt="logo">
                  </div>
                  <p class="text"></p>
                  <img class="loading" src="loading.gif" alt="loading">`;

    const aiChatBox = createChatBox(html, "ai-chat");
    aiChatBox.setAttribute("data-id", id);
    chatContainer.appendChild(aiChatBox);
    getApiResponse(aiChatBox);
}

function savePrompt(text, id) {
    const ul = document.querySelector("#saved-prompts");

    const li = document.createElement("li");
    li.setAttribute("data-id", id);

    const span = document.createElement("span");
    span.textContent = text;
    span.style.flex = "1";
    span.style.cursor = "pointer";

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "&times;";
    deleteBtn.title = "Unsave Prompt";
    deleteBtn.className = "delete-btn";

    deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation(); 
        ul.removeChild(li);

        const userChat = document.querySelector(`.user-chat[data-id="${id}"]`);
        const aiChat = document.querySelector(`.ai-chat[data-id="${id}"]`);
        if (userChat) userChat.remove();
        if (aiChat) aiChat.remove();

        delete chatHistory[id];
    });

    span.addEventListener("click", () => {
        prompt.value = text;
        prompt.focus();

        chatContainer.innerHTML = "";

        const data = chatHistory[id];
        if (!data) return;

        const userHtml = `<div class="img"><img src="uma_1.jpg" alt="user_pic"></div><p class="text">${data.user}</p>`;
        const userBox = createChatBox(userHtml, "user-chat");
        userBox.setAttribute("data-id", id);
        chatContainer.appendChild(userBox);

        if (data.ai) {
            const aiHtml = `<div class="img"><img src="chatgpt_logo.webp" alt="logo"></div><p class="text">${data.ai}</p>`;
            const aiBox = createChatBox(aiHtml, "ai-chat");
            aiBox.setAttribute("data-id", id);
            chatContainer.appendChild(aiBox);
        }

        chatContainer.scrollTop = chatContainer.scrollHeight;
    });

    li.appendChild(span);
    li.appendChild(deleteBtn);
    ul.appendChild(li);
}

btn.addEventListener("click", () => {
    userMsg = prompt.value.trim();
    if (!userMsg) return;

    const msgId = Date.now();

    const html = `<div class="img">
                    <img src="uma_1.jpg" alt="user_pic">
                  </div>
                  <p class="text"></p>`;

    const userChatBox = createChatBox(html, "user-chat");
    userChatBox.querySelector(".text").innerText = userMsg;
    userChatBox.setAttribute("data-id", msgId);
    chatContainer.appendChild(userChatBox);

    chatHistory[msgId] = { user: userMsg, ai: "" };

    savePrompt(userMsg, msgId);

    prompt.value = "";
    setTimeout(() => showLoading(msgId), 500);
    chatContainer.scrollTop = chatContainer.scrollHeight;
});

prompt.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        btn.click();
    }
});

document.getElementById("new-chat-btn").addEventListener("click", () => {
    chatContainer.innerHTML = "";
    prompt.value = "";
    container.style.display = "flex";
});
