import { GoogleGenAI, Type } from "@google/genai";
import { Doctor } from "../types";

let ai: GoogleGenAI;

const getAi = () => {
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    }
    return ai;
}

export const getDoctorRecommendations = async (symptoms: string, doctors: Doctor[]): Promise<{ doctorId: string; reason: string; }[]> => {
    const aiInstance = getAi();
    const doctorsInfo = doctors.map(d => ({
        id: d.id,
        name: d.name,
        specialization: d.specialization,
        experience: d.experience,
        qualifications: d.qualifications
    }));

    const prompt = `You are an intelligent medical assistant for 'Bihar Health Connect'. A user has reported the following symptoms: "${symptoms}". Based on these symptoms, analyze possible conditions, determine relevant medical specializations, and from the provided list of doctors, select up to three most suitable ones. For each, provide a concise reason for the recommendation. Here is the list of available doctors: ${JSON.stringify(doctorsInfo)}`;

    try {
        const response = await aiInstance.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        recommendations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    doctorId: {
                                        type: Type.STRING,
                                        description: "The ID of the recommended doctor from the provided list."
                                    },
                                    reason: {
                                        type: Type.STRING,
                                        description: "A brief reason (1-2 sentences) for recommending this doctor based on the user's symptoms."
                                    }
                                },
                                required: ["doctorId", "reason"]
                            },
                            description: "An array of up to 3 recommended doctors."
                        }
                    },
                    required: ["recommendations"]
                }
            }
        });

        const jsonResponse = JSON.parse(response.text);
        return jsonResponse.recommendations || [];
    } catch (error) {
        console.error("Error getting doctor recommendations from Gemini:", error);
        return [];
    }
};

export const analyzeUserIntent = async (message: string): Promise<{isRecommendationRequest: boolean; symptoms: string | null}> => {
    const aiInstance = getAi();
    const prompt = `Analyze the user's message. Does it contain a description of medical symptoms and an explicit or implicit request for a doctor? Respond with a JSON object containing two keys: 'isRecommendationRequest' (boolean) and 'symptoms' (string, containing the extracted symptoms if applicable, otherwise null). User message: '${message}'`
    
    try {
        const response = await aiInstance.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isRecommendationRequest: {
                            type: Type.BOOLEAN
                        },
                        symptoms: {
                            type: Type.STRING
                        }
                    },
                    required: ['isRecommendationRequest']
                }
            }
        });
        const jsonResponse = JSON.parse(response.text);
        if (!jsonResponse.symptoms || jsonResponse.symptoms.trim() === '') {
            jsonResponse.symptoms = null;
        }
        return jsonResponse;

    } catch (error) {
        console.error("Error analyzing user intent:", error);
        return { isRecommendationRequest: false, symptoms: null };
    }
}


export const getChatbotResponseStream = async (history: { role: string, parts: { text: string }[] }[], message: string) => {
    const aiInstance = getAi();
    const chat = aiInstance.chats.create({
        model: 'gemini-2.5-flash',
        history: history,
        config: {
            systemInstruction: "You are a helpful AI assistant for 'Bihar Health Connect', a healthcare app. Your primary role is to assist users with their health-related queries. If a user describes symptoms and asks for a doctor, use the information to help them. You can't book appointments directly, but you can guide them to the booking section. Keep your responses concise, friendly, and helpful."
        }
    });

    return chat.sendMessageStream({ message });
}
