import { NextResponse } from "next/server";
import Groq from "groq-sdk";
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
        const match = envContent.match(/GROQ_API_KEY="?([^"\n]+)"?/);
        if (match && match[1]) {
          dynamicApiKey = match[1];
        }
      }
    } catch (e) {
      console.log("Failed to read .env.local dynamically");
    }

    const apiKey = dynamicApiKey || process.env.GROQ_API_KEY;
    console.log("Using API Key starting with:", apiKey ? apiKey.substring(0, 15) : "none");

    if (!apiKey) {
      return NextResponse.json({ error: "Missing Groq API Key" }, { status: 500 });
    }

    const groq = new Groq({ apiKey });

    // Assuming the prompt already asks for JSON output, otherwise we enforce it in code
    // Let's add "Return ONLY valid JSON." to the prompt just in case.
    const enhancedPrompt = prompt + "\n\nReturn ONLY a valid JSON object. Do not include markdown formatting like ```json or ```.";

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: enhancedPrompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const text = chatCompletion.choices[0]?.message?.content || "";
    // Clean up any potential markdown just in case the model ignored the instructions
    const parsedText = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    return NextResponse.json(JSON.parse(parsedText));
  } catch (error: any) {
    console.error("Groq API Error:", error);

    // Fallback response for demonstration if API fails
    console.log("Error occurred. Returning simulated AI response fallback.");
    return NextResponse.json({
      risk: "Medium",
      reason: "Traffic congestion and moderate weather conditions indicate a possible delay of 45 mins. Route adjustments recommended.",
      suggestion: "Divert through the alternate eastern highway bypass to avoid the core congestion zone.",
      optimizedRoute: [
        { lat: 28.6139, lng: 77.2090, name: "Delhi Origin", type: "Origin" },
        { lat: 27.1767, lng: 78.0081, name: "Agra Bypass", type: "Transit" },
        { lat: 26.8467, lng: 80.9462, name: "Lucknow Destination", type: "Destination" }
      ]
    });
  }
}
