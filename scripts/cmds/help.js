const { GoatWrapper } = require("fca-liane-utils");

module.exports = {
  config: {
    name: "help",
    aliases: ["h"],
    version: "1.0",
    author: "Custom Bot",
    usePrefix: false, // Command works without a prefix
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Displays a list of commands or details for a specific command"
    },
    longDescription: {
      en: "Provides a list of all available commands or detailed information about a specific command"
    },
    category: "info",
    guide: {
      en: "help [command_name]"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID } = event;
    const { commands, aliases } = global.GoatBot;

    // Display all commands if no argument is passed
    if (args.length === 0) {
      const categories = {};
      let responseMessage = "🌟 **Command List** 🌟\n";

      for (const [name, cmd] of commands) {
        if (!categories[cmd.config.category]) {
          categories[cmd.config.category] = [];
        }
        categories[cmd.config.category].push(name);
      }

      for (const [category, cmds] of Object.entries(categories)) {
        responseMessage += `\n📂 **${category.toUpperCase()}**\n`;
        responseMessage += cmds.map((cmd) => `⭓ ${cmd}`).join("\n") + "\n";
      }

      responseMessage += `\nUse **help [command_name]** for more details on a specific command.`;

      return api.sendMessage(responseMessage, threadID, messageID);
    }

    // Show details for a specific command
    const commandName = args[0].toLowerCase();
    const command = commands.get(commandName) || commands.get(aliases.get(commandName));

    if (!command) {
      return api.sendMessage(`❌ Command "${commandName}" not found.`, threadID, messageID);
    }

    const config = command.config;
    const guide = config.guide?.en || "No usage guide available.";
    const description = config.longDescription?.en || "No description available.";
    const response = `📖 **Command Details** 📖\n\n` +
      `🔹 **Name**: ${config.name}\n` +
      `🔹 **Aliases**: ${config.aliases ? config.aliases.join(", ") : "None"}\n` +
      `🔹 **Description**: ${description}\n` +
      `🔹 **Usage**: ${guide}\n` +
      `🔹 **Version**: ${config.version || "1.0"}\n` +
      `🔹 **Author**: ${config.author || "Unknown"}\n` +
      `🔹 **Cooldown**: ${config.countDown || 0}s\n` +
      `🔹 **Required Role**: ${config.role || 0}\n`;

    return api.sendMessage(response, threadID, messageID);
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });