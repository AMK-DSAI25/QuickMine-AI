import uuid

chats = {}

def create_chat():
    chat_id = str(uuid.uuid4())
    chats[chat_id] = {"title": "New Chat", "messages": []}
    return chat_id

def list_chats():
    return [{"id": cid, "title": data["title"]} for cid, data in chats.items()]

def get_chat(chat_id):
    return chats.get(chat_id, {}).get("messages", [])

def add_message(chat_id, role, content):
    if chat_id not in chats:
        create_chat()
    chats[chat_id]["messages"].append({"role": role, "content": content})
    if role == "user" and chats[chat_id]["title"] == "New Chat":
        chats[chat_id]["title"] = content[:40]

def delete_chat(chat_id):
    if chat_id in chats:
        del chats[chat_id]
