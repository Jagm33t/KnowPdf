import { NextRequest, NextResponse } from "next/server";
import { getContextFromSelectedText } from "@/lib/context";
import { OpenAIApi, Configuration, ChatCompletionRequestMessage } from "openai-edge";


const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY!,
});
const openai = new OpenAIApi(config);

export const runtime = "edge"; // Ensures compatibility with Edge Runtime

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming request body
    const { selectedText, fileKey } = await req.json();

    console.log("Received data from frontend:", { selectedText, fileKey });

    // Step 1: Fetch context from Pinecone
    const context = await getContextFromSelectedText(selectedText, fileKey);
    console.log("Context retrieved from Pinecone:", context);

    // Step 2: Generate a GPT prompt
    const prompt: ChatCompletionRequestMessage = {
      role: "system",
      content: `You are a helpful assistant. Use the following context to answer the user's query in markdown format. If the context does not contain the answer, respond with "I don't know." Do not make up answers.
      
      Context:
      ${context}
      
      User's Question:
      ${selectedText}`,
    };

    // Step 3: Send prompt to GPT
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [prompt],
      temperature: 0.3,
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error("OpenAI API Error Details:", errorDetails);
      return NextResponse.json({ error: "Error generating response from GPT" }, { status: 500 });
    }

    const result = await response.json();
    const answer = result.choices[0].message.content;

    console.log("GPT Response:", answer);

    // Step 4: Return the GPT-generated response
    return NextResponse.json({ answer }, { status: 200 });
  } catch (error) {
    console.error("Error processing API request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
