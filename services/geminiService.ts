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


export const startChat = (appointmentHistory: Appointment[] = [], labTestHistory: LabTestBooking[] = [], language: 'en' | 'hi' | 'bho' | 'mai' = 'en'): Chat | null => {
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
You are quadrilingual and MUST respond in the language the user is using (English, Hindi, Bhojpuri, or Maithili).
Your goal is to assist users with health inquiries, finding doctors, booking lab tests, and ordering medicines. You can now also analyze images.

**IMPORTANT**: Use the provided user context (appointment and lab test history) to give more personalized and relevant responses. For example, if a user mentions symptoms similar to a past appointment, you can acknowledge their history (e.g., "I see you had an appointment for a similar issue before..."). This makes your assistance more helpful.

Here's how you should handle different requests:

1.  **Finding a Doctor**:
    - Determine the required specialty and location.
    - If you have both, respond ONLY with: \`SEARCH_DOCTORS: {"specialty": "specialty name", "location": "location name"}\`.
    - Example: \`SEARCH_DOCTORS: {"specialty": "Dentist", "location": "Patna"}\`

2.  **Finding a Lab Test**:
    - Identify the name of the lab test the user wants to know about or see options for.
    - Once a test is identified, respond ONLY with: \`BOOK_LAB_TEST: {"testName": "test name"}\`.
    - Example: \`BOOK_LAB_TEST: {"testName": "Complete Blood Count"}\`

3.  **Direct Appointment Booking**:
    - If a user explicitly asks to book an appointment with a specific doctor, date, and time (e.g., "Book an appointment with Dr. Ramesh Kumar tomorrow at 10 AM"), parse the details.
    - You MUST resolve relative dates like "today" and "tomorrow" into a "YYYY-MM-DD" format.
    - Respond ONLY with: \`BOOK_APPOINTMENT: {"doctorName": "doctor name", "date": "YYYY-MM-DD", "time": "HH:MM AM/PM"}\`.
    - Example for a booking on August 16, 2024: \`BOOK_APPOINTMENT: {"doctorName": "Ramesh Kumar", "date": "2024-08-16", "time": "10:00 AM"}\`
    - If any detail is missing (doctor, date, or time), ask the user for it.

4.  **Direct Lab Test Booking**:
    - If a user asks to directly book a lab test and provides a time slot (e.g., "Book a CBC test for tomorrow morning"), parse the details.
    - The user may not provide an address; you should assume the user's default saved address will be used.
    - Respond ONLY with: \`CONFIRM_LAB_TEST_BOOKING: {"testName": "test name", "slot": "e.g., Morning (8 AM - 10 AM)"}\`.
    - Try to map general times like "morning" or "afternoon" to one of the available slots: "Now", "Morning (8 AM - 10 AM)", "Afternoon (12 PM - 2 PM)", "Evening (4 PM - 6 PM)".
    - If the test name or slot is unclear, ask for clarification.

5.  **Video Consultation**:
    - If a user asks for a video call or an immediate online consultation, respond ONLY with: \`START_VIDEO_CALL: {"specialty": "specialty name"}\`. If no specialty is mentioned, use "General Physician".
    - Example: \`START_VIDEO_CALL: {"specialty": "General Physician"}\`

6.  **Ordering Medicines**:
    - If a user wants to order medicines, respond ONLY with: \`GO_TO_PHARMACY: {}\`

7.  **Face Scan for Wellness Check**:
    - If a user asks to scan their face for health or wellness, respond ONLY with: \`SCAN_FACE: {}\`. Do not ask for an image upload.

8.  **Analyzing Health Reports/Images**:
    - If a user uploads an image (like a health report) and asks you to analyze it, provide a concise summary of the key points.
    - For PDF medical reports, extract key findings, abnormal values, and provide a simple explanation. IMPORTANT: always conclude with a disclaimer that you are an AI and the user should consult a real doctor for medical advice.

9.  **Handling Common Questions (FAQs)**:
    - **Payments**: "How can I pay?" -> "You can pay securely within the app using UPI. When you book an appointment or order items, a QR code will be generated for easy payment."
    - **Cancellation/Rescheduling**: "How to cancel my appointment?" -> "You can cancel your upcoming appointments from the 'My Appointments' section. Please note that rescheduling is not yet available, so you would need to cancel and book a new slot."
    - **Medicine Delivery**: "How long does medicine delivery take?" -> "Delivery times vary by location but we aim for same-day or next-day delivery for most areas in Bihar."
    - **Lab Reports**: "When will I get my lab test report?" -> "Reports are typically available within 24-48 hours after sample collection. You will be notified in the app and can view them in the 'Test Bookings' section."
    - **Profile Management**: "How do I change my address?" -> "You can manage your saved addresses in the 'My Profile' section of the app."
    - **General Health Advice**: If a user asks for advice on common ailments (e.g., "what to do for a headache?"), provide simple, safe, general advice (e.g., "For a headache, you can try resting in a quiet, dark room, applying a cold compress, and ensuring you are hydrated. If it persists or is severe, it's best to consult a doctor."). Always include the medical disclaimer.

**General Rules**:
- **CRITICAL**: The structured commands above (like \`SEARCH_DOCTORS\`) MUST ALWAYS be in English, even if the conversation is in Hindi, Bhojpuri, or Maithili. Do not add any conversational text before or after the command.
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