import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;

try {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenAI:", error);
}

export const improveText = async (text: string, instruction: string): Promise<string> => {
  if (!apiKey || !ai) {
    console.error("API Key is missing");
    return "Error: API Key missing. Please configure your environment.";
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are an expert resume writer and career coach. 
      Task: ${instruction}
      
      Input Text:
      "${text}"
      
      Return ONLY the improved text. Do not include quotes or explanations.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return text; // Fallback to original text on error
  }
};

export const generateSummary = async (role: string, experience: string): Promise<string> => {
  if (!apiKey || !ai) return "API Key missing.";

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Write a professional resume summary (approx 50 words) for a ${role}.
      Based on this experience context: "${experience.slice(0, 500)}..."
      
      Keep it impactful, use action verbs, and avoid buzzwords.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "";
  }
}

export const analyzeATS = async (resumeText: string, jobDescription: string = ''): Promise<any> => {
  if (!apiKey || !ai) return null;

  try {
    const model = 'gemini-2.5-flash';
    const jdContext = jobDescription ? `Target Job Description: ${jobDescription}` : "Target: General Professional Role";

    const prompt = `
      Analyze this resume text for ATS (Applicant Tracking System) compatibility.
      ${jdContext}
      
      Resume Text: "${resumeText.slice(0, 3000)}"

      Return a JSON object with this EXACT structure (no markdown formatting, just raw JSON):
      {
        "score": number, // 0-100 based on keyword match, readability, impact
        "criticalIssues": string[], // List of 2-3 major issues to fix
        "missingKeywords": string[], // List of 3-5 important keywords missing (if JD provided, extract from JD)
        "positiveFeedback": string[] // List of 2 things done well
      }
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text || "{}";
    try {
      return JSON.parse(text);
    } catch (e) {
      // Fallback if model returns markdown block
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    }
  } catch (error) {
    console.error("ATS Analysis Error:", error);
    return null;
  }
};

export const getSmartCompletion = async (currentSentence: string, context: string, role?: string, company?: string): Promise<string> => {
  if (!apiKey || !ai || currentSentence.length < 10) return "";

  try {
    const model = 'gemini-2.5-flash';
    const roleContext = role ? `Role: ${role}` : '';
    const companyContext = company ? `Company: ${company}` : '';

    const prompt = `
      You are an expert resume writer. Complete this bullet point for a resume.
      Context: ${context}
      ${roleContext}
      ${companyContext}
      
      Current text: "${currentSentence}"
      
      Task: Provide a high-quality, professional completion that focuses on impact and results.
      Rules:
      1. Return ONLY the completion text.
      2. Do not repeat the input text.
      3. Keep it concise (max 10-15 words).
      4. If the input is too short or unclear, return an empty string.
      
      Example Input: "Led a team of" -> Example Output: "5 engineers to deliver the project 2 weeks ahead of schedule."
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const text = response.text?.trim() || "";
    // Filter out bad completions
    if (text.length < 5 || text.includes("Input:") || text.includes("Output:")) return "";

    return text;
  } catch (error) {
    return "";
  }
};