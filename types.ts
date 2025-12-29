
export interface ChristmasIdea {
  title: string;
  description: string;
  emoji: string;
}

export interface MagicSolution {
  problem: string;
  practicalStep: string;
  festiveTwist: string;
  lifeHack: string;
  emoji: string;
  modeLabel?: string;
}

export interface TriviaQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ElfNameResult {
  elfName: string;
  role: string;
  backstory: string;
  emoji: string;
}

export interface MagicWeather {
  condition: string;
  temperature: string;
  windType: string;
  forecast: string;
  emoji: string;
}

export interface StepByStepGuide {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  steps: {
    title: string;
    instruction: string;
    tip: string;
  }[];
  price: number;
  isUnlocked: boolean;
  likes?: number;
  rating?: number;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  emoji: string;
  timestamp: string;
}

export interface UniqueRecipe {
  id: string;
  name: string;
  secretIngredient: string;
  rarity: 'Common' | 'Rare' | 'Legendary';
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  price: number;
  isUnlocked: boolean;
  likes?: number;
  rating?: number;
  comments?: Comment[];
}

export interface ChristmasStory {
  title: string;
  content: string;
  moral: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  isBought: boolean;
  estimatedPrice?: number;
}

export interface DeliveryPoint {
  id: string;
  recipient: string;
  location: string;
  gift: string;
  emoji: string;
  status: 'pending' | 'delivered';
  coords: { x: number; y: number };
  chimneyStatus: 'clear' | 'blocked' | 'narrow' | 'fireplace-active';
  snacks: string;
  threatLevel: 'low' | 'dog-present' | 'elf-on-shelf-watching';
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  category: string;
  benefits: string[];
  images?: string[];
  reviews?: Review[];
  customQuote?: string;
  reward?: string;
  isNew?: boolean;
}

export interface GiftItem {
  id: number;
  color: string;
  isOpen: boolean;
  name?: string;
  price?: string;
  isSpecialOffer?: boolean;
  idea?: ChristmasIdea;
  isFavorite?: boolean;
}

export interface AdventDay {
  day: number;
  unlocked: boolean;
  content?: string;
  emoji?: string;
}
