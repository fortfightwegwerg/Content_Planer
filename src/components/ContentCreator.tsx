import React, { useState } from 'react';
import { X, Image, Video, Hash, Calendar, Clock, Users } from 'lucide-react';
import { useContentPosts } from '../hooks/useContentPosts';

interface ContentCreatorProps {
  onClose: () => void;
}

const ContentCreator: React.FC<ContentCreatorProps> = ({ onClose }) => {
  const { createPost, loading } = useContentPosts();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    platform: 'instagram',
    hashtags: '',
    scheduledDate: '',
  });

  const platforms = [
    { id: 'instagram', name: 'Instagram', color: 'bg-pink-500' },
    { id: 'tiktok', name: 'TikTok', color: 'bg-black' },
    { id: 'youtube', name: 'YouTube', color: 'bg-red-600' },
    { id: 'youtube-shorts', name: 'YouTube Shorts', color: 'bg-red-500' },
  ];

  const categories = [
    'Marketing', 'Produktnews', 'Behind the Scenes', 'Kundenstories', 'Educational', 'Entertainment'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      alert('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    try {
      await createPost({
        ...formData,
        category: 'general',
        scheduledTime: '12:00',
        assignee: 'myself',
        status: 'scheduled'
      });
      onClose();
    } catch (error: any) {
      console.error('Error creating content:', error);
      const errorMessage = error?.message || 'Unbekannter Fehler';
      alert(`Fehler beim Erstellen des Contents: ${errorMessage}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Neuen Content erstellen</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titel
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Content-Titel eingeben..."
              required
            />
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plattform
            </label>
            <div className="grid grid-cols-3 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, platform: platform.id })}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                    formData.platform === platform.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
                  <span className="text-sm font-medium">{platform.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Beschreibung */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beschreibung
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Beschreibung des Contents..."
              required
            />
          </div>

          {/* Datum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Datum
            </label>
            <input
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="inline w-4 h-4 mr-1" />
              Hashtags
            </label>
            <input
              type="text"
              value={formData.hashtags}
              onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="#marketing #socialmedia #content"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={loading}
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!formData.title || !formData.content) {
                  alert('Bitte füllen Sie alle Pflichtfelder aus.');
                  return;
                }

                try {
                  await createPost({
                    ...formData,
                    category: 'general',
                    scheduledTime: '12:00',
                    assignee: 'myself',
                    status: 'draft'
                  });
                  onClose();
                } catch (error: any) {
                  console.error('Error creating draft:', error);
                  const errorMessage = error?.message || 'Unbekannter Fehler';
                  alert(`Fehler beim Speichern des Entwurfs: ${errorMessage}`);
                }
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
              disabled={loading}
            >
              {loading ? 'Wird gespeichert...' : 'Als Entwurf speichern'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              disabled={loading}
            >
              {loading ? 'Wird geplant...' : 'Content planen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentCreator;