import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateSummary(notes: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide a detailed, comprehensive summary that retains all the key information and is roughly the same length as the original notes, but rewrite it to be perfectly structured, engaging, and easy to read:\n\n${notes}`,
  });
  return response.text || "";
}

export async function generateBulletPoints(notes: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Convert the following notes into key bullet points for quick revision:\n\n${notes}`,
  });
  return response.text || "";
}

export async function generateQuiz(notes: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create 5 to 10 quiz questions based on the following notes to help a student test their understanding. Provide the answers at the end:\n\n${notes}`,
  });
  return response.text || "";
}

export async function generateKeyConcepts(notes: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract the most important keywords or topics from the following notes and provide a brief definition or explanation for each:\n\n${notes}`,
  });
  return response.text || "";
}

export async function chatWithGemini(messages: { role: 'user' | 'model', parts: { text: string }[] }[], newMessage: string, notes: string = ""): Promise<string> {
  const contents = messages.map(msg => ({
    role: msg.role,
    parts: msg.parts
  }));
  
  contents.push({
    role: 'user',
    parts: [{ text: newMessage }]
  });

  const systemInstruction = notes.trim() 
    ? `You are a helpful AI tutor assisting a student with their studies. Answer their questions clearly and concisely. Here are the student's current notes for context:\n\n${notes}`
    : "You are a helpful AI tutor assisting a student with their studies. Answer their questions clearly and concisely.";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: contents as any,
    config: {
      systemInstruction: systemInstruction,
    }
  });

  return response.text || "";
}
