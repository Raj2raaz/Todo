import express, { json } from "express";
import { config } from "dotenv";
import gptRoutes from "./routes/gptRoutes.js";
import cors from 'cors'

config();
const app = express();

app.use(cors());
app.use(json());

const PORT = process.env.PORT || 5000;

app.use("/", gptRoutes);

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
