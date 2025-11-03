import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModelsRaw() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    const res = await axios.get(url);
    console.log("AVAILABLE MODELS (RAW):");
    res.data.models.forEach(m => {
      console.log(`- ID: ${m.name}, Display: ${m.displayName}, Supported Methods: ${m.supportedGenerationMethods.join(", ")}`);
    });
  } catch (err) {
    console.error("Error listing models raw:", err.response?.data || err.message);
  }
}

listModelsRaw();
