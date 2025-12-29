
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ChristmasIdea, ChristmasStory, Product, DeliveryPoint, MagicSolution, ShoppingItem, UniqueRecipe, StepByStepGuide, TriviaQuestion, ElfNameResult, MagicWeather } from "../types";

export interface ToyBlueprint {
  name: string;
  emoji: string;
  materials: string[];
  magicLevel: number;
  elfNote: string;
}

export interface MiracleIdea {
  title: string;
  emoji: string;
  description: string;
  recipe: string[];
  miracleEffect: string;
}

/**
 * Δημιουργεί μια υψηλής ποιότητας εικόνα (κάρτα) χρησιμοποιώντας το Gemini 3 Pro Image.
 */
export const generatePostcard = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: `A cinematic, ultra-high resolution Christmas postcard: ${prompt}. Magical lighting, snow effects, holiday atmosphere, 4k.` }],
    },
    config: {
      imageConfig: { aspectRatio: "16:9", imageSize: "1K" }
    },
  });
  
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to generate postcard");
};

/**
 * Αναλύει το ιστορικό του χρήστη και δημιουργεί μια ανασκόπηση (Memory Jar).
 */
export const generateMemoryReflection = async (history: ChristmasIdea[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const historyText = history.map(i => i.title).join(", ");
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Με βάση αυτές τις χριστουγεννιάτικες ιδέες που ανακάλυψε ο χρήστης: [${historyText}], γράψε ένα μικρό, συγκινητικό ποίημα ή μια μαγική περίληψη των φετινών του γιορτών. Απάντησε στα Ελληνικά.`,
  });
  return response.text || "";
};

/**
 * Προτείνει μαγικά εφέ για το δέντρο.
 */
export const suggestTreeMagic = async (userInput: string): Promise<{ effectName: string, cssClass: string, message: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Ο χρήστης θέλει να αλλάξει το δέντρο του: "${userInput}". Πρότεινε ένα όνομα εφέ και μια μικρή περιγραφή. Επίστρεψε JSON: effectName, message. Απάντησε στα Ελληνικά.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          effectName: { type: Type.STRING },
          message: { type: Type.STRING }
        },
        required: ["effectName", "message"]
      }
    }
  });
  return JSON.parse(response.text.trim());
};

/**
 * Δημιουργεί μια τυχαία ερώτηση Trivia για τα Χριστούγεννα.
 */
export const generateTriviaQuestion = async (): Promise<TriviaQuestion> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Δημιούργησε μια ενδιαφέρουσα ερώτηση trivia για τα Χριστούγεννα (ιστορία, παραδόσεις, ταινίες). Επίστρεψε JSON με: question, options (array 4 strings), correctAnswer (index 0-3), explanation. Απάντησε στα Ελληνικά.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.NUMBER },
          explanation: { type: Type.STRING }
        },
        required: ["question", "options", "correctAnswer", "explanation"]
      }
    }
  });
  return JSON.parse(response.text.trim());
};

/**
 * Παράγει ένα μοναδικό όνομα ξωτικού και μια ιστορία.
 */
export const generateElfName = async (realName: string, personality: string): Promise<ElfNameResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Δημιούργησε ένα μαγικό όνομα ξωτικού για τον/την "${realName}" που είναι "${personality}". Επίστρεψε JSON: elfName, role (στο εργαστήριο), backstory (μια μικρή πρόταση), emoji. Απάντησε στα Ελληνικά.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          elfName: { type: Type.STRING },
          role: { type: Type.STRING },
          backstory: { type: Type.STRING },
          emoji: { type: Type.STRING }
        },
        required: ["elfName", "role", "backstory", "emoji"]
      }
    }
  });
  return JSON.parse(response.text.trim());
};

/**
 * Προβλέπει τον "Μαγικό Καιρό" στον Βόρειο Πόλο.
 */
export const fetchMagicWeather = async (): Promise<MagicWeather> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Περίγραψε τον τρέχοντα 'μαγικό καιρό' στον Βόρειο Πόλο. Να είναι φανταστικός (π.χ. βροχή από αστερόσκονη). Επίστρεψε JSON: condition, temperature, windType, forecast (πρόβλεψη για αύριο), emoji. Απάντησε στα Ελληνικά.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          condition: { type: Type.STRING },
          temperature: { type: Type.STRING },
          windType: { type: Type.STRING },
          forecast: { type: Type.STRING },
          emoji: { type: Type.STRING }
        },
        required: ["condition", "temperature", "windType", "forecast", "emoji"]
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateUniqueRecipe = async (type: string, price: number, category: string = 'cooking'): Promise<UniqueRecipe> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isPotion = category === 'potion';
  const isSensory = category === 'sensory';
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Είσαι ο "${isSensory ? "Sensory Architect" : isPotion ? "Master Alchemist" : "Michelin Star Elf Chef"}". 
    Δημιούργησε μια ΕΝΤΕΛΩΣ ΠΡΩΤΟΤΥΠΗ και ΜΑΓΙΚΗ ${isSensory ? "αισθητηριακή ατμόσφαιρα (φώτα, μυρωδιές, ήχοι)" : isPotion ? "συνταγή φίλτρου (ποτού)" : "χριστουγεννιάτικη συνταγή"} για: "${type}". 
    Συμπερίλαβε ένα "Μυστικό Συστατικό" (secretIngredient). 
    Επίστρεψε JSON: name, secretIngredient, rarity (Common/Rare/Legendary), ingredients (array), instructions (array), cookingTime. 
    Απάντησε στα Ελληνικά.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          secretIngredient: { type: Type.STRING },
          rarity: { type: Type.STRING },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
          cookingTime: { type: Type.STRING }
        },
        required: ["name", "secretIngredient", "rarity", "ingredients", "instructions", "cookingTime"]
      }
    }
  });

  const data = JSON.parse(response.text.trim());
  return { ...data, id: `recipe-${Date.now()}`, price: price, isUnlocked: price === 0 };
};

export const generateStepByStepGuide = async (task: string, price: number, category: string = 'logistics'): Promise<StepByStepGuide> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Δημιούργησε έναν οδηγό βήμα-βήμα για: "${task}". Επίστρεψε JSON: title, difficulty, steps (array of objects with title, instruction, tip). Απάντησε στα Ελληνικά.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { title: { type: Type.STRING }, instruction: { type: Type.STRING }, tip: { type: Type.STRING } },
              required: ["title", "instruction", "tip"]
            }
          }
        },
        required: ["title", "difficulty", "steps"]
      }
    }
  });
  const data = JSON.parse(response.text.trim());
  return { ...data, id: `guide-${Date.now()}`, price: price, isUnlocked: price === 0 };
};

export const generateFestiveShoppingList = async (prompt: string): Promise<ShoppingItem[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Δημιούργησε μια λίστα ψωνίων για: "${prompt}". Επίστρεψε JSON ARRAY: name, category, quantity, estimatedPrice. Απάντησε στα Ελληνικά.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            quantity: { type: Type.STRING },
            estimatedPrice: { type: Type.NUMBER }
          },
          required: ["name", "category", "quantity", "estimatedPrice"]
        }
      }
    }
  });
  const rawData = JSON.parse(response.text.trim());
  return rawData.map((item: any, index: number) => ({ ...item, id: `item-${Date.now()}-${index}`, isBought: false }));
};

export const suggestMissingShoppingItems = async (currentItems: ShoppingItem[]): Promise<ShoppingItem[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const itemsText = currentItems.map(i => i.name).join(", ");
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Με βάση αυτή τη λίστα ψωνίων: [${itemsText}], πρότεινε 3-5 αντικείμενα που λείπουν. Επίστρεψε JSON ARRAY. Απάντησε στα Ελληνικά.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { name: { type: Type.STRING }, category: { type: Type.STRING }, quantity: { type: Type.STRING }, estimatedPrice: { type: Type.NUMBER } },
          required: ["name", "category", "quantity", "estimatedPrice"]
        }
      }
    }
  });
  const rawData = JSON.parse(response.text.trim());
  return rawData.map((item: any, index: number) => ({ ...item, id: `suggest-${Date.now()}-${index}`, isBought: false }));
};

export const generateSocialPost = async (spirit: number, giftsOpened: number): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Δημιούργησε ένα αστείο social post. Spirit: ${spirit}%, Gifts: ${giftsOpened}. Απάντησε στα Ελληνικά.`,
  });
  return response.text || "";
};

