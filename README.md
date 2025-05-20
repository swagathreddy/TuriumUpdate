# 🔍 Chatwoot + Outline Integration with Backup Bot Solution

## 🔐 Authentication

This project uses **Keycloak** as the identity provider for securing access to the Outline knowledge base. The Outline instance is protected using OIDC via Keycloak, and documents are accessed via **authenticated API calls** using a personal API token (`OUTLINE_TOKEN`).

---

## 🧪 Attempt 1: Chatwoot + Outline Integration (Webhook-based)

### 🎯 Goal

To integrate [Chatwoot](https://www.chatwoot.com) with [Outline](https://www.getoutline.com/) such that:

- When a user asks a question in the Chatwoot widget (e.g., `/ask what is docker`),
- A webhook is triggered,
- The bot fetches the answer from Outline using the related document `shareId`,
- The answer is displayed **as a bot reply in Chatwoot**.

---

### 🧩 What Was Tried

1. **Webhook Bot Configuration**

   - Created an Agent Bot named `Outline Bot`
   - Linked it with `Bot Chat` inbox
   - Set correct `webhook` endpoint (via local server and ngrok)

2. **Automations**

   - Added automation rules to assign the bot upon message or conversation creation
   - Enabled auto-assignment in inbox settings

3. **Agent Bot Assignment**

   - Verified assignment via API:
     ```bash
     curl -X GET "http://localhost:4000/api/v1/accounts/1/inboxes/1/agent_bot" \
       -H "api_access_token: <YOUR_TOKEN>"
     ```

4. **Verified Webhook Manually**
   - Triggered webhook manually via curl:
     ```bash
     curl -X POST "http://localhost:7000/webhook" ^
       -H "Content-Type: application/json" ^
       -d "{\"event\":\"message_created\",\"message\":{\"content\":\"/ask what is docker\"},\"conversation\":{\"id\":1}}"
     ```
   - ✅ Bot receives and processes the message
   - ✅ Bot fetches document from Outline
   - ✅ Bot sends reply via Chatwoot API
   - ✅ Message **appears in widget only after manual reload**

---

### ❌ Problem Faced

Despite all configuration:

- The **webhook does not trigger automatically** when messages are sent via Chatwoot widget
- No signs of webhook events in terminal unless triggered manually
- Possibly due to **limitations in the free Chatwoot tier**, which doesn’t allow real-time automation via webhook with custom agent bots

➡️ Due to these issues, we opted for a **custom bot frontend solution** instead.

---

## ✅ Attempt 2: Custom Express-based Bot (No Chatwoot)

### 👨‍💻 Overview

To avoid Chatwoot limitations, we created a **simple web interface using Node.js + Express**, where:

- User types a question (`what is docker`)
- Backend fetches corresponding document from Outline via shareId
- ✅ Response is shown instantly on the same page

### 📁 Files

- `bot.js`: Express + Axios server that fetches Outline content
- `public/index.html`: Minimal HTML UI
- `.env`: API tokens and base URLs

### 🚀 Run This Bot

```bash
cd bot
node bot.js

Despite trying to fully integrate Chatwoot and Outline via the native bot webhook, the integration didn’t fully succeed due to webhook triggers not firing automatically. However, the workaround using a custom Node.js bot provides a fully functional alternative — with Outline-authenticated document fetch and fast response times.
```
