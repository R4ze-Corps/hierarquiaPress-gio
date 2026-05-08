const { ButtonBuilder, ButtonStyle } = require("discord.js");
const { createContainer, createSection } = require("@magicyan/discord");
const { COR_PADRAO } = require("./config");
const cargosTurquia = require("./cargosHierarquia");

async function fetchMembersComRetry(guild, tentativas = 3) {
  for (let i = 0; i < tentativas; i++) {
    try {
      await guild.members.fetch();
      return;
    } catch (err) {
      if (err?.data?.retry_after && i < tentativas - 1) {
        const ms = Math.ceil(err.data.retry_after * 1000) + 500;
        console.log(`Rate limit. Retry em ${ms}ms (tentativa ${i + 1}/${tentativas})`);
        await new Promise((r) => setTimeout(r, ms));
      } else {
        console.error("Erro ao buscar membros:", err.message);
        return;
      }
    }
  }
}

function montarTextoHierarquia(guild) {
  const cargosSuperiores = [];
  let texto = "";

  for (const dadoCargo of cargosTurquia) {
    const cargo = guild.roles.cache.get(dadoCargo.id);

    if (cargo && cargo.members.size > 0) {
      const membros = cargo.members
        .filter((m) => !cargosSuperiores.some((id) => m.roles.cache.has(id)))
        .map((m) => `<@${m.user.id}>`);

      texto += `\n**${dadoCargo.nome}**\n`;
      texto += membros.length > 0 ? membros.join("\n") : "(*Vago*)";
      texto += "\n";
    } else {
      texto += `\n**${dadoCargo.nome}**\n(*Vago*)\n`;
    }

    if (cargo) cargosSuperiores.push(dadoCargo.id);
  }

  return texto;
}

async function montarContainerHierarquia(guild) {
  await fetchMembersComRetry(guild);

  const texto = montarTextoHierarquia(guild);

  const botao = new ButtonBuilder()
    .setCustomId("atualizar_hierarquia")
    .setLabel("Atualizar Hierarquia")
    .setEmoji("🔄")
    .setStyle(ButtonStyle.Secondary);

  const conteudo = `**🏆 Hierarquia Presságio**\n${texto}`;
  const container = guild.iconURL()
    ? createContainer(COR_PADRAO, createSection(conteudo, guild.iconURL()), botao)
    : createContainer(COR_PADRAO, conteudo, botao);

  return { components: [container] };
}

module.exports = { montarContainerHierarquia };
