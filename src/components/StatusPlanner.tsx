import React, { useState } from 'react';
import { MoreVertical, Plus, Trash2, FileText, X, Paperclip, Calendar, User, Clock, AlertCircle } from 'lucide-react';
import { useContentPosts } from '../hooks/useContentPosts';
import { format, parseISO, isPast } from 'date-fns';

const StatusPlanner: React.FC = () => {
  const { posts, loading, updatePost, deletePost } = useContentPosts();

  const statuses = [
    { id: 'draft', name: 'Entwurf', color: 'bg-gray-50', textColor: 'text-gray-700', headerBg: 'bg-gray-100' },
    { id: 'scheduled', name: 'Geplant', color: 'bg-blue-50', textColor: 'text-blue-700', headerBg: 'bg-blue-100' },
    { id: 'pending', name: 'Zur Freigabe', color: 'bg-yellow-50', textColor: 'text-yellow-700', headerBg: 'bg-yellow-100' },
    { id: 'approved', name: 'Freigegeben', color: 'bg-green-50', textColor: 'text-green-700', headerBg: 'bg-green-100' },
    { id: 'published', name: 'Veröffentlicht', color: 'bg-purple-50', textColor: 'text-purple-700', headerBg: 'bg-purple-100' },
  ];

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

  const deleteContent = async (contentId: string) => {
    if (window.confirm('Möchten Sie diesen Content wirklich löschen?')) {
      try {
        await deletePost(contentId);
        setActiveDropdown(null);
      } catch (error) {
        alert('Fehler beim Löschen');
      }
    }
  };

  const getItemsForStatus = (statusId: string) => {
    return posts.filter(post => post.status === statusId);
  };

  const isOverdue = (scheduledDate: string | null) => {
    if (!scheduledDate) return false;
    return isPast(parseISO(scheduledDate));
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

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, item: any) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStatus(statusId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverStatus(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();

    if (draggedItem && draggedItem.status !== newStatus) {
      try {
        await updatePost(draggedItem.id, { status: newStatus });
      } catch (error) {
        alert('Fehler beim Verschieben');
      }
    }

    setDraggedItem(null);
    setDragOverStatus(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverStatus(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Status Planer</h2>
          <p className="text-gray-600 mt-1">Verwalten Sie Ihren Content-Workflow</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={20} />
          Neuer Content
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
              <p className="text-sm text-gray-600">Gesamt</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {posts.filter(post => ['scheduled', 'pending'].includes(post.status)).length}
              </p>
              <p className="text-sm text-gray-600">In Bearbeitung</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {posts.filter(post => isOverdue(post.scheduled_date) && post.status !== 'published').length}
              </p>
              <p className="text-sm text-gray-600">Überfällig</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Plus className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {posts.filter(post => post.status === 'published').length}
              </p>
              <p className="text-sm text-gray-600">Veröffentlicht</p>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 min-h-[700px]">
        {statuses.map((status) => {
          const items = getItemsForStatus(status.id);
          const isDragOver = dragOverStatus === status.id;
          
          return (
            <div key={status.id} className="flex flex-col">
              {/* Column Header */}
              <div className={`${status.headerBg} px-4 py-3 rounded-lg mb-4 border border-gray-200`}>
                <h3 className={`font-semibold text-center ${status.textColor}`}>{status.name}</h3>
                <p className="text-xs text-center text-gray-600 mt-1">{items.length} Items</p>
              </div>

              {/* Drop Zone */}
              <div
                className={`flex-1 space-y-3 p-3 rounded-lg border-2 border-dashed transition-all min-h-96 ${
                  isDragOver 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
                onDragOver={(e) => handleDragOver(e, status.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status.id)}
              >
                {/* Content Items */}
                {items.map((item) => {
                  const overdue = isOverdue(item.scheduled_date) && status.id !== 'published';
                  
                  return (
                    <div
                      key={item.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all group cursor-move border ${
                        overdue ? 'border-red-300' : 'border-gray-200'
                      } ${
                        draggedItem?.id === item.id ? 'opacity-60 rotate-2 scale-105' : ''
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPlatformColor(item.platform)}`}>
                            {item.platform}
                          </span>
                          {overdue && (
                            <div className="flex items-center gap-1 text-red-600">
                              <AlertCircle size={12} />
                              <span className="text-xs">Überfällig</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === item.id ? null : item.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
                          >
                            <MoreVertical size={14} />
                          </button>

                          {/* Dropdown Menu */}
                          {activeDropdown === item.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-48">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteContent(item.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 transition-colors text-left"
                              >
                                <Trash2 size={14} />
                                Löschen
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content Title & Description */}
                      <div className="mb-3">
                        <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.content}
                        </p>
                      </div>

                      {/* Category & Assignee */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {item.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User size={14} />
                          <span>{item.assignee}</span>
                        </div>
                        {item.scheduled_date && (
                          <div className={`flex items-center gap-2 text-sm ${overdue ? 'text-red-600' : 'text-gray-600'}`}>
                            <Calendar size={14} />
                            <span>{format(parseISO(item.scheduled_date), 'dd.MM.yyyy')}</span>
                          </div>
                        )}
                      </div>

                      {/* Hashtags */}
                      {item.hashtags && (
                        <div className="border-t border-gray-100 pt-3">
                          <p className="text-xs text-gray-500 line-clamp-2">{item.hashtags}</p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add New Item Button */}
                <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors">
                  <div className="flex flex-col items-center gap-2">
                    <Plus size={20} />
                    <span className="text-sm">Content hinzufügen</span>
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusPlanner;