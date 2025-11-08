import { useState, useEffect } from 'react';
import { supabase } from './useSupabase';

interface YouTubeChannelStats {
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
}

interface YouTubeVideo {
  id: string;
  title: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  publishedAt: string;
  thumbnailUrl: string;
  comments?: YouTubeComment[];
}

interface YouTubeComment {
  id: string;
  authorDisplayName: string;
  authorProfileImageUrl: string;
  textDisplay: string;
  publishedAt: string;
  likeCount: number;
}

interface YouTubeAPIData {
  channelStats: YouTubeChannelStats | null;
  recentVideos: YouTubeVideo[];
  loading: boolean;
  error: string | null;
  loadingComments: boolean;
}

export const useYouTubeAPI = () => {
  const [data, setData] = useState<YouTubeAPIData>({
    channelStats: null,
    recentVideos: [],
    loading: true,
    error: null,
    loadingComments: false,
  });

  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  useEffect(() => {
    const fetchYouTubeData = async () => {
      if (!supabase) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Supabase ist nicht konfiguriert'
        }));
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setData(prev => ({
            ...prev,
            loading: false,
            error: 'Nicht angemeldet'
          }));
          return;
        }

        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('company_id')
          .eq('id', user.id)
          .maybeSingle();

        if (!profileData?.company_id) {
          setData(prev => ({
            ...prev,
            loading: false,
            error: 'Kein Unternehmen zugeordnet'
          }));
          return;
        }

        const { data: companyData } = await supabase
          .from('companies')
          .select('youtube_channel_id')
          .eq('id', profileData.company_id)
          .maybeSingle();

        const CHANNEL_ID = companyData?.youtube_channel_id;

        if (!API_KEY || !CHANNEL_ID) {
          setData(prev => ({
            ...prev,
            loading: false,
            error: 'YouTube Kanal-ID nicht konfiguriert. Bitte in den Unternehmenseinstellungen konfigurieren.'
          }));
          return;
        }
        // Fetch channel statistics
        const channelResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${API_KEY}`
        );

        if (!channelResponse.ok) {
          throw new Error(`YouTube API Fehler: ${channelResponse.status}`);
        }

        const channelData = await channelResponse.json();

        if (!channelData.items || channelData.items.length === 0) {
          throw new Error('Kanal nicht gefunden. Bitte Kanal-ID überprüfen.');
        }

        const channelStats = channelData.items[0].statistics;

        // Fetch recent videos
        const searchResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=10&order=date&type=video&key=${API_KEY}`
        );

        if (!searchResponse.ok) {
          throw new Error(`YouTube API Fehler beim Laden der Videos: ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();
        const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

        // Fetch video statistics
        const videosResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${API_KEY}`
        );

        if (!videosResponse.ok) {
          throw new Error(`YouTube API Fehler beim Laden der Video-Statistiken: ${videosResponse.status}`);
        }

        const videosData = await videosResponse.json();

        const recentVideos = videosData.items.map((video: any) => ({
          id: video.id,
          title: video.snippet.title,
          viewCount: video.statistics.viewCount || '0',
          likeCount: video.statistics.likeCount || '0',
          commentCount: video.statistics.commentCount || '0',
          publishedAt: video.snippet.publishedAt,
          thumbnailUrl: video.snippet.thumbnails.medium.url,
          comments: [],
        }));

        setData({
          channelStats: {
            subscriberCount: channelStats.subscriberCount || '0',
            videoCount: channelStats.videoCount || '0',
            viewCount: channelStats.viewCount || '0',
          },
          recentVideos,
          loading: false,
          error: null,
          loadingComments: false,
        });

      } catch (error) {
        console.error('YouTube API Error:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unbekannter Fehler beim Laden der YouTube-Daten'
        }));
      }
    };

    fetchYouTubeData();
  }, [API_KEY]);

  const loadComments = async (videoId: string) => {
    if (!API_KEY) return;
    
    setData(prev => ({ ...prev, loadingComments: true }));
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=10&order=relevance&key=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Kommentare API Fehler: ${response.status}`);
      }
      
      const commentsData = await response.json();
      
      const comments = commentsData.items?.map((item: any) => ({
        id: item.id,
        authorDisplayName: item.snippet.topLevelComment.snippet.authorDisplayName,
        authorProfileImageUrl: item.snippet.topLevelComment.snippet.authorProfileImageUrl,
        textDisplay: item.snippet.topLevelComment.snippet.textDisplay,
        publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
        likeCount: item.snippet.topLevelComment.snippet.likeCount || 0,
      })) || [];
      
      setData(prev => ({
        ...prev,
        recentVideos: prev.recentVideos.map(video => 
          video.id === videoId ? { ...video, comments } : video
        ),
        loadingComments: false,
      }));
      
    } catch (error) {
      console.error('Error loading comments:', error);
      setData(prev => ({ ...prev, loadingComments: false }));
    }
  };

  const formatNumber = (numStr: string): string => {
    const num = parseInt(numStr);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE');
  };

  return {
    ...data,
    formatNumber,
    formatDate,
    loadComments,
    refreshData: () => {
      setData(prev => ({ ...prev, loading: true, error: null }));
      // Trigger useEffect by updating a dependency
    }
  };
};