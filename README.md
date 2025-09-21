agent that supports lms_downloads of subjects files, posts and comments uploaded by teachers every day
and send it on whatsapp group of parents daily

project structure

lms_agent/
├── messaging/
│   ├── whatsapp.js         # Initializes Baileys socket
│   ├── sendText.js         # Sends text messages
│   ├── sendDocument.js     # Sends documents
│   └── session.js          # Handles QR login + session
├── send_whatsapp.js        # Entry point
├── config.json             # Contains group_id
├── whatsapp_payload.json   # Contains message + attachments

