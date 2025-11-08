import React from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, TrendingUp, Users } from 'lucide-react';
import { useContentPosts } from '../hooks/useContentPosts';
import { format } from 'date-fns';

interface DashboardProps {
  onCreateContent: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onCreateContent }) => {
  const { posts, loading } = useContentPosts();

  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const draftCount = posts.filter(p => p.status === 'draft').length;
  const approvedCount = posts.filter(p => p.status === 'approved').length;
  const pendingCount = posts.filter(p => p.status === 'pending').length;

  const stats = [
    { label: 'Geplante Posts', value: scheduledCount.toString(), icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Entwürfe', value: draftCount.toString(), icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Veröffentlicht', value: approvedCount.toString(), icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Zur Freigabe', value: pendingCount.toString(), icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const recentContent = posts.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-50';
      case 'draft': return 'text-yellow-600 bg-yellow-50';
      case 'approved': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Geplant';
      case 'draft': return 'Entwurf';
      case 'approved': return 'Freigegeben';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <Icon className={stat.color} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Schnellaktionen</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={onCreateContent}
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-blue-600" size={20} />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Post planen</p>
              <p className="text-sm text-gray-600">Neuen Content erstellen</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Trends analysieren</p>
              <p className="text-sm text-gray-600">Performance überprüfen</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="text-green-600" size={20} />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Team einladen</p>
              <p className="text-sm text-gray-600">Mitarbeiter hinzufügen</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Content */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktuelle Inhalte</h3>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Lädt...</p>
          </div>
        ) : recentContent.length > 0 ? (
          <div className="space-y-4">
            {recentContent.map((content) => (
              <div key={content.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{content.title}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-600">{content.platform}</span>
                    {content.scheduled_date && (
                      <span className="text-sm text-gray-600">
                        {format(new Date(content.scheduled_date), 'dd.MM.yyyy')}
                      </span>
                    )}
                    <span className="text-sm text-gray-600">{content.assignee}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
                  {getStatusText(content.status)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Noch keine Inhalte vorhanden</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;