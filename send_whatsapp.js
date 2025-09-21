const {
  default: makeWASocket,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");

const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const { Boom } = require("@hapi/boom");

// Load config and payload
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
const payload = JSON.parse(fs.readFileSync("whatsapp_payload.json", "utf8"));
const groupId = config.group_id; // e.g. "1234567890-123456@g.us"

async function startBot() {
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState("baileys_auth");

  const sock = makeWASocket({
    version,
    auth: state,
    browser: ["LMS Agent", "Chrome", "20.0"],
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      console.log("📱 Scan this QR using WhatsApp → Linked Devices:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ WhatsApp connection established.");

      // Send text message
      try {
        await sock.sendMessage(groupId, { text: payload.message });
        console.log("📤 Message sent.");
      } catch (err) {
        console.error("❌ Failed to send message:", err);
      }

      // Send attachments
      for (const filePath of payload.attachments || []) {
        if (fs.existsSync(filePath)) {
          const buffer = fs.readFileSync(filePath);
          const mimeType = mime.lookup(filePath) || "application/octet-stream";
          const fileName = path.basename(filePath);

          try {
           await sock.sendMessage(groupId, {
  	   document: fs.readFileSync(filePath),
           mimetype: mime.lookup(filePath) || "application/pdf",
           fileName: path.basename(filePath),
           }); 
            console.log(`📎 Sent file: ${fileName}`);
          } catch (err) {
            console.error(`❌ Failed to send ${fileName}:`, err);
          }
        } else {
          console.warn(`⚠️ File not found: ${filePath}`);
        }
      }

      console.log("🎉 All files sent. Exiting..");
      process.exit(0);
    }

    if (connection === "close") {
      const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== 401);
      console.log("❌ Connection closed. Reconnect:", shouldReconnect);
      if (shouldReconnect) startBot();
    }
  });
}

startBot();

