module.exports = async function sendText(sock, groupId, message) {
  try {
    await sock.sendMessage(groupId, { text: message });
    console.log("📤 Text message sent.");
  } catch (err) {
    console.error("❌ Failed to send text:", err);
  }
};

