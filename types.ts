export enum PersonaMode {
  PROFESSIONAL = 'Professional',
  CASUAL = 'Casual',
  EMPATHETIC = 'Empathetic',
  HUMOROUS = 'Humorous',
  MOTIVATIONAL = 'Motivational'
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  thinking?: boolean;
}

export interface DetailedMetrics {
  accuracy: number;
  empathy: number;
  speed: number;
  creativity: number;
  relevance: number;
  humor: number;
  proactivity: number;
  clarity: number;
  engagement: number;
  ethicalAlignment: number;
  memoryUsage: number;
  anticipation: number;
}

export interface IntegrationStatus {
  google: boolean;
  grok: boolean;
  github: boolean;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  isPlaying: boolean;
}

export interface GrowthEntry {
  id: string;
  type: 'learning' | 'upgrade' | 'audit' | 'proposal';
  title: string;
  timestamp: number;
  details: string;
}
