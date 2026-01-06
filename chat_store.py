import uuid

chats = {}
chat_names = {}  # stores friendly chat names

def create_chat():
    chat_id = str(uuid.uuid4())
    chats[chat_id] = [{"role": "system", "content": "You are a helpful AI assistant."}]
    chat_names[chat_id] = None  # name will be set after first user message
    return chat_id

def set_chat_name(chat_id, name):
    chat_names[chat_id] = name

def list_chats():
    result = []
    for cid in chats.keys():
        name = chat_names.get(cid)
        if not name:
            name = "New Chat"
        result.append({"chat_id": cid, "name": name})
    return result

def get_chat(chat_id):
    return chats.get(chat_id, [])

def add_message(chat_id, role, content):
    if chat_id in chats:
        chats[chat_id].append({"role": role, "content": content})
        # set friendly name if first user message
        if role == "user" and chat_names.get(chat_id) is None:
            friendly_name = " ".join(content.strip().split()[:5])  # first 5 words
            chat_names[chat_id] = friendly_name
