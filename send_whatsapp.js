const venom = require('venom-bot');
const fs = require('fs');
const path = require('path');
const chromiumPath = require('puppeteer').executablePath();

// Load config
const configPath = path.join(__dirname, 'config.json');
const payloadPath = path.join(__dirname, 'whatsapp_payload.json');

if (!fs.existsSync(configPath)) {
  console.error("❌ config.json not found.");
  process.exit(1);
}

if (!fs.existsSync(payloadPath)) {
  console.error("❌ whatsapp_payload.json not found. Run the Python script first.");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));

const groupId = config.group_id;

venom
  .create({
    session: 'lms-agent-session',
    multidevice: true,
    puppeteerOptions: {
      headless: 'new', // ✅ Use new headless mode
      executablePath: chromiumPath, // ✅ WSL path to Chrome
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  })
  .then(async (client) => {
    try {
      await client.sendText(groupId, payload.message);
      console.log("✅ Message sent to group.");

      for (const filePath of payload.attachments) {
        const fileName = path.basename(filePath);
        await client.sendFile(groupId, filePath, fileName, `File: ${fileName}`);
        console.log(`📎 Sent file: ${fileName}`);
      }

      console.log("🎉 All files sent successfully.");
    } catch (error) {
      console.error("❌ Error sending WhatsApp message:", error);
    }
  });

