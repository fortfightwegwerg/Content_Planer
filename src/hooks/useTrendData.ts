import { useState, useEffect } from 'react';

export interface TrendData {
  id: string;
  keyword: string;
  platform: 'tiktok' | 'instagram' | 'twitter' | 'google' | 'youtube';
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
  };
}

export interface TrendAlert {
  id: string;
  trend: TrendData;
  threshold: number;
  triggered: Date;
  read: boolean;
}

// Mock API functions - replace with real API calls
const mockFetchGoogleTrends = async (niche?: string): Promise<TrendData[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    {
      id: 'google-1',
      keyword: 'AI Fitness Apps',
      platform: 'google',
      volume: 3200000,
      growth: 156.7,
      category: niche || 'Fitness',
      hashtags: ['#AIFitness', '#FitnessApp', '#HealthTech'],
      timestamp: new Date(),
      relevanceScore: 94
    }
  ];
};

const mockFetchTwitterTrends = async (niche?: string): Promise<TrendData[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [
    {
      id: 'twitter-1',
      keyword: 'Sustainable Living',
      platform: 'twitter',
      volume: 850000,
      growth: 78.3,
      category: niche || 'Lifestyle',
      hashtags: ['#SustainableLiving', '#EcoFriendly', '#GreenLife'],
      timestamp: new Date(),
      relevanceScore: 87,
      engagement: { likes: 45000, comments: 3200, shares: 7800 }
    }
  ];
};

const mockFetchInstagramTrends = async (niche?: string): Promise<TrendData[]> => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  return [
    {
      id: 'instagram-1',
      keyword: 'Minimalist Fashion',
      platform: 'instagram',
      volume: 1800000,
      growth: 92.1,
      category: niche || 'Fashion',
      hashtags: ['#MinimalistFashion', '#SlowFashion', '#CapsuleWardrobe'],
      timestamp: new Date(),
      relevanceScore: 89,
      engagement: { likes: 125000, comments: 8500, shares: 15000 }
    }
  ];
};

const mockFetchTikTokTrends = async (niche?: string): Promise<TrendData[]> => {
  await new Promise(resolve => setTimeout(resolve, 900));
  
  return [
    {
      id: 'tiktok-1',
      keyword: 'Home Workout Challenges',
      platform: 'tiktok',
      volume: 2500000,
      growth: 134.5,
      category: niche || 'Fitness',
      hashtags: ['#HomeWorkout', '#FitnessChallenge', '#WorkoutMotivation'],
      timestamp: new Date(),
      relevanceScore: 96,
      engagement: { likes: 180000, comments: 12000, shares: 25000 }
    }
  ];
};

const mockFetchYouTubeTrends = async (niche?: string): Promise<TrendData[]> => {
  await new Promise(resolve => setTimeout(resolve, 1100));
  
  return [
    {
      id: 'youtube-1',
      keyword: 'Productivity Hacks',
      platform: 'youtube',
      volume: 1200000,
      growth: 67.8,
      category: niche || 'Productivity',
      hashtags: ['#ProductivityHacks', '#TimeManagement', '#LifeHacks'],
      timestamp: new Date(),
      relevanceScore: 82,
      engagement: { likes: 78000, comments: 4500, shares: 9500 }
    }
  ];
};

export const useTrendData = () => {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<TrendAlert[]>([]);

  const fetchTrends = async (niche?: string, platforms?: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const promises: Promise<TrendData[]>[] = [];

      if (!platforms || platforms.includes('google')) {
        promises.push(mockFetchGoogleTrends(niche));
      }
      if (!platforms || platforms.includes('twitter')) {
        promises.push(mockFetchTwitterTrends(niche));
      }
      if (!platforms || platforms.includes('instagram')) {
        promises.push(mockFetchInstagramTrends(niche));
      }
      if (!platforms || platforms.includes('tiktok')) {
        promises.push(mockFetchTikTokTrends(niche));
      }
      if (!platforms || platforms.includes('youtube')) {
        promises.push(mockFetchYouTubeTrends(niche));
      }

      const results = await Promise.all(promises);
      const allTrends = results.flat();
      
      // Sort by relevance score and growth
      const sortedTrends = allTrends.sort((a, b) => {
        const scoreA = a.relevanceScore * 0.6 + (a.growth / 100) * 0.4;
        const scoreB = b.relevanceScore * 0.6 + (b.growth / 100) * 0.4;
        return scoreB - scoreA;
      });

      setTrends(sortedTrends);

      // Check for new alerts (trends with high growth)
      const newAlerts = sortedTrends
        .filter(trend => trend.growth > 100)
        .map(trend => ({
          id: `alert-${trend.id}`,
          trend,
          threshold: 100,
          triggered: new Date(),
          read: false
        }));

      setAlerts(prev => [...prev, ...newAlerts]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Trends');
    } finally {
      setLoading(false);
    }
  };

  const markAlertAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  return {
    trends,
    loading,
    error,
    alerts: alerts.filter(alert => !alert.read),
    fetchTrends,
    markAlertAsRead,
    clearAlerts
  };
};

// Real API integration examples (commented out - replace mock functions above)

/*
// Google Trends API (using unofficial library)
const fetchGoogleTrends = async (keyword: string): Promise<TrendData[]> => {
  try {
    const response = await fetch(`/api/google-trends?keyword=${encodeURIComponent(keyword)}`);
    const data = await response.json();
    
    return data.map((item: any) => ({
      id: `google-${item.query}`,
      keyword: item.query,
      platform: 'google',
      volume: item.value,
      growth: item.growth || 0,
      category: keyword,
      hashtags: [],
      timestamp: new Date(),
      relevanceScore: item.relevance || 50
    }));
  } catch (error) {
    console.error('Google Trends API error:', error);
    return [];
  }
};

// Twitter API v2
const fetchTwitterTrends = async (location: string = 'worldwide'): Promise<TrendData[]> => {
  try {
    const response = await fetch(`/api/twitter-trends?location=${location}`, {
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
      }
    });
    const data = await response.json();
    
    return data.trends.map((trend: any) => ({
      id: `twitter-${trend.name}`,
      keyword: trend.name,
      platform: 'twitter',
      volume: trend.tweet_volume || 0,
      growth: 0, // Calculate based on historical data
      category: 'General',
      hashtags: [trend.name],
      timestamp: new Date(),
      relevanceScore: 75
    }));
  } catch (error) {
    console.error('Twitter API error:', error);
    return [];
  }
};

// YouTube Data API
const fetchYouTubeTrends = async (category?: string): Promise<TrendData[]> => {
  try {
    const response = await fetch(`/api/youtube-trends?category=${category || 'all'}`, {
      headers: {
        'Authorization': `Bearer ${process.env.YOUTUBE_API_KEY}`
      }
    });
    const data = await response.json();
    
    return data.items.map((video: any) => ({
      id: `youtube-${video.id}`,
      keyword: video.snippet.title,
      platform: 'youtube',
      volume: parseInt(video.statistics.viewCount),
      growth: 0, // Calculate based on view growth
      category: video.snippet.categoryId,
      hashtags: video.snippet.tags || [],
      timestamp: new Date(video.snippet.publishedAt),
      relevanceScore: 80,
      engagement: {
        likes: parseInt(video.statistics.likeCount),
        comments: parseInt(video.statistics.commentCount),
        shares: 0
      }
    }));
  } catch (error) {
    console.error('YouTube API error:', error);
    return [];
  }
};
*/