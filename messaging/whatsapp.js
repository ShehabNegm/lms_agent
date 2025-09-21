const { default: makeWASocket, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const initSession = require("./session");

module.exports = async function createSocket() {
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await initSession();

  const sock = makeWASocket({
    version,
    auth: state,
    browser: ["LMS Agent", "Chrome", "20.0"],
  });

  sock.ev.on("creds.update", saveCreds);
  return sock;
};

