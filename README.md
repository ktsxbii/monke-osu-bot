# 🐒 Monke osu! Bot

A clean, high-performance Discord bot for osu! statistics using **osu! API v2** and **discord.js v14**.

## 🍌 Features

- **`/profile`** - View detailed Bancho statistics with peak rank, country flags, and grade counts.
- **`/rs`** - Show your most recent play including hit counts, accuracy, and map info.
- **`/top`** - Interactive list of your top 100 plays with ⬅️/➡️ pagination buttons.
- **`/profileset`** - Link your Discord account to your osu! username for faster lookups.
- **Interactive Timestamps** - Hover over relative times (e.g., "2 days ago") to see the exact date and time.
- **Monke Branding** - Custom emojis for all ranks (SS down to F).

---

## 🚀 Setup Instructions

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- A Discord Bot Token ([Discord Developer Portal](https://discord.com/developers/applications))
- osu! API v2 Credentials ([osu! settings](https://osu.ppy.sh/home/account/edit#new-oauth-application))

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Configuration
Copy the `.env.template` to a new file named `.env` and fill in your credentials:
```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_application_id
OSU_CLIENT_ID=your_osu_client_id
OSU_CLIENT_SECRET=your_osu_client_secret
```

### 4. Deploy Commands
Register the slash commands with Discord:
```bash
node deploy-commands.js
```

### 5. Start the Bot
```bash
npm start
```

---

## 🐒 Commands

| Command | Description |
|---------|-------------|
| `/profileset <username>` | Link your Discord ID to your osu! account. |
| `/profile [user]` | View your (or another user's) osu! profile. |
| `/rs [user]` | View the most recent play. |
| `/top [user]` | View top plays with pagination. |

---

*Made with 🍌 for the osu! community.*