export const transformToElf = async (base64Image: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: 'Transform this person into a high-quality Christmas Elf character. Snowy background. Cinematic lighting.' },
      ],
    },
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Failed to generate image");
};

export const generateSantaVideo = async (city: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Santa Claus flying over ${city} at night. Hyper-realistic.`,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
  });
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return `${downloadLink}&key=${process.env.API_KEY}`;
};

export const solveLifeProblem = async (problem: string, mode: string = "general"): Promise<MagicSolution> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Λύσε το πρόβλημα: "${problem}" σε mode ${mode}. Επίστρεψε JSON στα Ελληνικά: problem, practicalStep, festiveTwist, lifeHack, emoji.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { problem: { type: Type.STRING }, practicalStep: { type: Type.STRING }, festiveTwist: { type: Type.STRING }, lifeHack: { type: Type.STRING }, emoji: { type: Type.STRING } },
        required: ["problem", "practicalStep", "festiveTwist", "lifeHack", "emoji"]
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateChristmasIdea = async (): Promise<ChristmasIdea> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Δημιούργησε μια μοναδική χριστουγεννιάτικη ιδέα. Επίστρεψε JSON στα Ελληνικά.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, emoji: { type: Type.STRING } },
        required: ["title", "description", "emoji"]
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateCozyStory = async (theme: string = "Χριστούγεννα"): Promise<ChristmasStory> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Γράψε μια ζεστή ιστορία: ${theme}. Επίστρεψε JSON στα Ελληνικά.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { title: { type: Type.STRING }, content: { type: Type.STRING }, moral: { type: Type.STRING } },
        required: ["title", "content", "moral"]
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateBudgetChristmasIdea = async (): Promise<ChristmasIdea> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Δώσε μια οικονομική ιδέα. Επίστρεψε JSON στα Ελληνικά.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, emoji: { type: Type.STRING } },
        required: ["title", "description", "emoji"]
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateAdventSurprise = async (day: number): Promise<{ content: string; emoji: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Έκπληξη για την ημέρα ${day}. Επίστρεψε JSON στα Ελληνικά.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { content: { type: Type.STRING }, emoji: { type: Type.STRING } },
        required: ["content", "emoji"]
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateSpeech = async (text: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export const getPersonalizedGiftSuggestions = async (input: string): Promise<ChristmasIdea[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Πρότεινε 3 ιδέες για: ${input}. Επίστρεψε JSON στα Ελληνικά.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, emoji: { type: Type.STRING } },
          required: ["title", "description", "emoji"]
        }
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateDeliveryMapData = async (): Promise<DeliveryPoint[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Δημιούργησε 5 τυχαία σημεία παράδοσης. Επίστρεψε JSON στα Ελληνικά.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING }, recipient: { type: Type.STRING }, location: { type: Type.STRING }, gift: { type: Type.STRING }, emoji: { type: Type.STRING },
            status: { type: Type.STRING, enum: ["pending", "delivered"] },
            coords: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["x", "y"] },
            chimneyStatus: { type: Type.STRING }, snacks: { type: Type.STRING }, threatLevel: { type: Type.STRING }
          },
          required: ["id", "recipient", "location", "gift", "emoji", "status", "coords", "chimneyStatus", "snacks", "threatLevel"]
        }
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateToyBlueprint = async (input: string): Promise<ToyBlueprint> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Blueprint για παιχνίδι: ${input}. Επίστρεψε JSON στα Ελληνικά.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { name: { type: Type.STRING }, emoji: { type: Type.STRING }, materials: { type: Type.ARRAY, items: { type: Type.STRING } }, magicLevel: { type: Type.NUMBER }, elfNote: { type: Type.STRING } },
        required: ["name", "emoji", "materials", "magicLevel", "elfNote"]
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateMiracleIdea = async (): Promise<MiracleIdea> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: "Ιδέα για θαύμα. Επίστρεψε JSON στα Ελληνικά.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { title: { type: Type.STRING }, emoji: { type: Type.STRING }, description: { type: Type.STRING }, recipe: { type: Type.ARRAY, items: { type: Type.STRING } }, miracleEffect: { type: Type.STRING } },
        required: ["title", "emoji", "description", "recipe", "miracleEffect"]
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateSantaJoke = async (mood: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Πες ένα αστείο του Άη Βασίλη. Mood: ${mood}. Απάντησε στα Ελληνικά.`,
  });
  return response.text || "";
};

