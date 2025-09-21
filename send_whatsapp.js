const qrcode = require("qrcode-terminal");
const createSocket = require("./messaging/whatsapp");
const sendText = require("./messaging/sendText");
const sendDocument = require("./messaging/sendDocument");

const config = require("./config.json");
const payload = require("./whatsapp_payload.json");
const groupId = config.group_id;

(async () => {
  const sock = await createSocket();

  sock.ev.on("connection.update", async ({ connection, qr }) => {
    if (qr) {
      console.log("📱 Scan this QR using WhatsApp → Linked Devices:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ WhatsApp connection established.");

      // 🔹 Send header message
      await sendText(sock, groupId, `Hello, this is all the content for today (${payload.date})`);

      // 🔹 Send each subject block and its attachments
      for (const block of payload.subjects) {
        await sendText(sock, groupId, block.message);

        for (const filePath of block.attachments) {
          await sendDocument(sock, groupId, filePath);
        }

        console.log(`✅ Sent content for ${block.subject}`);
      }

      console.log("🎉 All messages sent. Exiting…");
      process.exit(0);
    }
  });
})();

