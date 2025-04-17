# Cyber Dog

A Discord bot built with Discord.js to manage an Azure-hosted Minecraft server.

## Features

- Start and stop the Minecraft server with simple Discord commands
- Check server status (VM and Minecraft service)
- Automatic shutdown after a specified duration
- Error handling with user-friendly responses

## Technical Stack

- **Runtime**: Node.js
- **Framework**: Discord.js v14
- **Cloud Provider**: Microsoft Azure
- **Dependencies**:
  - `@azure/arm-compute`: Azure VM management
  - `@azure/arm-network`: Azure network management
  - `@azure/identity`: Azure authentication
  - `discord.js`: Discord bot framework
  - `dotenv`: Environment variable management

## Project Structure

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

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mancpy/cyber-dog.git
   cd cyber-dog
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   DISCORD_TOKEN=your_discord_bot_token
   CLIENT_ID=your_discord_application_id
   AZURE_SUBSCRIPTION_ID=your_azure_subscription_id
   ```
   
   Note: Other settings like resource group, VM name, public IP, and Minecraft configurations are now in separate files in the `src/config/` folder.

## Usage

1. Deploy slash commands:
   ```bash
   npm run deploy
   ```

2. Start the bot:
   ```bash
   npm start
   ```

### Available Commands

- `/start [duration]` - Start the Minecraft server with automatic shutdown after specified hours
- `/stop` - Stop the Minecraft server
- `/status` - Check the status of the VM and Minecraft server
- `/ping` - Check bot latency

> **Note:** This is a personal project still under development. More features will be added soon.
