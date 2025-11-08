import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Search, 
  Filter, 
  Bell, 
  Hash, 
  BarChart3, 
  Globe, 
  Calendar,
  AlertCircle,
  RefreshCw,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Settings
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

interface Trend {
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

interface TrendData {
  date: string;
  volume: number;
  engagement: number;
}

const TrendAnalyzer: React.FC = () => {
  const [selectedNiche, setSelectedNiche] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [trends, setTrends] = useState<Trend[]>([]);
  const [filteredTrends, setFilteredTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<Trend[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);

  const sampleTrends: Trend[] = [];

  const trendHistoryData: TrendData[] = [];

  const platforms = [
    { id: 'all', name: 'Alle Plattformen', color: 'bg-gray-500', icon: Globe },
    { id: 'tiktok', name: 'TikTok', color: 'bg-black', icon: TrendingUp },
    { id: 'instagram', name: 'Instagram', color: 'bg-pink-500', icon: Heart },
    { id: 'twitter', name: 'Twitter/X', color: 'bg-blue-500', icon: MessageCircle },
    { id: 'youtube', name: 'YouTube', color: 'bg-red-600', icon: Eye },
    { id: 'google', name: 'Google Trends', color: 'bg-green-500', icon: Search }
  ];

  const categories = [
    'Alle Kategorien', 'Fitness', 'Fashion', 'Technology', 'Food', 'Travel', 
    'Beauty', 'Gaming', 'Music', 'Education', 'Business', 'Wellness'
  ];

  const timeframes = [
    { id: '24h', name: 'Letzte 24h' },
    { id: '7d', name: 'Letzte 7 Tage' },
    { id: '30d', name: 'Letzte 30 Tage' },
    { id: '90d', name: 'Letzte 3 Monate' }
  ];

  useEffect(() => {
    setTrends(sampleTrends);
    setFilteredTrends(sampleTrends);
    setAlerts([]);
  }, []);

  useEffect(() => {
    let filtered = trends;

    // Filter by niche/category
    if (selectedNiche) {
      filtered = filtered.filter(trend => 
        trend.category.toLowerCase().includes(selectedNiche.toLowerCase()) ||
        trend.keyword.toLowerCase().includes(selectedNiche.toLowerCase()) ||
        trend.hashtags.some(tag => tag.toLowerCase().includes(selectedNiche.toLowerCase()))
      );
    }

    // Filter by platform
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(trend => trend.platform === selectedPlatform);
    }

    setFilteredTrends(filtered);
  }, [selectedNiche, selectedPlatform, trends]);

  const handleRefreshTrends = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // In real implementation, fetch new data from APIs
    }, 2000);
  };

  const getPlatformIcon = (platform: string) => {
    const platformData = platforms.find(p => p.id === platform);
    const Icon = platformData?.icon || Globe;
    return <Icon size={16} />;
  };

  const getPlatformColor = (platform: string) => {
    const platformData = platforms.find(p => p.id === platform);
    return platformData?.color || 'bg-gray-500';
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  // Platform distribution data for pie chart
  const platformDistribution = platforms.slice(1).map((platform, index) => ({
    name: platform.name,
    value: filteredTrends.filter(t => t.platform === platform.id).length,
    color: COLORS[index % COLORS.length]
  })).filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
            Trend Analyzer
          </h2>
          <p className="text-gray-600 mt-1">Entdecken Sie die neuesten Social Media Trends für Ihre Nische</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Bell size={20} />
            Alerts
            {alerts.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </button>
          <button
            onClick={handleRefreshTrends}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Aktualisieren...' : 'Trends aktualisieren'}
          </button>
        </div>
      </div>

      {/* Alerts Panel */}
      {showAlerts && alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-yellow-600" size={20} />
            <h3 className="text-lg font-semibold text-yellow-800">Neue Trend-Alerts</h3>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-white rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{alert.keyword}</h4>
                    <p className="text-sm text-gray-600">
                      {alert.platform.toUpperCase()} • +{alert.growth.toFixed(1)}% Wachstum
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">+{alert.growth.toFixed(1)}%</p>
                    <p className="text-sm text-gray-500">{formatNumber(alert.volume)} Mentions</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Niche Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nische/Kategorie
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={selectedNiche}
                onChange={(e) => setSelectedNiche(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="z.B. Fitness, Fashion..."
              />
            </div>
          </div>

          {/* Platform Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plattform
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {platforms.map(platform => (
                <option key={platform.id} value={platform.id}>{platform.name}</option>
              ))}
            </select>
          </div>

          {/* Timeframe Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zeitraum
            </label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timeframes.map(timeframe => (
                <option key={timeframe.id} value={timeframe.id}>{timeframe.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategorie
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{filteredTrends.length}</p>
              <p className="text-sm text-gray-600">Aktive Trends</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <BarChart3 className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredTrends.length > 0 ? 
                  `+${(filteredTrends.reduce((sum, t) => sum + t.growth, 0) / filteredTrends.length).toFixed(1)}%` : 
                  '0%'
                }
              </p>
              <p className="text-sm text-gray-600">Ø Wachstum</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Hash className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredTrends.reduce((sum, t) => sum + t.hashtags.length, 0)}
              </p>
              <p className="text-sm text-gray-600">Hashtags</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <Bell className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
              <p className="text-sm text-gray-600">Neue Alerts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend History Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Verlauf</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendHistoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(parseISO(value), 'dd.MM', { locale: de })}
              />
              <YAxis tickFormatter={formatNumber} />
              <Tooltip 
                labelFormatter={(value) => format(parseISO(value as string), 'dd. MMMM yyyy', { locale: de })}
                formatter={(value: number, name: string) => [formatNumber(value), name === 'volume' ? 'Volumen' : 'Engagement']}
              />
              <Line 
                type="monotone" 
                dataKey="volume" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="volume"
              />
              <Line 
                type="monotone" 
                dataKey="engagement" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="engagement"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plattform Verteilung</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={platformDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {platformDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trends List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Trends</h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredTrends.length} Trends gefunden
            {selectedNiche && ` für "${selectedNiche}"`}
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredTrends.map((trend, index) => (
            <div key={trend.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-400">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{trend.keyword}</h4>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs ${getPlatformColor(trend.platform)}`}>
                        {getPlatformIcon(trend.platform)}
                        {trend.platform.toUpperCase()}
                      </div>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {trend.category}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        {formatNumber(trend.volume)} Views
                      </div>
                      {trend.engagement && (
                        <>
                          <div className="flex items-center gap-1">
                            <Heart size={14} />
                            {formatNumber(trend.engagement.likes)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle size={14} />
                            {formatNumber(trend.engagement.comments)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Share size={14} />
                            {formatNumber(trend.engagement.shares)}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {trend.hashtags.map((hashtag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-2xl font-bold ${trend.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend.growth > 0 ? '+' : ''}{trend.growth.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Wachstum</div>
                  <div className="mt-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${trend.relevanceScore}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {trend.relevanceScore}% Relevanz
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTrends.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Trends gefunden</h3>
            <p className="text-gray-600 mb-4">
              {selectedNiche 
                ? `Keine Trends für "${selectedNiche}" gefunden. Versuchen Sie andere Suchbegriffe.`
                : 'Passen Sie Ihre Filter an oder aktualisieren Sie die Trends.'
              }
            </p>
            <button
              onClick={handleRefreshTrends}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <RefreshCw size={16} />
              Trends aktualisieren
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendAnalyzer;