import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Edit3, Trash2 } from 'lucide-react';
import { useContentPosts } from '../hooks/useContentPosts';
import { format, parseISO } from 'date-fns';

interface ContentCalendarProps {
  onCreateContent: () => void;
}

const ContentCalendar: React.FC<ContentCalendarProps> = ({ onCreateContent }) => {
  const { posts, loading, updatePost, deletePost } = useContentPosts();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingPost, setEditingPost] = useState<any>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [newDate, setNewDate] = useState('');

  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  const postsForCurrentMonth = useMemo(() => {
    return posts.filter(post => {
      if (!post.scheduled_date) return false;
      const postDate = parseISO(post.scheduled_date);
      return postDate.getMonth() === currentDate.getMonth() &&
             postDate.getFullYear() === currentDate.getFullYear();
    });
  }, [posts, currentDate]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert to Monday = 0

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Möchten Sie diesen Content wirklich löschen?')) {
      try {
        await deletePost(postId);
      } catch (error) {
        alert('Fehler beim Löschen des Contents');
      }
    }
  };

  const handleMovePost = (post: any) => {
    setSelectedPost(post);
    setNewDate(post.scheduled_date ? format(parseISO(post.scheduled_date), 'yyyy-MM-dd') : '');
    setShowMoveModal(true);
  };

  const confirmMovePost = async () => {
    if (selectedPost && newDate) {
      try {
        await updatePost(selectedPost.id, { scheduled_date: newDate });
        setShowMoveModal(false);
        setSelectedPost(null);
        setNewDate('');
      } catch (error) {
        alert('Fehler beim Verschieben des Contents');
      }
    }
  };

  const getPostsForDay = (day: number) => {
    return postsForCurrentMonth.filter(post => {
      if (!post.scheduled_date) return false;
      const postDate = parseISO(post.scheduled_date);
      return postDate.getDate() === day;
    });
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      'Instagram': 'bg-pink-100 text-pink-700',
      'Facebook': 'bg-blue-100 text-blue-700',
      'Twitter': 'bg-sky-100 text-sky-700',
      'LinkedIn': 'bg-indigo-100 text-indigo-700',
      'TikTok': 'bg-gray-900 text-white',
      'YouTube': 'bg-red-100 text-red-700',
    };
    return colors[platform] || 'bg-gray-100 text-gray-700';
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weekdays.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const posts = day ? getPostsForDay(day) : [];
            const isToday = day === new Date().getDate() && 
                           currentDate.getMonth() === new Date().getMonth() && 
                           currentDate.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={index}
                className={`min-h-24 p-2 border border-gray-100 rounded-lg ${
                  day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                } transition-colors`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-2 ${
                      isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {day}
                      {isToday && <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>}
                    </div>
                    <div className="space-y-1">
                      {posts.map((post) => (
                        <div key={post.id} className={`text-xs px-2 py-1 rounded ${getPlatformColor(post.platform)} group relative hover:shadow-sm transition-shadow`}>
                          <div className="flex items-center justify-between">
                            <span className="truncate flex-1" title={post.title}>{post.title}</span>
                            <div className="opacity-0 group-hover:opacity-100 flex gap-1 ml-1 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMovePost(post);
                                }}
                                className="p-0.5 hover:bg-white hover:bg-opacity-50 rounded"
                                title="Verschieben"
                              >
                                <Edit3 size={10} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePost(post.id);
                                }}
                                className="p-0.5 hover:bg-red-200 rounded"
                                title="Löschen"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {posts.length === 0 && (
                        <button
                          onClick={onCreateContent}
                          className="w-full text-xs text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          + Content hinzufügen
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Move Post Modal */}
      {showMoveModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Content verschieben</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Content: <strong>{selectedPost.title}</strong></p>
                <p className="text-sm text-gray-600">Plattform: <strong>{selectedPost.platform}</strong></p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Neues Datum wählen
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowMoveModal(false);
                    setSelectedPost(null);
                    setNewDate('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={confirmMovePost}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Verschieben
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCalendar;