import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "../shared/logger.js";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.gemini_api_key);

async function gemini_call(data) {
  logger.info("Calling Gemini API call for the Image");
  
  const model = genAI.getGenerativeModel({
    model: data.model,
    generationConfig: data.generationConfig
  });
  
  const response = await model.generateContent(data.contents);
  
  const result = response.response.text();
  return JSON.parse(result);
}


export default gemini_call;
