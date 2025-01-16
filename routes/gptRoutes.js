import dotenv from 'dotenv';
import { Router } from 'express';
import OpenAI from 'openai';
import { loadData } from '../loadData.js'; 
dotenv.config();

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let userSessions = {};

let data = loadData();

const getBalanceSheet = () => {
  return data.balanceSheet;
};

const functions = [
  {
    name: "getBalanceSheet",
    description: "Fetches the balance sheet data.",
    parameters: {},
  },
];

router.post('/chat', async (req, res) => {
  const { prompt, userId } = req.body;

  if (!data) {
    return res.status(500).send({ error: 'Failed to load data.' });
  }

  try {
    if (userSessions[userId] && userSessions[userId].isCanceled) {
      userSessions[userId].isCanceled = false;
      return res.send({ response: "You have canceled the request." });
    }

    let userSession = userSessions[userId] || { messages: [] };

    const userMessage = { role: "user", content: prompt };
    userSession.messages.push(userMessage);

    const systemMessage = {
      role: "system",
      content: "You are a financial assistant. Answer questions specifically about the provided financial data for the year 2024, including the Balance Sheet, Executive Summary, and Profit/Loss statements.",
    };

    const contextMessage = {
      role: "assistant",
      content: `Here is the financial data for the year 2024 that you can use:\n\nBalance Sheet: ${JSON.stringify(data.balanceSheet)}\n\nExecutive Summary: ${JSON.stringify(data.executiveSummary)}\n\nProfit/Loss: ${JSON.stringify(data.profitLoss)}.`,
    };

    const conversationHistory = [systemMessage, contextMessage, ...userSession.messages.slice(-25)];

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: conversationHistory,
      functions: functions,
      temperature: 0.7,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const chatResponse = response.choices[0].message.content;

    userSession.messages.push({ role: "assistant", content: chatResponse });

    userSessions[userId] = userSession;

    res.send({ response: chatResponse });
  } catch (err) {
    console.error("Error generating response:", err.message || err);
    res.status(500).send({ error: "Something went wrong!" });
  }
});


router.post('/cancel', async (req, res) => {
  const { userId } = req.body;

  try {
    let userSession = userSessions[userId];
    if (!userSession) {
      return res.status(400).send({ error: "No active session found." });
    }

    userSession.isCanceled = true;

    userSessions[userId] = userSession;

    res.send({ response: "You have canceled the request." });
  
    setTimeout(() => {
      userSession.isCanceled = false;
      userSessions[userId] = userSession;
    }, 1000);
  } catch (err) {
    console.error("Error canceling the request:", err.message || err);
    res.status(500).send({ error: "Something went wrong!" });
  }
});


export default router;
