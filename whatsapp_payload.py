# whatsapp_payload.py
import os
import json

def build_payload(base_dir, target_date):
    payload = {
        "date": target_date,
        "subjects": []
    }

    for subject in os.listdir(base_dir):
        subject_path = os.path.join(base_dir, subject, target_date.replace("/", "-"))
        if not os.path.isdir(subject_path):
            continue

        block = {
            "subject": subject,
            "message": "",
            "attachments": []
        }

        block["message"] += f"📚 *Subject: {subject}*\n\n"

        files = [f for f in os.listdir(subject_path) if f.lower().endswith((".pdf", ".pptx", ".docx", ".doc"))]
        if files:
            block["message"] += "📎 *Files:*\n" + "\n".join(f"- {f}" for f in files) + "\n\n"
            for f in files:
                block["attachments"].append(os.path.join(subject_path, f))

        for extra_file in ["comment.txt", "post.txt"]:
            extra_path = os.path.join(subject_path, extra_file)
            if os.path.exists(extra_path):
                with open(extra_path, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                    label = "🗒️ *Comment*" if extra_file == "comment.txt" else "📢 *Post*"
                    block["message"] += f"{label}:\n{content}\n\n"

        #block["message"] += f"📤 *Attachments for {subject} are being sent…*\n"
        payload["subjects"].append(block)

    with open("whatsapp_payload.json", "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    print("✅ WhatsApp payload saved to whatsapp_payload.json")

