const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { montarContainerHierarquia } = require("./hierarquiaUtils");

module.exports = {
  name: "hierarquia",
  data: new SlashCommandBuilder()
    .setName("hierarquia")
    .setDescription("Gera o container da hierarquia atualizada."),
  async execute(interaction) {
    try {
      const payload = await montarContainerHierarquia(interaction.guild);
      await interaction.reply({
        ...payload,
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (err) {
      console.error("[Hierarquia] erro:", err);
      if (!interaction.replied) {
        await interaction.reply({ content: "Erro ao gerar hierarquia.", flags: MessageFlags.Ephemeral });
      }
    }
  },
};
