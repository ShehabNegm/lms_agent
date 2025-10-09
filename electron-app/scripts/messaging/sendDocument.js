const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

module.exports = async function sendDocument(sock, groupId, filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ File not found: ${filePath}`);
    return;
  }

  const buffer = fs.readFileSync(filePath);
  const mimeType = mime.lookup(filePath) || "application/octet-stream";
  const fileName = path.basename(filePath);

  try {
    await sock.sendMessage(groupId, {
      document: buffer,
      mimetype: mimeType,
      fileName: fileName,
    });
    console.log(`📎 Sent file: ${fileName}`);
  } catch (err) {
    console.error(`❌ Failed to send ${fileName}:`, err);
  }
};

