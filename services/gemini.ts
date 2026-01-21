
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Shipment, Recommendation } from "../types";

const getAIInstance = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Simple in-memory cache to prevent redundant API calls (429 errors)
const cache: Record<string, any> = {};

export const getSustainabilityInsights = async (shipments: Shipment[]): Promise<Recommendation[]> => {
  const cacheKey = `sustain_${shipments.map(s => s.id).join('_')}`;
  if (cache[cacheKey]) return cache[cacheKey];

  const ai = getAIInstance();
  const summary = shipments.map(s => ({
    mode: s.legs[0]?.mode,
    emissions: s.totalEmissionsKg,
    route: `${s.origin} to ${s.destination}`
  }));

  const prompt = `Analyze this shipping data and provide 3 specific, actionable recommendations to reduce carbon footprint. Data: ${JSON.stringify(summary)}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      // Flash model has much higher rate limits than Pro on Free Tier
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
            },
            propertyOrdering: ["title", "description", "impact"],
          }
        },
        systemInstruction: "You are an expert sustainability consultant for global logistics."
      }
    });

    const result = JSON.parse(response.text || "[]");
    cache[cacheKey] = result;
    return result;
  } catch (error) {
    console.error("AI Error:", error);
    return [];
  }
};

export const processShipmentDocument = async (base64Image: string): Promise<any> => {
  const ai = getAIInstance();
  
  const prompt = "Extract the following details from this shipping document: Customer Name, Origin City/Country, Destination City/Country, Total Weight in Tonnes, and Cargo Type. If a field is missing, return 'Unknown'.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: base64Image } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            customer: { type: Type.STRING },
            origin: { type: Type.STRING },
            destination: { type: Type.STRING },
            weight: { type: Type.NUMBER },
            type: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Document Process Error:", error);
    return null;
  }
};

export interface MapInsight {
  text: string;
  sources: { title: string; uri: string }[];
}

export const getLocationInsights = async (location: string): Promise<MapInsight> => {
  if (cache[`loc_${location}`]) return cache[`loc_${location}`];

  const ai = getAIInstance();
  
  let userCoords = { latitude: 41.0082, longitude: 28.9784 };
  try {
    const pos = await new Promise<GeolocationPosition>((res, rej) => 
      navigator.geolocation.getCurrentPosition(res, rej)
    );
    userCoords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch (e) { /* ignore */ }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide real-time logistics information about ${location}. Mention nearby major ports, freight terminals, and current logistics status in that area.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: userCoords
          }
        }
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter((chunk: any) => chunk.maps)
      ?.map((chunk: any) => ({
        title: chunk.maps.title,
        uri: chunk.maps.uri
      })) || [];

    const result = {
      text: response.text || "AI insight could not be generated.",
      sources: sources
    };
    cache[`loc_${location}`] = result;
    return result;
  } catch (error) {
    console.error("Maps AI Error:", error);
    return { text: "Failed to connect to AI Tracking Services.", sources: [] };
  }
};

export interface ETAPrediction {
  estimated_days: number;
  confidence_score: number;
  reasoning: string;
  predicted_status: string;
}

export const predictShipmentETA = async (shipment: Shipment): Promise<ETAPrediction | null> => {
  if (cache[`eta_${shipment.id}`]) return cache[`eta_${shipment.id}`];

  const ai = getAIInstance();
  
  const context = {
    origin: shipment.origin,
    destination: shipment.destination,
    mode: shipment.legs[0]?.mode,
    cargo: shipment.cargoType,
    currentStatus: shipment.status
  };

  const prompt = `Predict the Estimated Time of Arrival (ETA) and logistical confidence for this shipment based on its route and mode. 
  Data: ${JSON.stringify(context)}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimated_days: { type: Type.NUMBER },
            confidence_score: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            predicted_status: { type: Type.STRING }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "null");
    cache[`eta_${shipment.id}`] = result;
    return result;
  } catch (error) {
    console.error("ETA Prediction Error:", error);
    return null;
  }
};
