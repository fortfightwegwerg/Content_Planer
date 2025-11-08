export interface Trend {
  id: string;
  keyword: string;
  platform: 'tiktok' | 'instagram' | 'twitter' | 'google' | 'youtube' | 'reddit';
  volume: number;
  growth: number;
  category: string;
  hashtags: string[];
  timestamp: Date;
  relevanceScore: number;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
  };
  metadata?: {
    location?: string;
    ageGroup?: string;
    gender?: string;
    language?: string;
  };
}

export interface TrendAlert {
  id: string;
  trend: Trend;
  threshold: number;
  triggered: Date;
  read: boolean;
  type: 'growth' | 'volume' | 'relevance';
}

export interface TrendHistory {
  trendId: string;
  date: Date;
  volume: number;
  growth: number;
  engagement: number;
}

export interface TrendFilter {
  niche?: string;
  platforms?: string[];
  timeframe?: '24h' | '7d' | '30d' | '90d';
  category?: string;
  minGrowth?: number;
  minVolume?: number;
  location?: string;
}

export interface TrendAnalytics {
  totalTrends: number;
  averageGrowth: number;
  topPlatform: string;
  topCategory: string;
  alertCount: number;
  lastUpdated: Date;
}