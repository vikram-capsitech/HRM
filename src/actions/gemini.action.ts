"use server";
import OpenAI from "openai";
import { HirelySystemPrompt } from "@/lib/hirely-context";

const openai = new OpenAI({
  apiKey: JSON.parse(process.env.OPENAI_API_KEY as string)[4],
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export async function generateChatResponse(
  message: string,
  chatHistory: Array<{ role: "user" | "model"; content: string }> = []
) {
  try {
    // Convert chat history to OpenAI format
    const formattedHistory = chatHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    }));

    // Add the current message to the history
    const messages = [
      { role: "system", content: HirelySystemPrompt },
      ...formattedHistory,
      { role: "user", content: message },
    ];

    // Generate a response using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 800,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    return { success: true, data: responseText };
  } catch (error) {
    console.error("Error generating chat response:", error);
    return {
      success: false,
      error: "Failed to generate response. Please try again.",
    };
  }
}