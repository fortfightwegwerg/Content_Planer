import React from 'react';
import { TrendingUp, TrendingDown, Eye, MessageCircle, Youtube, ThumbsUp, UserPlus, RefreshCw, AlertCircle, Play, ChevronDown, ChevronUp, User, Heart } from 'lucide-react';
import { useState } from 'react';
import { useYouTubeAPI } from '../hooks/useYouTubeAPI';

const Analytics: React.FC = () => {
  const { channelStats, recentVideos, loading, error, formatNumber, formatDate, refreshData, loadComments, loadingComments } = useYouTubeAPI();
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  
  const YOUTUBE_CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

  const handleToggleComments = async (videoId: string) => {
    if (expandedVideo === videoId) {
      setExpandedVideo(null);
    } else {
      setExpandedVideo(videoId);
      const video = recentVideos.find(v => v.id === videoId);
      if (video && (!video.comments || video.comments.length === 0)) {
        await loadComments(videoId);
      }
    }
  };

  // Calculate total likes and comments from recent videos
  const totalLikes = recentVideos.reduce((sum, video) => sum + parseInt(video.likeCount), 0);
  const totalComments = recentVideos.reduce((sum, video) => sum + parseInt(video.commentCount), 0);

  const metrics = channelStats ? [
    {
      label: 'YouTube Aufrufe',
      value: formatNumber(channelStats.viewCount),
      change: 'Live Daten',
      trend: 'up',
      icon: Eye,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'YouTube Abonnenten',
      value: formatNumber(channelStats.subscriberCount),
      change: 'Live Daten',
      trend: 'up',
      icon: UserPlus,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    {
      label: 'Videos',
      value: formatNumber(channelStats.videoCount),
      change: 'Gesamt',
      trend: 'up',
      icon: Play,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Kommentare',
      value: formatNumber(totalComments.toString()),
      change: 'Letzte Videos',
      trend: 'up',
      icon: MessageCircle,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
  ] : [];

  const platformData = [
    { 
      platform: 'YouTube', 
      posts: channelStats?.videoCount || '0', 
      reach: formatNumber(channelStats?.viewCount || '0'), 
      engagement: '8.7%', 
      color: 'bg-red-600',
      live: true
    },
  ];


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600 mt-1">Live-Daten von Ihren Social Media Kanälen</p>
        </div>
        <button
          onClick={refreshData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Daten aktualisieren
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle size={20} />
            <h3 className="font-semibold">YouTube API Fehler</h3>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
          <div className="mt-3 p-3 bg-red-100 rounded-lg">
            <p className="text-sm text-red-800 font-medium">Setup-Anleitung:</p>
            <ol className="text-sm text-red-700 mt-2 space-y-1 list-decimal list-inside">
              <li>Gehen Sie zur <a href="https://console.developers.google.com/" target="_blank" className="underline">Google Cloud Console</a></li>
              <li>Erstellen Sie ein neues Projekt oder wählen Sie ein bestehendes</li>
              <li>Aktivieren Sie die "YouTube Data API v3"</li>
              <li>Erstellen Sie einen API-Schlüssel</li>
              <li>Fügen Sie den Schlüssel in die .env Datei als VITE_YOUTUBE_API_KEY ein</li>
            </ol>
          </div>
        </div>
      )}

      {/* Metrics Overview */}
      <div className="space-y-6">
        {/* YouTube Metrics */}
        {channelStats && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Youtube className="text-red-600" size={20} />
              YouTube Metriken
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="w-16 h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="w-16 h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))
              ) : (
                metrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div key={metric.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`${metric.bg} p-3 rounded-lg`}>
                          <Icon className={metric.color} size={24} />
                        </div>
                        <div className="text-green-600">
                          <span className="text-xs font-medium">{metric.change}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                        <p className="text-sm text-gray-600">{metric.label}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Platform Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Platform Performance</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Youtube size={16} className="text-red-600" />
              <span>Nur YouTube</span>
            </div>
          </div>
          <div className="space-y-4">
            {platformData.map((platform) => {
              const isLive = platform.live;
              return (
              <div key={platform.platform} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
                  <span className={`font-medium ${isLive ? 'text-blue-600' : 'text-gray-900'}`}>
                    {platform.platform}
                    <span className="text-xs ml-2 text-blue-500">(Live Daten)</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-6 text-right">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{platform.posts}</p>
                    <p className="text-xs text-gray-600">{platform.platform === 'YouTube' || platform.platform === 'TikTok' ? 'Videos' : 'Posts'}</p>
                    <p className="text-xs text-gray-600">Videos</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{platform.reach}</p>
                    <p className="text-xs text-gray-600">Reichweite</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{platform.engagement}</p>
                    <p className="text-xs text-gray-600">Engagement</p>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Weekly Performance Chart Placeholder */}
      <div className="grid grid-cols-1 gap-6">
        {/* YouTube Videos */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Youtube className="text-red-600" size={20} />
              YouTube Videos
            </h3>
            <div className="text-sm text-gray-500">Kanal: {YOUTUBE_CHANNEL_ID}</div>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                  <div className="w-16 h-12 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                    <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentVideos.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentVideos.map((video) => (
                <div key={video.id} className="bg-gray-50 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-4 p-4 hover:bg-gray-100 transition-colors">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 leading-tight">{video.title}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>{formatNumber(video.viewCount)} Aufrufe</span>
                        <span>{formatNumber(video.likeCount)} Likes</span>
                        <button
                          onClick={() => handleToggleComments(video.id)}
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                        >
                          <MessageCircle size={14} />
                          {formatNumber(video.commentCount)} Kommentare
                          {expandedVideo === video.id ? 
                            <ChevronUp size={14} /> : 
                            <ChevronDown size={14} />
                          }
                        </button>
                        <span>{formatDate(video.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Comments Section */}
                  {expandedVideo === video.id && (
                    <div className="border-t border-gray-200 p-4 bg-white">
                      <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <MessageCircle size={16} />
                        Kommentare
                      </h5>
                      
                      {loadingComments ? (
                        <div className="space-y-3">
                          {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="flex gap-3 animate-pulse">
                              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                              <div className="flex-1 space-y-2">
                                <div className="w-1/4 h-3 bg-gray-200 rounded"></div>
                                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : video.comments && video.comments.length > 0 ? (
                        <div className="space-y-4 max-h-64 overflow-y-auto">
                          {video.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <img
                                src={comment.authorProfileImageUrl}
                                alt={comment.authorDisplayName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h6 className="font-medium text-sm text-gray-900">
                                    {comment.authorDisplayName}
                                  </h6>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(comment.publishedAt)}
                                  </span>
                                  {comment.likeCount > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <Heart size={12} />
                                      {comment.likeCount}
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {comment.textDisplay}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <MessageCircle size={24} className="mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">Keine Kommentare verfügbar</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Youtube size={48} className="mx-auto mb-2 text-gray-300" />
              <p>Keine YouTube-Videos verfügbar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;