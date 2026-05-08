# Rules.One — Padrões do Projeto

## 1. Container Pattern (Componentes V2)

Todos os containers visuais usam `createContainer` do `@magicyan/discord`.

```ts
import { ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";
import { createContainer } from "@magicyan/discord";

const container = createContainer(
  "#2b2d31",
  "Texto do container aqui",
  new ButtonBuilder()
    .setCustomId("custom-id")
    .setLabel("Botão")
    .setStyle(ButtonStyle.Primary)
);

await interaction.reply({
  components: [container as any],
  flags: MessageFlags.IsComponentsV2,
});
```

**Regras:**
- Componentes (ButtonBuilder, etc.) vão **diretamente** no `createContainer`, sem `ActionRowBuilder`.
- O container é enviado no array `components` com `MessageFlags.IsComponentsV2`.
- Sempre usar `try/catch` com guard `if (!interaction.replied)` no catch.

## 2. Estrutura de Comandos

Arquivos em `src/discord/commands/public/`.

```ts
import { Command } from "#base";
import { ApplicationCommandType } from "discord.js";

export default new Command({
  name: "nome-do-comando",
  description: "Descrição do comando",
  type: ApplicationCommandType.ChatInput,
  async run(interaction: any) {
    try {
      // lógica
    } catch (err) {
      console.error(`[Nome] erro:`, err);
      if (!interaction.replied) {
        await interaction.reply({ content: "Erro.", ephemeral: true });
      }
    }
  }
});
```

**Regras:**
- `Command` importado de `#base`.
- `run(interaction: any)` com try/catch.
- Erro responde com `if (!interaction.replied)`.

## 3. Interaction Handler (Bootstrap)

O bootstrap em `src/discord/base/index.ts` gerencia o `interactionCreate`.

- Constrói um `Map<string, Command>` a partir do array `slashCommands`.
- Roteia interações para o comando correto pelo `commandName`.
- Comandos não encontrados recebem resposta de fallback.

## 4. Responders (Botões/Modais)

Arquivos em `src/discord/responders/`.

```ts
function localCreateResponder(cfg: any) { return cfg; }

export default localCreateResponder({
  customId: "meu-custom-id",
  types: ["Button" as any],
  cache: "cached",
  async run(interaction: any) {
    // lógica
  }
});
```

**Regras:**
- Usar `localCreateResponder` como wrapper (evita dependência de exportação não existente).
- O `customId` deve corresponder ao definido no botão/modal.

## 5. ConfigCentral

Configurações centralizadas em `ConfigCentral.json` na raiz.

```json
{
  "canalRegistro": "ID_DO_CANAL",
  "canalFarm": "ID_DA_CATEGORIA",
  "cargos": {
    "aprovado": "ID_CARGO",
    "membroFarm": "ID_CARGO",
    "temporario": "ID_CARGO"
  }
}
```

Acesso via `#functions`:
```ts
import { configCentral } from "#functions";
// configCentral.canalRegistro, configCentral.cargos.aprovado, etc.
```

## 6. Import Aliases

Resolvidos em `tsconfig.json` (compilação) e `package.json` (runtime Node).

| Alias | Path |
|-------|------|
| `#base` | `./src/discord/base/index.ts` → `./build/discord/base/index.js` |
| `#functions` | `./src/functions/index.ts` → `./build/functions/index.js` |

## 7. Discloud Deploy

- **`discloud.config`** — `MAIN=build/index.js`, `RAM=100`, `TYPE=bot`
- **`.discloudignore`** — Exclui `node_modules/`, `.env`, `.git/`, `.vscode/`
- **Build**: `npm run build` (tsc)
- **Start**: `npm run start` (node build/index.js)
- Dependências instaladas automaticamente pela Discloud.

## 8. Variáveis de Ambiente

- `DISCORD_TOKEN` no arquivo `.env` (local) ou variável de ambiente (Discloud).
- Carregado via `import 'dotenv/config'` em `src/index.ts`.
- `.env` ignorado pelo `.discloudignore` — não enviado para produção.

## 9. Registro de Slash Commands

Feito automaticamente pelo bootstrap após o login:
- Lê os comandos do array `slashCommands`.
- Registra via REST API no servidor definido em `commands.guilds`.
- Substituir `"ID_DO_TEU_SERVIDOR"` pelo ID real do servidor em `src/index.ts`.

## 10. Fluxo de Farm

```
/farm (ou /setup-farm)
  → Container com texto + botão "🚜 Farm"
  → Clique no botão → Modal de registro (nome + quantidade)
  → Envio do modal → Container no canal de registro com botões Aprovar/Negar
```
