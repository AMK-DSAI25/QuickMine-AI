const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const hero = document.getElementById("hero");
const chatHistoryDiv = document.getElementById("chat-history");

let currentChatId = null;

/* ENTER KEY SUPPORT */
input.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

/* LOAD CHAT HISTORY INTO SIDEBAR */
async function loadChatHistory() {
    chatHistoryDiv.innerHTML = "";
    const res = await fetch("/chats");
    const chats = await res.json();

    chats.forEach(c => {
        const chatBtn = document.createElement("button");
        chatBtn.className = "chat-history-btn";
        chatBtn.textContent = c.name;  // friendly name
        chatBtn.onclick = () => loadChat(c.chat_id);
        chatHistoryDiv.appendChild(chatBtn);
    });
}

/* LOAD A SINGLE CHAT MESSAGES */
async function loadChat(chat_id) {
    const res = await fetch(`/chat/${chat_id}`);
    const messages = await res.json();

    chatBox.innerHTML = ""; // clear current chat
    hero.style.display = "none";
    currentChatId = chat_id;

    messages.forEach(msg => {
        const div = document.createElement("div");
        div.className = `message ${msg.role === "user" ? "user" : "ai"}`;
        div.textContent = msg.content;
        chatBox.appendChild(div);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
}

/* CREATE NEW CHAT */
async function createNewChat() {
    hero.style.display = "flex";
    chatBox.innerHTML = "";

    const res = await fetch("/new-chat", { method: "POST" });
    const data = await res.json();
    currentChatId = data.chat_id;

    await loadChatHistory(); // refresh sidebar
}

/* SHOW THINKING INDICATOR */
function showThinking() {
    const div = document.createElement("div");
    div.className = "message ai thinking";
    div.id = "thinking";
    div.innerHTML = `<span>Thinking</span><span class="dots"></span>`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

/* SEND MESSAGE */
async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    if (!currentChatId) await createNewChat();

    hero.style.display = "none";

    // Add user message
    const userDiv = document.createElement("div");
    userDiv.className = "message user";
    userDiv.textContent = message;
    chatBox.appendChild(userDiv);

    input.value = "";
    showThinking();

    try {
        const res = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: currentChatId,
                message: message
            })
        });

        const data = await res.json();
        const thinking = document.getElementById("thinking");
        if (thinking) thinking.remove();

        const aiDiv = document.createElement("div");
        aiDiv.className = "message ai";
        aiDiv.textContent = data.reply;
        chatBox.appendChild(aiDiv);

        chatBox.scrollTop = chatBox.scrollHeight;

        // Refresh chat history
        await loadChatHistory();

    } catch {
        const thinking = document.getElementById("thinking");
        if (thinking) thinking.remove();

        alert("⚠️ Error contacting server.");
    }
}

/* INITIAL LOAD */
window.addEventListener("load", async () => {
    await loadChatHistory();
});
