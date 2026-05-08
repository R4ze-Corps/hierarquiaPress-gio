require("dotenv").config();
const { REST, Routes } = require("discord.js");
const command = require("./command");

const commands = [
  {
    name: command.name,
    description: command.data.description,
  },
];

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const TOKEN = process.env.DISCORD_TOKEN;

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log(`Registrando comando /${command.name}...`);
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    console.log(`Comando /${command.name} registrado com sucesso!`);
  } catch (error) {
    console.error("Erro ao registrar comando:", error);
  }
})();
