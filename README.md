# LMS Agent

**LMS Agent** is a tool that automates the daily download of subject files, posts, and comments uploaded by teachers, and sends them to a parents' WhatsApp group.

---

## Features

- Downloads new subject files, posts, and comments from LMS every day.
- Sends collected materials and messages to a WhatsApp group for parents.
- Automates WhatsApp messaging using the Baileys library.

---

## Project Structure

```
lms_agent/
├── messaging/
│   ├── whatsapp.js         # Initializes Baileys socket for WhatsApp
│   ├── sendText.js         # Sends text messages to WhatsApp
│   ├── sendDocument.js     # Sends document files to WhatsApp
│   └── session.js          # Handles QR code login and session management
├── send_whatsapp.js        # Main entry point for sending messages
├── config.json             # Configuration file containing WhatsApp group ID
├── whatsapp_payload.json   # Stores messages and attachments to be sent
```

---

## Usage

1. **Set up your own config.json** 
   {
  "username": "lms_username",
  "password": "lms_password",
  "login_url": "lms_url",
  "dashboard_url": "updated daily subjects dashboard url",
  "target_date": "format dd/mm/yyyy default is today()",
  "base_url": "base url for files downlaoding",
  "group_id": "whatsapp group id"
}
   

2. **Configure whatsapp Group**  
   Edit `config.json` to specify your WhatsApp group ID.

3. **Run the Agent**  
   Use `.\lms_agent.py` to start the agent.

4. **Set up WhatsApp Session**
   Run the application and scan the QR code to authenticate with WhatsApp. 

---

## Dependencies

- [Baileys](https://github.com/adiwajshing/Baileys) - WhatsApp Web API library for Node.js

---

## License

This project is provided for educational and automation purposes.

