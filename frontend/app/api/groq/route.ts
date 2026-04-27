import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing Groq API Key" }, { status: 500 });
    }

    const groq = new Groq({ apiKey });

    // The user wants a strict JSON response
    const enhancedPrompt = prompt + "\n\nReturn ONLY a valid JSON object. Do not include markdown formatting like ```json or ```.";

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: enhancedPrompt,
        },
      ],
      model: "llama-3-8b-8192",
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const text = chatCompletion.choices[0]?.message?.content || "";
    // Clean up any potential markdown just in case the model ignored the instructions
    const parsedText = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    return NextResponse.json(JSON.parse(parsedText));
  } catch (error: any) {
    console.error("Groq API Error:", error);
    
    const errorMessage = error.message || "Unknown AI Error";
    const isRateLimit = errorMessage.toLowerCase().includes("rate limit") || (error.error?.error?.code === "rate_limit_exceeded");

    return NextResponse.json({
      risk: "Error",
      reason: isRateLimit ? "Groq API Rate Limit reached. Please wait a few minutes." : `AI Error: ${errorMessage}`,
      suggestion: "Check your Groq dashboard or try again in a moment.",
      optimizedRoute: []
    }, { status: isRateLimit ? 429 : 500 });
  }
}
