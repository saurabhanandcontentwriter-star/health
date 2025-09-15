import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { Appointment, LabTestBooking } from '../types';

const recommendationSchema = {
  type: Type.OBJECT,
  properties: {
    specialty: {
      type: Type.STRING,
      description: "The recommended medical specialty, e.g., 'Cardiologist', 'General Physician', 'Dermatologist'.",
    },
    reasoning: {
      type: Type.STRING,
      description: "A brief, one-sentence explanation for the recommendation.",
    },
  },
  required: ['specialty', 'reasoning']
};

export const recommendDoctorSpecialty = async (symptoms: string): Promise<{ specialty: string; reasoning: string }> => {
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    console.warn("API_KEY environment variable not set. Using fallback recommendation logic.");
    // Fallback logic if API key is not present
    if (symptoms.toLowerCase().includes("fever") || symptoms.toLowerCase().includes("cough")) {
        return { specialty: "General Physician", reasoning: "Based on common symptoms like fever and cough." };
    } else if (symptoms.toLowerCase().includes("tooth") || symptoms.toLowerCase().includes("gum")) {
        return { specialty: "Dentist", reasoning: "Based on dental-related symptoms." };
    } else {
        return { specialty: "General Physician", reasoning: "For general or unspecified symptoms, a General Physician is a good starting point." };
    }
  }

  try {
    // Initialize the AI client only when the key is available
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on the following symptoms, what is the most likely medical specialty a person should consult? Symptoms: "${symptoms}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: recommendationSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result;

  } catch (error) {
    console.error("Error calling Gemini API for specialty recommendation:", error);
    let errorMessage = "Failed to get AI recommendation. Please try again.";
    if (error instanceof Error) {
        if (error.message.toLowerCase().includes('fetch')) {
            errorMessage = "A network error occurred. Please check your internet connection and try again.";
        } else if (error.message.toLowerCase().includes('api key')) {
             errorMessage = "The AI service is not configured correctly. Please contact support.";
        }
    }
    throw new Error(errorMessage);
  }
};

export const generateContentWithImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<GenerateContentResponse> => {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const imagePart = {
        inlineData: {
            mimeType,
            data: imageBase64,
        },
    };
    const textPart = { text: prompt };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });
        return response;
    } catch (error) {
        console.error("Error calling Gemini API with image:", error);
        let errorMessage = "Failed to analyze the image. Please try again.";
        if (error instanceof Error) {
            if (error.message.toLowerCase().includes('fetch')) {
                errorMessage = "A network error occurred while analyzing the image. Please check your connection.";
            } else if (error.message.toLowerCase().includes('api key')) {
                errorMessage = "The AI service is not configured correctly. Please contact support.";
            }
        }
        throw new Error(errorMessage);
    }
};


export const startChat = (appointmentHistory: Appointment[] = [], labTestHistory: LabTestBooking[] = [], language: 'en' | 'hi' = 'en'): Chat | null => {
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
        console.error("API_KEY environment variable not set. Chatbot is disabled.");
        return null;
    }

    let historyContext = "";

    if (appointmentHistory.length > 0) {
        historyContext += "Here is the user's past appointment history (most recent first):\n";
        const sortedAppointments = [...appointmentHistory].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        sortedAppointments.slice(0, 5).forEach(appt => {
            historyContext += `- Appointment with Dr. ${appt.doctor_name} on ${appt.appointment_date} for symptoms: "${appt.symptoms || 'not specified'}".\n`;
        });
    }

    if (labTestHistory.length > 0) {
        historyContext += "\nHere is the user's past lab test history (most recent first):\n";
        const sortedLabTests = [...labTestHistory].sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
        sortedLabTests.slice(0, 5).forEach(test => {
            historyContext += `- Booked "${test.testName}" on ${new Date(test.bookingDate).toLocaleDateString()}. Status: ${test.status}.\n`;
        });
    }
    
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const systemInstruction = `${historyContext ? `CONTEXT ABOUT THE USER:\n${historyContext}\n\n` : ''}You are a friendly and helpful AI Bot for Bihar Health Connect.
You are bilingual and MUST respond in the language the user is using (English or Hindi).
Your goal is to assist users with health inquiries, finding doctors, booking lab tests, and ordering medicines. You can now also analyze images.

**IMPORTANT**: Use the provided user context (appointment and lab test history) to give more personalized and relevant responses. For example, if a user mentions symptoms similar to a past appointment, you can acknowledge their history (e.g., "I see you had an appointment for a similar issue before..."). This makes your assistance more helpful.

Here's how you should handle different requests:

1.  **Finding a Doctor**:
    - Determine the required specialty and location.
    - If you have both, respond ONLY with: \`SEARCH_DOCTORS: {"specialty": "specialty name", "location": "location name"}\`.
    - Example: \`SEARCH_DOCTORS: {"specialty": "Dentist", "location": "Patna"}\`

2.  **Booking a Lab Test**:
    - Identify the name of the lab test the user wants.
    - Once a test is identified, respond ONLY with: \`BOOK_LAB_TEST: {"testName": "test name"}\`.
    - Example: \`BOOK_LAB_TEST: {"testName": "Complete Blood Count"}\`

3.  **Video Consultation**:
    - If a user asks for a video call or an immediate online consultation, respond ONLY with: \`START_VIDEO_CALL: {"specialty": "specialty name"}\`. If no specialty is mentioned, use "General Physician".
    - Example: \`START_VIDEO_CALL: {"specialty": "General Physician"}\`

4.  **Ordering Medicines**:
    - If a user wants to order medicines, respond ONLY with: \`GO_TO_PHARMACY: {}\`

5.  **Face Scan for Wellness Check**:
    - If a user asks to scan their face for health or wellness, respond ONLY with: \`SCAN_FACE: {}\`. Do not ask for an image upload.

6.  **Analyzing Health Reports/Images**:
    - If a user uploads an image (like a health report) and asks you to analyze it, provide a concise summary of the key points.
    - For PDF medical reports, extract key findings, abnormal values, and provide a simple explanation. IMPORTANT: always conclude with a disclaimer that you are an AI and the user should consult a real doctor for medical advice.

**General Rules**:
- **CRITICAL**: The structured commands above (like \`SEARCH_DOCTORS\`) MUST ALWAYS be in English, even if the conversation is in Hindi. Do not add any conversational text before or after the command.
- If you need more information, ask clarifying questions in the user's language.
- For general health questions, answer conversationally in the user's language.
- **IMPORTANT**: You are not a medical professional. Do not provide diagnoses or prescribe medication. Any health advice must be general and include a disclaimer to consult a real doctor.
- You cannot handle payments. For any payment-related query, inform the user that payment will be handled securely within the app.`;
    
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        }
    });
};