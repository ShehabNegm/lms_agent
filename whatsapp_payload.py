# whatsapp_payload.py
import os
import json

def build_payload(base_dir, target_date):
    payload = {
        "date": target_date,
        "message": "",
        "attachments": []
    }

    message = f"Hello, this is all the content for today ({target_date}):\n\n"

    for subject in os.listdir(base_dir):
        subject_path = os.path.join(base_dir, subject, target_date.replace("/", "-"))
        if not os.path.isdir(subject_path):
            continue

        message += f"{subject}:\n"
        files = [f for f in os.listdir(subject_path) if f.lower().endswith((".pdf", ".pptx", ".docx", ".doc"))]
        message += "Files:\n" + "\n".join(f"- {f}" for f in files) + "\n"

        for f in files:
            payload["attachments"].append(os.path.join(subject_path, f))

        comment_path = os.path.join(subject_path, "comment.txt")
        if os.path.exists(comment_path):
            with open(comment_path, "r", encoding="utf-8") as f:
                comment = f.read().strip()
                message += f"Comment:\n{comment}\n"

        message += "\n"

    payload["message"] = message

    with open("whatsapp_payload.json", "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    print("✅ WhatsApp payload saved to whatsapp_payload.json")

