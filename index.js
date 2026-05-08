require("dotenv").config();
const { Client, GatewayIntentBits, MessageFlags } = require("discord.js");
const command = require("./command");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Map();
client.commands.set(command.name, command);

client.once("clientReady", () => {
  console.log(`Bot conectado como ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) return;
      await cmd.execute(interaction, client);
      return;
    }

    if (interaction.isButton()) {
      if (interaction.customId === "atualizar_hierarquia") {
        const { montarContainerHierarquia } = require("./hierarquiaUtils");
        const payload = await montarContainerHierarquia(interaction.guild);
        await interaction.update(payload);
      }
    }
  } catch (error) {
    console.error("Erro na interação:", error);
    const reply = interaction.replied || interaction.deferred ? "followUp" : "reply";
    await interaction[reply]({
      content: "Ocorreu um erro ao processar.",
      flags: MessageFlags.Ephemeral,
    }).catch(() => {});
  }
});

client.login(process.env.DISCORD_TOKEN);
