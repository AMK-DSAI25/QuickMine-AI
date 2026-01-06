from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import os
from groq import Groq
import chat_store

load_dotenv()

app = Flask(__name__)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/new-chat", methods=["POST"])
def new_chat():
    chat_id = chat_store.create_chat()
    return jsonify({"chat_id": chat_id})


@app.route("/chats")
def chats():
    return jsonify(chat_store.list_chats())


@app.route("/chat/<chat_id>")
def get_chat(chat_id):
    return jsonify(chat_store.get_chat(chat_id))


@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    chat_id = data.get("chat_id")
    user_message = data.get("message")

    if not chat_id or not user_message:
        return jsonify({"reply": "Invalid request"}), 400

    chat_store.add_message(chat_id, "user", user_message)

    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=chat_store.get_chat(chat_id),
        temperature=0.7,
        max_tokens=1024
    )

    reply = completion.choices[0].message.content

    chat_store.add_message(chat_id, "assistant", reply)

    return jsonify({"reply": reply})


if __name__ == "__main__":
    app.run(debug=True)
