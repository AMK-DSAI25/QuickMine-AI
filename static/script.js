let currentChat = null;

const chatList = document.getElementById("chatList");
const messages = document.getElementById("messages");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const newChatBtn = document.getElementById("newChat");
const toggleSidebarBtn = document.getElementById("toggleSidebar");
const sidebar = document.getElementById("sidebar");
const chatArea = document.querySelector(".chat-area");
const openSidebarBtn = document.getElementById("openSidebarBtn");

// Sidebar toggle
function updateSidebar() {
    if(sidebar.classList.contains("closed")){
        chatArea.style.flex = "1 1 100%";
        openSidebarBtn.style.display = "block";
    } else {
        chatArea.style.flex = "1";
        openSidebarBtn.style.display = "none";
    }
}
toggleSidebarBtn.onclick = () => { sidebar.classList.toggle("closed"); updateSidebar(); }
openSidebarBtn.onclick = () => { sidebar.classList.remove("closed"); updateSidebar(); }

// Load chats
async function loadChats() {
    const res = await fetch("/chats");
    const data = await res.json();
    chatList.innerHTML = "";
    data.forEach(chat => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${chat.title}</span><button class="delete-chat">X</button>`;
        li.onclick = (e) => { if(e.target.className!=="delete-chat") loadChat(chat.id); };
        li.querySelector(".delete-chat").onclick = async (e) => {
            e.stopPropagation();
            await fetch(`/delete-chat/${chat.id}`, { method:"POST" });
            loadChats();
        }
        chatList.appendChild(li);
    });
}

// Load chat
async function loadChat(id) {
    currentChat = id;
    const res = await fetch(`/chat/${id}`);
    const data = await res.json();
    messages.innerHTML = "";
    if(data.length === 0) messages.classList.add("empty");
    else messages.classList.remove("empty");
    data.forEach(m => addMessage(m.role, m.content));
}

// Add message
function addMessage(sender, text) {
    messages.classList.remove("empty");
    const div = document.createElement("div");
    div.className = sender;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

// Typing indicator
function addTyping() {
    const div = document.createElement("div");
    div.className = "assistant typing";
    div.textContent = "Assistant is typing...";
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
}

// Send
async function send() {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    addMessage("user", text);

    if (!currentChat) {
        const r = await fetch("/new-chat", { method:"POST" });
        const d = await r.json();
        currentChat = d.chat_id;
        loadChats();
    }

    const typingDiv = addTyping();

    const res = await fetch("/chat", {
        method:"POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ chat_id: currentChat, message: text })
    });
    const data = await res.json();
    typingDiv.remove();
    addMessage("assistant", data.reply);
    loadChats();
}

sendBtn.onclick = send;
input.addEventListener("keydown", e => { if(e.key === "Enter") send(); });
newChatBtn.onclick = () => { currentChat=null; messages.innerHTML="Start a chat or select one from the sidebar"; messages.classList.add("empty"); };
loadChats();
updateSidebar();