export const generateSantaReaction = async (action: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Αντίδραση Άη Βασίλη σε: ${action}. Απάντησε στα Ελληνικά.`,
  });
  return response.text || "";
};

export const scanUserStatus = async (): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Σκανάρισμα χρήστη. Επίστρεψε JSON στα Ελληνικά.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { status: { type: Type.STRING }, reason: { type: Type.STRING }, giftRecommendation: { type: Type.STRING } },
        required: ["status", "reason", "giftRecommendation"]
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateLetterResponse = async (wish: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Απάντηση σε γράμμα: ${wish}. Απάντησε στα Ελληνικά.`,
  });
  return response.text || "";
};

export const generateNorthPoleNews = async (): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "5 νέα από Βόρειο Πόλο. Επίστρεψε JSON array. Απάντησε στα Ελληνικά.",
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateSantaWorkshopThanks = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Ευχαριστήριο Άη Βασίλη. Απάντησε στα Ελληνικά.",
  });
  return response.text || "";
};

export const getSantaDailyPick = async (): Promise<Product> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Δώρο της ημέρας. Επίστρεψε JSON στα Ελληνικά.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, description: { type: Type.STRING }, price: { type: Type.NUMBER }, emoji: { type: Type.STRING }, category: { type: Type.STRING }, benefits: { type: Type.ARRAY, items: { type: Type.STRING } } },
        required: ["id", "name", "description", "price", "emoji", "category", "benefits"]
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const designCustomProduct = async (prompt: string): Promise<Product> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Σχεδίασε προϊόν: "${prompt}". Επίστρεψε JSON στα Ελληνικά.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, description: { type: Type.STRING }, price: { type: Type.NUMBER }, emoji: { type: Type.STRING }, category: { type: Type.STRING }, reward: { type: Type.STRING }, benefits: { type: Type.ARRAY, items: { type: Type.STRING } } },
        required: ["id", "name", "description", "price", "emoji", "category", "benefits", "reward"]
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const suggestAIProducts = async (need: string): Promise<Product[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `3 προϊόντα για: "${need}". Επίστρεψε JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, description: { type: Type.STRING }, price: { type: Type.NUMBER }, emoji: { type: Type.STRING }, category: { type: Type.STRING }, benefits: { type: Type.ARRAY, items: { type: Type.STRING } } },
          required: ["id", "name", "description", "price", "emoji", "category", "benefits"]
        }
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const suggestFreeSample = async (userInterest: string): Promise<{ name: string; description: string; emoji: string; type: 'physical' | 'digital' }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Δωρεάν δείγμα για: ${userInterest}. Επίστρεψε JSON στα Ελληνικά.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { name: { type: Type.STRING }, description: { type: Type.STRING }, emoji: { type: Type.STRING }, type: { type: Type.STRING } },
        required: ["name", "description", "emoji", "type"]
      }
    }
  });
  return JSON.parse(response.text.trim());
};
