# Cyber Dog

Um bot para Discord construído com Discord.js para gerenciar um servidor Minecraft hospedado no Azure.

## Funcionalidades

- Iniciar e parar o servidor Minecraft com comandos simples do Discord
- Verificar o status do servidor (VM e serviço Minecraft)
- Desligamento automático após um período especificado
- Tratamento de erros com respostas amigáveis ao usuário

## Stack Técnica

- **Runtime**: Node.js
- **Framework**: Discord.js v14
- **Provedor de Nuvem**: Microsoft Azure
- **Dependências**:
  - `@azure/arm-compute`: Gerenciamento de VM do Azure
  - `@azure/arm-network`: Gerenciamento de rede do Azure
  - `@azure/identity`: Autenticação do Azure
  - `discord.js`: Framework para bots do Discord
  - `dotenv`: Gerenciamento de variáveis de ambiente

## Estrutura do Projeto

```
.
├── docs
├── logs
├── package.json
├── package-lock.json
├── README.md
└── src
    ├── commands
    │   ├── minecraft
    │   │   ├── start.js
    │   │   ├── status.js
    │   │   └── stop.js
    │   └── utility
    │       └── ping.js
    ├── config
    │   ├── azure.js
    │   ├── constants.js
    │   └── minecraft.js
    ├── deploy-commands.js
    ├── events
    │   ├── interactionCreate.js
    │   └── ready.js
    ├── handlers
    │   ├── commandHandler.js
    │   └── eventHandler.js
    ├── index.js
    └── utils
        └── azureManager.js
```

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/mancpy/cyber-dog.git
   cd cyber-dog
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie um arquivo `.env` no diretório raiz com as seguintes variáveis:
   ```
   DISCORD_TOKEN=seu_token_do_bot_discord
   CLIENT_ID=id_da_sua_aplicacao_discord
   AZURE_SUBSCRIPTION_ID=id_da_sua_subscricao_azure
   ```
   
   Nota: As outras configurações como grupo de recursos, nome da VM, IP público e configurações do Minecraft agora estão em arquivos separados na pasta `src/config/`.

## Uso

1. Implante os comandos slash:
   ```bash
   npm run deploy
   ```

2. Inicie o bot:
   ```bash
   npm start
   ```

### Comandos Disponíveis

- `/start [duração]` - Inicia o servidor Minecraft com desligamento automático após o número de horas especificado
- `/stop` - Para o servidor Minecraft
- `/status` - Verifica o status da VM e do servidor Minecraft
- `/ping` - Verifica a latência do bot

> **Nota:** Este é um projeto pessoal ainda em desenvolvimento. Em breve serão adicionadas mais funcionalidades.

[English version](docs/README-en.md)
