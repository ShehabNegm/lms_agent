const qrcode = require("qrcode-terminal");
const createSocket = require("./messaging/whatsapp");
const sendText = require("./messaging/sendText");
const sendDocument = require("./messaging/sendDocument");
const log = require("./utils/logger");
const { exec } = require("child_process");
const fs = require("fs");

const allowedSenders = [
  "201001573240@s.whatsapp.net", // your number
  "201124585522@s.whatsapp.net"  // second allowed number
];

let lastStatus = "Idle";

const getText = (msg) => {
  const m = msg.message;
  if (!m) return "";
  if (m.conversation) return m.conversation;
  if (m.extendedTextMessage?.text) return m.extendedTextMessage.text;
  if (m.imageMessage?.caption) return m.imageMessage.caption;
  if (m.videoMessage?.caption) return m.videoMessage.caption;
  return "";
};

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
    const rawText = getText(msg);
    const cleanText = rawText.replace(/\s+/g, " ").trim();

    console.log("🔍 Sender JID:", sender);
    console.log("🔍 Raw text:", JSON.stringify(rawText));
    log(`📩 Command received: ${cleanText}`);

    if (!allowedSenders.includes(sender)) {
      console.log(`❌ Unauthorized sender: ${sender}`);
      return;
    }

    if (!cleanText) {
      log("⚠️ Empty message received. Ignoring.");
      return;
    }

    const parts = cleanText.split(" ");
    const command = parts[0];
    const arg = parts[1];

    if (command === "!send") {
      if (arg !== "magic69") {
        await sendText(sock, sender, "❌ Invalid passphrase.");
        return;
      }

      lastStatus = "Sending LMS content…";
      await sendText(sock, sender, "📤 Starting LMS agent…");
      log("🚀 Triggering LMS agent…");

      exec("python3 whatsapp_payload.py && node send_whatsapp.js", async (err, stdout, stderr) => {
        log("📟 Exec started");
        if (err) {
          lastStatus = "❌ Failed to send.";
          log(`❌ Exec error: ${err.message}`);
          log(`stderr: ${stderr}`);
          await sendText(sock, sender, "❌ Error during send.");
        } else {
          lastStatus = "✅ Content sent.";
          log(`✅ Exec success: ${stdout}`);
          await sendText(sock, sender, "✅ LMS content sent.");
        }
      });
    }

    else if (command === "!status") {
      await sendText(sock, sender, `📊 Status: ${lastStatus}`);
    }

    else if (command === "!retry") {
      lastStatus = "Retrying LMS send…";
      await sendText(sock, sender, "🔁 Retrying…");
      log("🔁 Retrying send_whatsapp.js");

      exec("node send_whatsapp.js", async (err, stdout, stderr) => {
        if (err) {
          lastStatus = "❌ Retry failed.";
          log(`❌ Retry error: ${err.message}`);
          await sendText(sock, sender, "❌ Retry failed.");
        } else {
          lastStatus = "✅ Retry successful.";
          log(`✅ Retry success: ${stdout}`);
          await sendText(sock, sender, "✅ Retry successful.");
        }
      });
    }

    else if (command === "!cancel") {
      lastStatus = "Cancelled.";
      await sendText(sock, sender, "🛑 Operation cancelled.");
    }

    else if (command === "!preview") {
      const payload = require("./whatsapp_payload.json");
      if (!arg) {
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
      } else {
        const subjectQuery = arg.toLowerCase();
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
    }

    else if (command === "!log") {
      const date = arg === "today" ? new Date().toISOString().slice(0, 10) : arg;
      const path = `./logs/lms_log_${date}.txt`;

      if (!fs.existsSync(path)) {
        await sendText(sock, sender, `⚠️ Log for ${date} not found.`);
        return;
      }

      await sendDocument(sock, sender, path);
    }

    else if (command === "!help") {
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

    else if (command.startsWith("!")) {
      await sendText(sock, sender, "🤖 Unknown command. Type !help for options.");
    }
  });
})();

