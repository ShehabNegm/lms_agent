const qrcode = require("qrcode-terminal");
const createSocket = require("./messaging/whatsapp");
const sendText = require("./messaging/sendText");
const sendDocument = require("./messaging/sendDocument");
const log = require("./utils/logger");
const { exec } = require("child_process");
const fs = require("fs");
const allowedSenders = [
  "201oo1573240@s.whatsapp.net", // your number
  "201124585522@s.whatsapp.net"  // 2nd number
];


const passphrase = "magic69";
let lastStatus = "Idle";

(async () => {
  const sock = await createSocket();

  sock.ev.on("connection.update", ({ connection, qr }) => {
    if (qr) {
      console.log("📱 Scan this QR using WhatsApp → Linked Devices:");
      qrcode.generate(qr, { small: true });
    }
    if (connection === "open") {
      log("✅ WhatsApp listener is live.");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    const sender = msg.key.remoteJid;
    console.log("🔍 Sender JID:", sender);
    const text = msg.message?.conversation?.trim();

    if (sender !== allowedSender || !text) return;
    log(`📩 Command received: ${text}`);

    if (text.startsWith("!send")) {
      if (!text.includes(passphrase)) {
        await sendText(sock, sender, "❌ Invalid passphrase.");
        return;
      }

      lastStatus = "Sending LMS content…";
      await sendText(sock, sender, "📤 Starting LMS agent…");

      exec("python3 whatsapp_payload.py && node send_whatsapp.js", async (err) => {
        if (err) {
          lastStatus = "❌ Failed to send.";
          log(err.message);
          await sendText(sock, sender, "❌ Error during send.");
        } else {
          lastStatus = "✅ Content sent.";
          await sendText(sock, sender, "✅ LMS content sent.");
        }
      });
    }

    else if (text === "!status") {
      await sendText(sock, sender, `📊 Status: ${lastStatus}`);
    }

    else if (text === "!retry") {
      lastStatus = "Retrying LMS send…";
      await sendText(sock, sender, "🔁 Retrying…");

      exec("node send_whatsapp.js", async (err) => {
        if (err) {
          lastStatus = "❌ Retry failed.";
          log(err.message);
          await sendText(sock, sender, "❌ Retry failed.");
        } else {
          lastStatus = "✅ Retry successful.";
          await sendText(sock, sender, "✅ Retry successful.");
        }
      });
    }

    else if (text === "!cancel") {
      lastStatus = "Cancelled.";
      await sendText(sock, sender, "🛑 Operation cancelled.");
    }

    else if (text === "!preview") {
      const payload = require("./whatsapp_payload.json");
      let preview = `📅 *Preview for ${payload.date}*\n\n`;
      for (const block of payload.subjects) {
        const fileCount = block.attachments.length;
        const hasComment = block.message.includes("*Comment*");
        const hasPost = block.message.includes("*Post*");

        preview += `📚 *${block.subject}*\n`;
        preview += `📎 Files: ${fileCount}\n`;
        if (hasComment) preview += `🗒️ Comment: ✅\n`;
        if (hasPost) preview += `📢 Post: ✅\n\n`;
      }
      await sendText(sock, sender, preview.trim());
    }

    else if (text.startsWith("!preview ")) {
      const subjectQuery = text.split(" ")[1].trim().toLowerCase();
      const payload = require("./whatsapp_payload.json");
      const block = payload.subjects.find(s => s.subject.toLowerCase() === subjectQuery);

      if (!block) {
        await sendText(sock, sender, `❌ Subject '${subjectQuery}' not found.`);
        return;
      }

      const fileCount = block.attachments.length;
      const hasComment = block.message.includes("*Comment*");
      const hasPost = block.message.includes("*Post*");

      let preview = `📚 *${block.subject}*\n`;
      preview += `📎 Files: ${fileCount}\n`;
      if (hasComment) preview += `🗒️ Comment: ✅\n`;
      if (hasPost) preview += `📢 Post: ✅\n`;

      await sendText(sock, sender, preview.trim());
    }

    else if (text.startsWith("!log")) {
      const dateArg = text.split(" ")[1];
      const date = dateArg === "today" ? new Date().toISOString().slice(0, 10) : dateArg;
      const path = `./logs/lms_log_${date}.txt`;

      if (!fs.existsSync(path)) {
        await sendText(sock, sender, `⚠️ Log for ${date} not found.`);
        return;
      }

      const buffer = fs.readFileSync(path);
      await sendDocument(sock, sender, path);
    }

    else if (text === "!help") {
      const helpText = `
🆘 *Available Commands:*
- !send secret123 → Trigger LMS agent
- !status → Show current status
- !retry → Retry last send
- !cancel → Cancel operation
- !preview → Show summary of today's payload
- !preview subject_name → Show details for one subject
- !log today → Send today's log file
- !log YYYY-MM-DD → Send log for specific date
- !help → Show this help menu
      `;
      await sendText(sock, sender, helpText.trim());
    }

    else {
      await sendText(sock, sender, "🤖 Unknown command. Type !help for options.");
    }
  });
})();

