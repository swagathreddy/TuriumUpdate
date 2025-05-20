const express = require("express");
const axios = require("axios");
require("dotenv").config({ path: __dirname + "/.env" });

const app = express();
app.use(express.json());

const SHARE_ID_MAP = {
  docker: "35d87f70-c455-45db-8f90-d45ac1414523",
  kubernetes: "b0914304-54a9-4e6c-a680-b192e82e1078",
  microservices: "d18dca3e-022a-4688-ba8d-fd3766766549"
};

app.post("/webhook", async (req, res) => {
  console.log("✅ Webhook received:\n", JSON.stringify(req.body, null, 2));

  const { event, message, conversation } = req.body;

  if (event !== "message_created" || !message || !conversation?.id) {
    console.log("⚠️ Invalid webhook payload");
    return res.sendStatus(200);
  }

  const conversationId = conversation.id;
  console.log("📌 Conversation ID:", conversationId);

  const query = message.content.replace("/ask", "").trim().toLowerCase();
  console.log("🔍 Extracted query:", query);

  const match = Object.keys(SHARE_ID_MAP).find((key) => query.includes(key));
  console.log("🔗 Matched topic:", match || "No match found");

  if (!match) {
    console.log("⚠️ No matching topic found. Sending fallback response...");
    try {
      await axios.post(
        `${process.env.CHATWOOT_API}/accounts/1/conversations/${conversationId}/messages`,
        {
          content: "❗ Sorry, I couldn't find a matching topic in the KB.",
          message_type: "outgoing",
        },
        {
          headers: {
            "Content-Type": "application/json",
            api_access_token: process.env.CHATWOOT_TOKEN,
          },
        }
      );
      console.log("✅ Fallback response sent.");
    } catch (error) {
      console.error("❌ Failed to send fallback response:", error.message);
    }
    return res.sendStatus(200);
  }

  try {
    console.log("📡 Fetching document from Outline API for:", match);
    const response = await axios.post(
      `${process.env.OUTLINE_API}/documents.info`,
      { shareId: SHARE_ID_MAP[match] },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OUTLINE_TOKEN}`,
        },
      }
    );

    const doc = response.data.data;
    console.log("📘 Document fetched:", doc.title);

    console.log("✉️ Sending reply back to Chatwoot...");
    await axios.post(
      `${process.env.CHATWOOT_API}/accounts/1/conversations/${conversationId}/messages`,
      {
        content: `📘 *${doc.title}*\n\n${doc.text.slice(0, 300)}...`,
        message_type: "outgoing",
      },
      {
        headers: {
          "Content-Type": "application/json",
          api_access_token: process.env.CHATWOOT_TOKEN,
        },
      }
    );

    console.log("✅ Reply sent to Chatwoot.");
    return res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error fetching from Outline or posting to Chatwoot:", error.message);
    return res.sendStatus(500);
  }
});

app.listen(process.env.PORT || 7000, () =>
  console.log(`✅ Bot is running on port ${process.env.PORT || 7000}`)
);
