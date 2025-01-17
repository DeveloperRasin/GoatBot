const axios = require('axios');

module.exports = {
  config: {
    name: "tempmailv2",
    version: "1.0.0",
    hasPermission: 2,
    author: "shiki",
    description: "Get temp mail v2",
    category: "Utility",
    guide: {
      en: "   {p}{n} new: Create a new mail\n   {p}{n} check: Check the inbox\n   {p}{n} get: Get the current mail\n   {p}{n} list: View mail list\n   {p}{n} more: Add a new mail",
    },
    countDown: 2,
    dependencies: { axios: "" },
  },

  onStart: async function ({ api, event, args, message }) {
    if (args[0] === "new") {
      await createNewMail(api, event);
    } else if (args[0] === "list") {
      await getMailDomainList(api, event);
    } else if (args[0] === "more") {
      await addNewMail(api, event);
    } else if (args[0] === "get") {
      await getCurrentMail(api, event);
    } else if (args[0] === "check") {
      await checkInbox(api, event);
    } else {
      await displayHelp(api, event);
    }
  },
};

async function createNewMail(api, event) {
  const res = await axios.get("https://10minutemail.net/address.api.php?new=1");
  const { mail_get_user: user, mail_get_host: host, mail_get_time: time, mail_server_time: serverTime, mail_get_key: keyMail, mail_left_time: leftTime, mail_list } = res.data;

  const mailInfo = mail_list?.[0] || {};
  const { mail_id: mailId, subject = "(No Subject)", datetime2: date = "(No Date)" } = mailInfo;

  const message = `» Mail Name: ${user}\n» Host: ${host}\n» Mail: ${user}@${host}.com\n» Time: ${time}\n» Server Time: ${serverTime}\n» Key: ${keyMail}\n» Remaining Time: ${leftTime}s\n» Mail ID: ${mailId}\n» Content: ${subject}\n» Date: ${date}`;
  api.sendMessage(message, event.threadID, event.messageID);
}

async function getMailDomainList(api, event) {
  const res = await axios.get("https://www.phamvandienofficial.xyz/mail10p/domain");
  const domainList = res.data.domain.join("\n");
  const message = `List of Domains:\n${domainList}`;
  api.sendMessage(message, event.threadID, event.messageID);
}

async function addNewMail(api, event) {
  const res = await axios.get("https://10minutemail.net/address.api.php?more=1");
  const { mail_get_user: user, mail_get_host: host, mail_get_time: time, mail_server_time: serverTime, mail_get_key: keyMail, mail_left_time: leftTime, mail_list } = res.data;

  const mailInfo = mail_list?.[0] || {};
  const { mail_id: mailId, subject = "(No Subject)", datetime2: date = "(No Date)" } = mailInfo;

  const message = `» Mail Name: ${user}\n» Host: ${host}\n» Mail: ${user}@${host}.com\n» Time: ${time}\n» Server Time: ${serverTime}\n» Key: ${keyMail}\n» Remaining Time: ${leftTime}s\n» Mail ID: ${mailId}\n» Content: ${subject}\n» Date: ${date}`;
  api.sendMessage(message, event.threadID, event.messageID);
}

async function getCurrentMail(api, event) {
  const res = await axios.get("https://10minutemail.net/address.api.php");
  const { mail_get_mail: email, session_id: id, permalink } = res.data;
  const { url, key } = permalink;
  const formattedUrl = url.replace(/\./g, " . ");
  const formattedEmail = email.replace(/\./g, " . ");

  const message = `» Email: ${formattedEmail}\n» Mail ID: ${id}\n» Mail URL: ${formattedUrl}\n» Key Mail: ${key}`;
  api.sendMessage(message, event.threadID, event.messageID);
}

async function checkInbox(api, event) {
  const res = await axios.get("https://10minutemail.net/address.api.php");
  const mailInfo = res.data.mail_list?.[0] || {};
  const { mail_get_mail: email } = res.data;
  const { mail_id: id, from = "(Unknown Sender)", subject = "(No Subject)", datetime2: time = "(No Date)" } = mailInfo;

  const formattedFrom = from.replace(/\./g, " . ");
  const formattedEmail = email.replace(/\./g, " . ");

  const message = `» Email: ${formattedEmail}\n» Mail ID: ${id}\n» From: ${formattedFrom}\n» Subject: ${subject}\n» Time: ${time}`;
  api.sendMessage(message, event.threadID, event.messageID);
}

async function displayHelp(api, event) {
  const message = `NEW - Create a new mail\nCHECK - Check the inbox\nGET - Get the current mail\nLIST - View mail list\nMORE - Add a new mail\n-------------------------\nYou can click on the mail URL and enter the Key Mail to view the content of the mail.`;
  api.sendMessage(message, event.threadID, event.messageID);
}