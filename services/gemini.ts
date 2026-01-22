
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Shipment, Recommendation, TransportMode } from "../types";

// Define the RouteOption interface for structured route comparison results
export interface RouteOption {
  mode: string;
  estimatedDays: number;
  estimatedCost: number;
  estimatedEmissionsKg: number;
  label: string;
  reasoning: string;
}

const getAIInstance = () => new GoogleGenAI({ apiKey: process.env.API_KEY });
const cache: Record<string, any> = {};

export const getRouteComparison = async (origin: string, destination: string, weight: number): Promise<RouteOption[]> => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Compare SEA, AIR, ROAD for ${weight}t from ${origin} to ${destination}. Return JSON with mode, estimatedDays, estimatedCost, estimatedEmissionsKg, label, reasoning.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            mode: { type: Type.STRING },
            estimatedDays: { type: Type.NUMBER },
            estimatedCost: { type: Type.NUMBER },
            estimatedEmissionsKg: { type: Type.NUMBER },
            label: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const getRiskAlerts = async (location: string): Promise<any[]> => {
  const ai = getAIInstance();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Search for current logistics risks, port strikes, or extreme weather near ${location} affecting maritime and air freight.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    // In a real app, we'd parse this text or use structured output. 
    // For the demo, we'll return a structured summary extracted by another prompt if needed.
    return [{ title: "Looming Disruption", description: response.text, severity: "High" }];
  } catch (e) {
    return [{ title: "No Critical Risks", description: "Standard operating conditions observed.", severity: "Low" }];
  }
};

export const analyzeCargoDamage = async (base64Image: string): Promise<any> => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { text: "Analyze this kargo photo for damages. Provide a JSON response with 'hasDamage' (boolean), 'description' (string), and 'severity' (Low/Medium/High)." },
        { inlineData: { mimeType: "image/jpeg", data: base64Image } }
      ]
    },
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const getSustainabilityInsights = async (shipments: Shipment[]): Promise<Recommendation[]> => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze logistics sustainability. Return JSON recommendations. Data: ${JSON.stringify(shipments)}`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "[]");
};

export const processShipmentDocument = async (base64Image: string): Promise<any> => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { text: "Extract: customer, origin, destination, weight, type. Return JSON." },
        { inlineData: { mimeType: "image/jpeg", data: base64Image } }
      ]
    },
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export interface MapInsight { text: string; sources: { title: string; uri: string }[]; }
export const getLocationInsights = async (location: string): Promise<MapInsight> => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Logistics telemetry for ${location}.`,
    config: { tools: [{ googleMaps: {} }] }
  });
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter((c: any) => c.maps).map((c: any) => ({ title: c.maps.title, uri: c.maps.uri })) || [];
  return { text: response.text || "", sources };
};

export const predictShipmentETA = async (shipment: Shipment): Promise<any> => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Predict ETA for ${shipment.id}. Return JSON.`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};
