import React, { useState, useEffect } from 'react';
import { X, Plus, Save, FileText } from 'lucide-react';

interface ScriptCreatorProps {
  onClose: () => void;
  prefilledIdea?: any;
}

const ScriptCreator: React.FC<ScriptCreatorProps> = ({ onClose, prefilledIdea }) => {
  const [formData, setFormData] = useState({
    content: '',
    title: '',
    shots: [] as { type: 'image' | 'video', description: string }[],
    platform: 'instagram',
    category: 'marketing',
    duration: '30s',
    tags: ''
  });

  const platforms = [
    { id: 'instagram', name: 'Instagram', color: 'bg-pink-500' },
    { id: 'tiktok', name: 'TikTok', color: 'bg-black' },
    { id: 'youtube', name: 'YouTube', color: 'bg-red-600' },
    { id: 'youtube-shorts', name: 'YouTube Shorts', color: 'bg-red-500' }
  ];

  const categories = [
    'Marketing', 'Tutorial', 'Behind the Scenes', 'Produktreview', 'Educational', 'Entertainment'
  ];

  const durations = ['15s', '30s', '60s', '90s', '3min', '5min+'];

  // Prefill form if idea is provided
  useEffect(() => {
    if (prefilledIdea) {
      setFormData(prev => ({
        ...prev,
        title: prefilledIdea.title,
        content: `Hook: "${prefilledIdea.title}..."

Problem: [Beschreiben Sie das Problem, das gelöst wird]

Lösung: [Erklären Sie Ihre Lösung oder Ihren Ansatz]

Call-to-Action: [Fügen Sie hier Ihren Aufruf zum Handeln ein]`,
        tags: prefilledIdea.title.toLowerCase().replace(/\s+/g, ', ')
      }));
    }
  }, [prefilledIdea]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newScript = {
      id: Date.now().toString(),
      title: formData.title,
      content: formData.content,
      platform: formData.platform,
      category: formData.category,
      duration: formData.duration,
      author: 'Sie',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      shots: formData.shots.filter(shot => shot.description.trim() !== '')
    };

    console.log('Neues Skript erstellt:', newScript);
    onClose();
  };

  const addShot = () => {
    setFormData(prev => ({
      ...prev,
      shots: [...prev.shots, { type: 'image', description: '' }]
    }));
  };

  const updateShot = (index: number, field: 'type' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      shots: prev.shots.map((shot, i) => 
        i === index ? { ...shot, [field]: value } : shot
      )
    }));
  };

  const removeShot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      shots: prev.shots.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {prefilledIdea ? `Skript erstellen: ${prefilledIdea.title}` : 'Neues Skript erstellen'}
            </h2>
            <p className="text-gray-600 mt-1">Erstellen Sie professionelle Skripte für Ihre Social Media Inhalte</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {/* 1. Script Content */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Skript-Inhalt
                  </h3>
                </div>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-4 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all text-gray-700 leading-relaxed"
                  placeholder="Schreiben Sie hier Ihr Skript...

Beispiel:
Hook: 'Das hat alles verändert...'
Problem: Viele haben Schwierigkeiten mit...
Lösung: Unser neues Produkt...
Call-to-Action: Link in Bio für mehr Infos!"
                  required
                />
              </div>

              {/* 2. Title */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold">
                    2
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Titel
                  </h3>
                </div>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-700"
                  placeholder="z.B. Instagram Produktlaunch Hook"
                  required
                />
              </div>

              {/* 3. Shots */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Shots (Bilder oder Videos) - Optional
                      </h3>
                      <p className="text-sm text-gray-600">
                        Beschreiben Sie die visuellen Elemente für Ihr Skript
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addShot}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Plus size={16} />
                    Shot hinzufügen
                  </button>
                </div>
                
                {formData.shots.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-green-300 rounded-xl bg-white">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="text-green-600" size={24} />
                    </div>
                    <h4 className="text-lg font-medium text-gray-700 mb-2">Keine Shots hinzugefügt</h4>
                    <p className="text-gray-500 mb-4">Shots sind optional - fügen Sie visuelle Elemente hinzu, wenn gewünscht</p>
                    <button
                      type="button"
                      onClick={addShot}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                    >
                      <Plus size={20} />
                      Ersten Shot hinzufügen
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {formData.shots.map((shot, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 border-2 border-green-300 hover:border-green-400 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <span className="text-sm font-medium text-gray-700">Shot {index + 1}</span>
                            <select
                              value={shot.type}
                              onChange={(e) => updateShot(index, 'type', e.target.value as 'image' | 'video')}
                              className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all"
                            >
                              <option value="image">Bild</option>
                              <option value="video">Video</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeShot(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Shot entfernen"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        
                        <textarea
                          value={shot.description}
                          onChange={(e) => updateShot(index, 'description', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all"
                          placeholder={`Beschreiben Sie das ${shot.type === 'image' ? 'Bild' : 'Video'}...`}
                        />
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addShot}
                      className="w-full p-4 border-2 border-dashed border-green-300 rounded-xl text-green-600 hover:border-green-400 hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      Weiteren Shot hinzufügen
                    </button>
                  </div>
                )}
              </div>

              {/* Additional Settings */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-400 text-white rounded-lg flex items-center justify-center text-sm">
                    ⚙️
                  </div>
                  Zusätzliche Einstellungen
                </h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Platform */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Plattform
                    </label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      {platforms.map(platform => (
                        <option key={platform.id} value={platform.id}>{platform.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Kategorie
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      {categories.map(category => (
                        <option key={category} value={category.toLowerCase()}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Dauer
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      {durations.map(duration => (
                        <option key={duration} value={duration}>{duration}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Tags (durch Komma getrennt)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="z.B. hook, produktlaunch, instagram"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700 font-medium flex items-center gap-2">
                    💡 <span>Tipp: Ziehen Sie Skripte per Drag & Drop auf Content-Projekte im Status Planer</span>
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg font-medium"
                  >
                    <Save size={18} />
                    Skript erstellen
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScriptCreator;