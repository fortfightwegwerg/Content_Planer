import React, { useState, useRef } from 'react';
import { Plus, X, Lightbulb, FileText, Trash2 } from 'lucide-react';

interface Idea {
  id: string;
  title: string;
  x: number;
  y: number;
  color: string;
  connected: string[];
  type?: 'idea' | 'title';
}

interface IdeasMindmapProps {
  onCreateScript: (idea: Idea) => void;
}

const IdeasMindmap: React.FC<IdeasMindmapProps> = ({ onCreateScript }) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);

  const [showAddIdea, setShowAddIdea] = useState(false);
  const [showAddTitle, setShowAddTitle] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newTitleText, setNewTitleText] = useState('');
  const [draggedIdea, setDraggedIdea] = useState<Idea | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const mindmapRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });

  const colors = [
    'bg-pink-500', 'bg-purple-500', 'bg-blue-500', 'bg-green-500', 
    'bg-yellow-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500'
  ];

  const handleIdeaClick = (idea: Idea) => {
    // Only trigger script creation for ideas, not titles
    if (idea.type === 'title') return;
    
    // Only trigger script creation for ideas, not titles
    if (idea.type === 'title') return;
    
    // Open script creation with pre-filled data
    onCreateScript(idea);
  };

  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdeaTitle.trim()) return;

    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newIdea: Idea = {
      id: Date.now().toString(),
      title: newIdeaTitle,
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 150,
      color: randomColor,
      connected: [],
      type: 'idea'
    };

    setIdeas(prev => [...prev, newIdea]);
    setNewIdeaTitle('');
    setShowAddIdea(false);
  };

  const handleAddTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleText.trim()) return;

    const newTitle: Idea = {
      id: Date.now().toString(),
      title: newTitleText,
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 150,
      color: 'bg-gradient-to-r from-gray-600 to-gray-800',
      connected: [],
      type: 'title'
    };

    setIdeas(prev => [...prev, newTitle]);
    setNewTitleText('');
    setShowAddTitle(false);
  };

  const deleteIdea = (ideaId: string) => {
    setIdeas(prev => prev.filter(idea => idea.id !== ideaId));
  };

  const handleMouseDown = (e: React.MouseEvent, idea: Idea) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(false);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    
    if (mindmapRef.current) {
      const rect = mindmapRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left - idea.x;
      const offsetY = e.clientY - rect.top - idea.y;
      
      setDraggedIdea(idea);
      setDragOffset({ x: offsetX, y: offsetY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedIdea && mindmapRef.current) {
      // Check if we've moved enough to consider this a drag
      const deltaX = Math.abs(e.clientX - dragStartPos.x);
      const deltaY = Math.abs(e.clientY - dragStartPos.y);
      
      if ((deltaX > 5 || deltaY > 5) && !isDragging) {
        setIsDragging(true);
      }
      
      const rect = mindmapRef.current.getBoundingClientRect();
      const newX = Math.max(0, Math.min(rect.width - 120, e.clientX - rect.left - dragOffset.x));
      const newY = Math.max(0, Math.min(rect.height - 80, e.clientY - rect.top - dragOffset.y));
      
      setIdeas(prev => prev.map(idea => 
        idea.id === draggedIdea.id 
          ? { ...idea, x: newX, y: newY }
          : idea
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggedIdea(null);
    setDragOffset({ x: 0, y: 0 });
    setTimeout(() => setIsDragging(false), 100); // Small delay to prevent click after drag
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Lightbulb className="text-white" size={24} />
            </div>
            Ideensammlung
          </h2>
          <p className="text-gray-600 mt-2">
            Sammeln Sie Ideen in einer interaktiven Mindmap. Klicken Sie auf eine Idee, um direkt ein Skript zu erstellen.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddTitle(true)}
            className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus size={18} />
            Titel
          </button>
          <button
            onClick={() => setShowAddTitle(true)}
            className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus size={18} />
            Titel
          </button>
          <button
            onClick={() => setShowAddIdea(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus size={20} />
            Neue Idee
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Lightbulb className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{ideas.filter(idea => idea.type !== 'title').length}</p>
              <p className="text-sm text-gray-600">Gesammelte Ideen</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-3 rounded-xl">
              <FileText className="text-gray-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{ideas.filter(idea => idea.type === 'title').length}</p>
              <p className="text-sm text-gray-600">Kategorien</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-3 rounded-xl">
              <FileText className="text-gray-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{ideas.filter(idea => idea.type === 'title').length}</p>
              <p className="text-sm text-gray-600">Kategorien</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {ideas.reduce((total, idea) => total + idea.connected.length, 0)}
              </p>
              <p className="text-sm text-gray-600">Verknüpfungen</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-xl">
              <Plus className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">∞</p>
              <p className="text-sm text-gray-600">Unbegrenzt</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Mindmap */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                🧠 Brainstorming Mindmap
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Ziehen Sie Ideen per Drag & Drop • Klicken Sie für Skript-Erstellung
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Verschiebbar</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <FileText size={14} />
                <span>Klickbar</span>
              </div>
            </div>
          </div>
        </div>
        
        <div 
          ref={mindmapRef}
          className="relative h-[600px] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden cursor-default"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* SVG for connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {ideas.map(idea => 
              idea.connected.map(connectedId => {
                const connectedIdea = ideas.find(i => i.id === connectedId);
                if (!connectedIdea) return null;
                
                return (
                  <line
                    key={`${idea.id}-${connectedId}`}
                    x1={idea.x + 60}
                    y1={idea.y + 25}
                    x2={connectedIdea.x + 60}
                    y2={connectedIdea.y + 25}
                    stroke="#d1d5db"
                    strokeWidth="2"
                    strokeDasharray="8,4"
                    className="animate-pulse"
                  />
                );
              })
            ).flat()}
          </svg>
          
          {/* Ideas as draggable cards */}
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="absolute group select-none z-10"
              style={{ 
                left: `${idea.x}px`, 
                top: `${idea.y}px`,
                transform: draggedIdea?.id === idea.id ? 'scale(1.05) rotate(2deg)' : 'scale(1)',
                transition: draggedIdea?.id === idea.id ? 'none' : 'transform 0.2s ease'
              }}
            >
              <div 
                className={`${idea.color} text-white px-5 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 min-w-[120px] max-w-[180px] cursor-move border-2 border-white`}
                onMouseDown={(e) => handleMouseDown(e, idea)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Only trigger click if we haven't been dragging and it's an idea (not title)
                  if (!isDragging && !draggedIdea && idea.type !== 'title') {
                    handleIdeaClick(idea);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold leading-tight flex-1 pr-2">{idea.title}</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteIdea(idea.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-all flex-shrink-0"
                  >
                    <X size={12} />
                  </button>
                </div>
                {idea.type === 'title' ? (
                  <div className="flex items-center justify-center mt-2">
                    <div className="text-xs opacity-90 font-medium">📂 Kategorie</div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs opacity-90 flex items-center gap-1">
                      <FileText size={10} />
                      <span>Für Skript klicken</span>
                    </div>
                    <div className="text-xs opacity-75">✋ Ziehbar</div>
                  </div>
                )}
                
                {/* Drag indicator */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white bg-opacity-30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          ))}
          
          {/* Empty state for ideas */}
          {ideas.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Lightbulb className="text-white" size={40} />
                </div>
                <h4 className="text-2xl font-bold text-gray-700 mb-3">Keine Ideen vorhanden</h4>
                <p className="text-gray-500 mb-6 max-w-md">
                  Fügen Sie Ihre erste Idee zur Mindmap hinzu und lassen Sie Ihrer Kreativität freien Lauf
                </p>
                <button
                  onClick={() => setShowAddIdea(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl flex items-center gap-3 mx-auto transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus size={24} />
                  Erste Idee hinzufügen
                </button>
              </div>
            </div>
          )}

          {/* Add Idea Floating Button */}
          {ideas.length > 0 && (
            <div className="absolute bottom-6 right-6 flex flex-col gap-3">
              <button
                onClick={() => setShowAddTitle(true)}
                className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
                title="Titel hinzufügen"
              >
                <FileText size={20} />
              </button>
              <button
                onClick={() => setShowAddIdea(true)}
                className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
                title="Idee hinzufügen"
              >
                <Plus size={24} />
              </button>
            </div>
          )}
        </div>
        
        {/* Instructions */}
        <div className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Ideen verschieben: Drag & Drop</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText size={14} />
                <span>Skript erstellen: Klicken auf Idee</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                <span>Titel: Nur verschiebbar</span>
              </div>
              <div className="flex items-center gap-2">
                <Trash2 size={14} />
                <span>Löschen: Hover über Idee</span>
              </div>
            </div>
            <span className="text-gray-500">
              {ideas.filter(idea => idea.type !== 'title').length} Ideen • {ideas.filter(idea => idea.type === 'title').length} Kategorien
            </span>
          </div>
        </div>
      </div>

      {/* Add Idea Modal */}
      {showAddIdea && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Lightbulb className="text-purple-600" size={24} />
                    Neue Idee hinzufügen
                  </h2>
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
                  placeholder="z.B. Produktlaunch Hook, Tutorial Serie, Behind the Scenes..."
                  required
                  autoFocus
                />
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
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
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg font-medium transform hover:scale-105"
                >
                  <Plus size={18} />
                  Idee hinzufügen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Title Modal */}
      {showAddTitle && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="text-gray-600" size={24} />
                    Neue Kategorie hinzufügen
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">Erstellen Sie Titel-Blöcke zur besseren Organisation</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddTitle(false);
                    setNewTitleText('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddTitle} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Kategorie-Titel
                </label>
                <input
                  type="text"
                  value={newTitleText}
                  onChange={(e) => setNewTitleText(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                  placeholder="z.B. Marketing, Tutorials, Entertainment..."
                  required
                  autoFocus
                />
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-700 font-medium flex items-center gap-2">
                  📂 <span>Titel-Blöcke dienen zur Organisation und können nicht angeklickt werden</span>
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTitle(false);
                    setNewTitleText('');
                  }}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-xl hover:from-gray-700 hover:to-gray-900 transition-all flex items-center gap-2 shadow-lg font-medium transform hover:scale-105"
                >
                  <Plus size={18} />
                  Titel hinzufügen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeasMindmap;