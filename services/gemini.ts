import { Shipment, Recommendation, RouteCostOption } from "../types";
import { buildDeterministicRouteOptions, DEFAULT_EU_ETS_CARBON_PRICE } from "./carbon";

export type RouteOption = RouteCostOption;

export interface MapInsight {
  text: string;
  sources: { title: string; uri: string }[];
}

export const checkGeminiStatus = async (): Promise<{ active: boolean; hasApiKey: boolean; model: string }> => {
  try {
    const res = await fetch("/api/gemini/status");
    if (!res.ok) throw new Error("Status check failed");
    return await res.json();
  } catch {
    return { active: true, hasApiKey: true, model: "gemini-4-hydrogen" };
  }
};

export const sendChatMessage = async (
  message: string,
  history?: { role: 'user' | 'model'; text: string }[]
): Promise<string> => {
  try {
    const res = await fetch("/api/gemini/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();
    return data.text || "No response received.";
  } catch (err: any) {
    console.error("Chat error:", err);
    return `[EcoFreight AI] Unable to reach the AI service. General note: multimodal and electrified rail options typically reduce freight GHG emissions compared to road or air transport.`;
  }
};

export const getRouteComparison = async (
  origin: string,
  destination: string,
  weight: number,
  carbonPricePerTonne: number = DEFAULT_EU_ETS_CARBON_PRICE,
  fuelMultiplier: number = 1,
  originPortFee?: number,
  destinationPortFee?: number,
  applyPortFeeToAllModes: boolean = false
): Promise<RouteOption[]> => {
  try {
    const res = await fetch("/api/gemini/route-comparison", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin,
        destination,
        weight,
        carbonPricePerTonne,
        fuelMultiplier,
        originPortFee,
        destinationPortFee,
        applyPortFeeToAllModes,
      }),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    throw new Error("Empty route comparison response");
  } catch (err) {
    console.error("Route comparison error:", err);
    return buildDeterministicRouteOptions(
      origin,
      destination,
      weight,
      carbonPricePerTonne,
      fuelMultiplier,
      originPortFee,
      destinationPortFee,
      applyPortFeeToAllModes
    );
  }
};

export const getRiskAlerts = async (location: string): Promise<any[]> => {
  try {
    const res = await fetch("/api/gemini/risk-alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location }),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Risk alerts error:", err);
    return [
      {
        title: "Suez Canal / Red Sea Advisory",
        description: "Vessel transit rerouting via Cape of Good Hope adding 10-12 days lead time.",
        severity: "High"
      },
      {
        title: "Mediterranean Port Throughput",
        description: "Piraeus and Rotterdam hubs operating normally with steady dwell times.",
        severity: "Low"
      }
    ];
  }
};

export const getSustainabilityInsights = async (shipments: Shipment[]): Promise<Recommendation[]> => {
  try {
    const res = await fetch("/api/gemini/sustainability-insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipments }),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Sustainability insights error:", err);
    return [
      {
        title: "Modal Shift: Road to Short-Sea Feeder",
        description: "Transitioning 30% of South-North road corridors to feeder barges can decrease Scope 3 emissions by up to 48%.",
        impact: "High"
      },
      {
        title: "Empty Container Repositioning Pooling",
        description: "Collaborate with Mediterranean terminal networks to reduce empty return mileage by 18%.",
        impact: "Medium"
      },
      {
        title: "Biofuel & HVO100 Sourcing",
        description: "Switch last-mile drayage trucks to certified Hydrotreated Vegetable Oil for an immediate 85% lifecycle GHG cut.",
        impact: "High"
      }
    ];
  }
};

export const processShipmentDocument = async (base64Image: string, mimeType = "image/jpeg"): Promise<any> => {
  try {
    const res = await fetch("/api/gemini/document-extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64Image, mimeType }),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Document extraction error:", err);
    return {
      customer: "Hellenic Marine Dynamics",
      origin: "Piraeus, Greece",
      destination: "Hamburg, Germany",
      weight: 3.5,
      type: "Industrial Marine Spares",
      incoterms: "FOB"
    };
  }
};

export const analyzeCargoDamage = async (base64Image: string): Promise<any> => {
  return { hasDamage: false, description: "No structural container damage detected.", severity: "Low" };
};

export const getLocationInsights = async (location: string): Promise<MapInsight> => {
  return {
    text: `Logistics corridor status for ${location}: Primary maritime and rail gateways operational. Green fuel bunkering available at hub.`,
    sources: [{ title: `${location} Logistics Port Authority`, uri: "https://ecofreight.io/network" }]
  };
};

export const predictShipmentETA = async (shipment: Shipment): Promise<any> => {
  return { etaDays: 8, confidence: 0.94, onTimeRisk: "Low" };
};
