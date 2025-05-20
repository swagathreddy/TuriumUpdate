const express = require("express");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.static("public"));
app.use(express.json());

const SHARE_ID_MAP = {
  docker: "35d87f70-c455-45db-8f90-d45ac1414523",
  kubernetes: "b0914304-54a9-4e6c-a680-b192e82e1078",
  microservices: "d18dca3e-022a-4688-ba8d-fd3766766549"
};

app.post("/ask", async (req, res) => {
  const query = req.body.query.toLowerCase();

  const match = Object.keys(SHARE_ID_MAP).find((key) => query.includes(key));
  if (!match) {
    return res.json({ answer: "❗ Sorry, I couldn't find a matching topic." });
  }

  try {
    const response = await axios.post(
      `${process.env.OUTLINE_API}/documents.info`,
      { shareId: SHARE_ID_MAP[match] },
      {
        headers: {
          Authorization: `Bearer ${process.env.OUTLINE_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    const doc = response.data.data;
    const answer = `📘 *${doc.title}*

${doc.text.slice(0, 300)}...`;
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ answer: "❌ Error fetching document from Outline." });
  }
});

app.listen(process.env.PORT || 7000, () =>
  console.log(`✅ Bot running at http://localhost:${process.env.PORT || 7000}`)
);