import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    
    // Dynamically read .env.local to avoid requiring a server restart
    let dynamicApiKey = "";
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/NEXT_PUBLIC_GEMINI_API_KEY="?([^"\n]+)"?/);
        if (match && match[1]) {
          dynamicApiKey = match[1];
        }
      }
    } catch (e) {
      console.log("Failed to read .env.local dynamically");
    }

    const apiKey = dynamicApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    console.log("Using API Key starting with:", apiKey ? apiKey.substring(0, 15) : "none");
    
    if (!apiKey) {
      return NextResponse.json({ error: "Missing Gemini API Key" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/gi, "").replace(/```/g, "").trim();
    
    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate AI response" }, { status: 500 });
  }
}
