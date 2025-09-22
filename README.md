# LMS Agent

**LMS Agent** is a tool that automates the daily download of subject files, posts, and comments uploaded by teachers, and sends them to a parents' WhatsApp group.

---

## Features

- **Automated LMS Sync**: Downloads new subject files, posts, and comments from LMS every day.
- **WhatsApp Notifications**: Sends collected materials and messages to a WhatsApp group for parents.
- **Baileys Integration**: Automates WhatsApp messaging using the [Baileys](https://github.com/adiwajshing/Baileys) library.

---

## Project Structure

```plaintext
lms_agent/
├── messaging/
│   ├── whatsapp.js         # Initializes Baileys socket for WhatsApp
│   ├── sendText.js         # Sends text messages to WhatsApp
│   ├── sendDocument.js     # Sends document files to WhatsApp
│   └── session.js          # Handles QR code login and session management
├── send_whatsapp.js        # Main entry point for sending messages
├── config.json             # Configuration file containing WhatsApp group ID
├── whatsapp_payload.json   # Stores messages and attachments to be sent
|__ listener.js             # WhatsApp command listener
|__ utils/                  # Unified logging utility
|```  |___logger.js
|     |___logger.py            
|__ logs
|    |__lms_log_YYYY-MM-DD.txt #daily LMS logs
---
```

## Usage

### 1. Set up `config.json`

Create or edit your `config.json` with the following fields:

```json
{
  "username": "lms_username",
  "password": "lms_password",
  "login_url": "lms_url",
  "dashboard_url": "updated daily subjects dashboard url",
  "target_date": "format dd/mm/yyyy, default is today()",
  "base_url": "base url for files downloading",
  "group_id": "whatsapp group id"
}
```

### 2. Configure WhatsApp Group

Edit the `group_id` field in `config.json` to specify your WhatsApp group.

### 3. Run the Agent

Use the following command to start the agent:

```sh
python lms_agent.py
```

### 4. Set up WhatsApp Session

- Run the application.
- Scan the QR code that appears in the terminal to authenticate with WhatsApp.

---

## Dependencies

- [Baileys](https://github.com/adiwajshing/Baileys) &mdash; WhatsApp Web API library for Node.js

---

## License

This project is provided for educational and automation purposes only.

