const { useMultiFileAuthState } = require("@whiskeysockets/baileys");

module.exports = async function initSession() {
  return await useMultiFileAuthState("baileys_auth");
};

