import React, { useState, useRef } from 'react';
import { Plus, FileText, Edit3, Trash2, Copy, Download, MoreVertical, Search, Filter, Tag, Clock, User, X, Save, Eye } from 'lucide-react';

interface Script {
  id: string;
  title: string;
  content: string;
  platform: string;
  category: string;
  duration: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  shots?: { type: 'image' | 'video', description: string }[];
}

const ScriptWriter: React.FC = () => {
  const [scripts, setScripts] = useState<Script[]>([]);

  const [showCreateScript, setShowCreateScript] = useState(false);
  const [editingScript, setEditingScript] = useState<Script | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showAddIdea, setShowAddIdea] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState('');

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

  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    // Add idea logic here
    setShowAddIdea(false);
    setNewIdeaTitle('');
  };

  const handleCreateScript = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newScript: Script = {
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
      shots: formData.shots.filter((shot: any) => shot.description.trim() !== '')
    };

    setScripts(prev => [newScript, ...prev]);
    setFormData({ 
      content: '',
      title: '',
      shots: [],
      platform: 'instagram', 
      category: 'marketing', 
      duration: '30s', 
      tags: '' 
    });
    setShowCreateScript(false);
  };

  const handleEditScript = (script: Script) => {
    setEditingScript(script);
    setFormData({
      content: script.content,
      title: script.title,
      shots: script.shots || [],
      platform: script.platform,
      category: script.category,
      duration: script.duration,
      tags: script.tags.join(', ')
    });
  };

  const handleUpdateScript = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingScript) {
      setScripts(prev => prev.map(script => 
        script.id === editingScript.id 
          ? {
              ...script,
              content: formData.content,
              title: formData.title,
              shots: formData.shots,
              platform: formData.platform,
              category: formData.category,
              duration: formData.duration,
              tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
              updatedAt: new Date()
            }
          : script
      ));
      setEditingScript(null);
      setFormData({ 
        content: '',
        title: '',
        shots: [],
        platform: 'instagram', 
        category: 'marketing', 
        duration: '30s', 
        tags: '' 
      });
    }
  };

  const handleDeleteScript = (scriptId: string) => {
    setScripts(prev => prev.filter(script => script.id !== scriptId));
    setActiveDropdown(null);
  };

  const handleDuplicateScript = (script: Script) => {
    const duplicatedScript: Script = {
      ...script,
      id: Date.now().toString(),
      title: `${script.title} (Kopie)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setScripts(prev => [duplicatedScript, ...prev]);
    setActiveDropdown(null);
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

  const filteredScripts = scripts.filter(script => {
    const matchesSearch = script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         script.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         script.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPlatform = selectedPlatform === 'all' || script.platform === selectedPlatform;
    const matchesCategory = selectedCategory === 'all' || script.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesPlatform && matchesCategory;
  });

  const getPlatformColor = (platform: string) => {
    const platformObj = platforms.find(p => p.id === platform);
    return platformObj?.color || 'bg-gray-500';
  };

  const getPlatformName = (platform: string) => {
    const platformObj = platforms.find(p => p.id === platform);
    return platformObj?.name || platform;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Skript-Bibliothek</h2>
          <p className="text-gray-600 mt-1">
            Erstellen und verwalten Sie Skripte für Ihre Content-Erstellung
          </p>
        </div>
        <button
          onClick={() => setShowCreateScript(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Neues Skript
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Skripte durchsuchen..."
              />
            </div>
          </div>
          
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Alle Plattformen</option>
            {platforms.map(platform => (
              <option key={platform.id} value={platform.id}>{platform.name}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Alle Kategorien</option>
            {categories.map(category => (
              <option key={category} value={category.toLowerCase()}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Scripts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScripts.map((script) => (
          <div
            key={script.id}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group"
          >
            {/* Script Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{script.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-block w-3 h-3 rounded-full ${getPlatformColor(script.platform)}`}></span>
                  <span className="text-sm text-gray-600">{getPlatformName(script.platform)}</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-sm text-gray-600">{script.duration}</span>
                </div>
              </div>
              
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === script.id ? null : script.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
                >
                  <MoreVertical size={16} />
                </button>

                {activeDropdown === script.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-48">
                    <button
                      onClick={() => handleEditScript(script)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      <Edit3 size={14} />
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => handleDuplicateScript(script)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      <Copy size={14} />
                      Duplizieren
                    </button>
                    <button
                      onClick={() => handleDeleteScript(script.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <Trash2 size={14} />
                      Löschen
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Script Content Preview */}
            <div className="mb-4">
              <p className="text-sm text-gray-700 line-clamp-4 whitespace-pre-line">
                {script.content}
              </p>
            </div>

            {/* Tags */}
            {script.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {script.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    <Tag size={10} />
                    {tag}
                  </span>
                ))}
                {script.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{script.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Script Meta */}
            <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
              <div className="flex items-center gap-1">
                <User size={12} />
                {script.author}
              </div>
              <div className="flex items-center gap-1">
                <Clock size={12} />
                {script.updatedAt.toLocaleDateString('de-DE')}
              </div>
            </div>

            {/* Drag Indicator */}
          </div>
        ))}

        {/* Empty State */}
        {filteredScripts.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Skripte gefunden</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedPlatform !== 'all' || selectedCategory !== 'all' 
                ? 'Ändern Sie Ihre Filtereinstellungen oder erstellen Sie ein neues Skript.'
                : 'Erstellen Sie Ihr erstes Skript für Ihre Content-Erstellung.'
              }
            </p>
            <button
              onClick={() => setShowCreateScript(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <Plus size={20} />
              Erstes Skript erstellen
            </button>
          </div>
        )}
      </div>

      {/* Add Idea Modal */}
      {showAddIdea && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">💡 Neue Idee hinzufügen</h2>
                  <p className="text-gray-600 text-sm mt-1">Fügen Sie eine neue Idee zur Mindmap hinzu</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddIdea(false);
                    setNewIdeaTitle('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddIdea} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Ideen-Titel
                </label>
                <input
                  type="text"
                  value={newIdeaTitle}
                  onChange={(e) => setNewIdeaTitle(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="z.B. Produktlaunch Hook, Tutorial Serie..."
                  required
                  autoFocus
                />
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-purple-700 font-medium flex items-center gap-2">
                  ✨ <span>Tipp: Klicken Sie auf Ideen in der Mindmap, um sofort ein Skript zu erstellen</span>
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddIdea(false);
                    setNewIdeaTitle('');
                  }}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg font-medium"
                >
                  <Plus size={18} />
                  Idee hinzufügen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Script Modal */}
      {(showCreateScript || editingScript) && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
            <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingScript ? 'Skript bearbeiten' : 'Neues Skript erstellen'}
                </h2>
                <p className="text-gray-600 mt-1">Erstellen Sie professionelle Skripte für Ihre Social Media Inhalte</p>
              </div>
              <button
                onClick={() => {
                  setShowCreateScript(false);
                  setEditingScript(null);
                  setFormData({ title: '', content: '', shots: [], platform: 'instagram', category: 'marketing', duration: '30s', tags: '' });
                }}
                className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
              <form onSubmit={editingScript ? handleUpdateScript : handleCreateScript} className="p-8">
                <div className="space-y-8">
                  {/* 1. Script Content - Full Width */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                        1
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        1. Skript-Inhalt
                      </h3>
                    </div>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={10}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all text-gray-700 leading-relaxed"
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
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold">
                        2
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        2. Titel
                      </h3>
                    </div>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-700"
                      placeholder="z.B. Instagram Produktlaunch Hook"
                      required
                    />
                  </div>

                  {/* 3. Shots */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold">
                          3
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            3. Shots (Bilder oder Videos) - Optional
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
                      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Plus className="text-gray-400" size={24} />
                        </div>
                        <h4 className="text-lg font-medium text-gray-700 mb-2">Keine Shots hinzugefügt</h4>
                        <p className="text-gray-500 mb-4">Shots sind optional - fügen Sie visulle Elemente hinzu, wenn gewünscht</p>
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
                          <div key={index} className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-gray-300 transition-colors">
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

                  {/* Additional Settings - Collapsible */}
                  <div className="bg-white border-2 border-gray-100 rounded-xl p-6">
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
                    <div>
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
                        onClick={() => {
                          setShowCreateScript(false);
                          setEditingScript(null);
                          setFormData({ content: '', title: '', shots: [], platform: 'instagram', category: 'marketing', duration: '30s', tags: '' });
                        }}
                        className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                      >
                        Abbrechen
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg font-medium"
                      >
                        <Save size={18} />
                        {editingScript ? 'Skript aktualisieren' : 'Skript erstellen'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ScriptWriter;