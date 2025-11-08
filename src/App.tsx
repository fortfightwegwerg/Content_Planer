import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Users, BarChart3, Settings, Home } from 'lucide-react';
import { FirebaseProvider } from './contexts/FirebaseContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useFirebase } from './contexts/FirebaseContext';
import { useTheme } from './contexts/ThemeContext';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import ContentCreator from './components/ContentCreator';
import OAuthCallback from './components/OAuthCallback';

// Code splitting for conditionally rendered components
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const ContentCalendar = React.lazy(() => import('./components/ContentCalendar'));
const TeamManagement = React.lazy(() => import('./components/TeamManagement'));
const Analytics = React.lazy(() => import('./components/Analytics'));
const StatusPlanner = React.lazy(() => import('./components/StatusPlanner'));
const Partners = React.lazy(() => import('./components/Partners'));
const AccountSettings = React.lazy(() => import('./components/AccountSettings'));
const IdeasMindmap = React.lazy(() => import('./components/IdeasMindmap'));
const ScriptWriter = React.lazy(() => import('./components/ScriptWriter'));
const ScriptCreator = React.lazy(() => import('./components/ScriptCreator'));
const Chat = React.lazy(() => import('./components/Chat'));
const CompanyManagement = React.lazy(() => import('./components/CompanyManagement'));

const AppContent: React.FC = () => {
  const { user, loading } = useFirebase();
  const { isDarkMode } = useTheme();
  const [activeView, setActiveView] = useState('dashboard');
  const [showContentCreator, setShowContentCreator] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showScriptCreator, setShowScriptCreator] = useState(false);
  const [prefilledIdea, setPrefilledIdea] = useState<any>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.data.type === 'youtube-connected') {
        window.location.reload();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (window.location.pathname === '/oauth2callback') {
    return <OAuthCallback />;
  }

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">SocialPlan wird geladen...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!user) {
    return <AuthScreen onComplete={() => setShowAuth(false)} />;
  }
  const handleCreateScriptFromIdea = (idea: any) => {
    setPrefilledIdea(idea);
    setShowScriptCreator(true);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onCreateContent={() => setShowContentCreator(true)} />;
      case 'calendar':
        return <ContentCalendar onCreateContent={() => setShowContentCreator(true)} />;
      case 'team':
        return <TeamManagement />;
      case 'analytics':
        return <Analytics />;
      case 'planner':
        return <StatusPlanner />;
      case 'partners':
        return <Partners />;
      case 'ideas':
        return <IdeasMindmap onCreateScript={handleCreateScriptFromIdea} />;
      case 'scripts':
        return <ScriptWriter />;
      case 'chat':
        return <Chat />;
      case 'company':
        return <CompanyManagement />;
      case 'account':
        return <AccountSettings />;
      default:
        return <Dashboard onCreateContent={() => setShowContentCreator(true)} />;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar activeView={activeView} setActiveView={setActiveView} isDarkMode={isDarkMode} />
      
      <main className="flex-1 ml-16 transition-all duration-300">
        <header className={`border-b px-6 py-4 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {activeView === 'dashboard' && 'Dashboard'}
              {activeView === 'calendar' && 'Content Kalender'}
              {activeView === 'team' && 'Team Management'}
              {activeView === 'analytics' && 'Analytics'}
              {activeView === 'planner' && 'Status Planer'}
              {activeView === 'partners' && 'Partner Management'}
              {activeView === 'ideas' && 'Ideensammlung'}
              {activeView === 'scripts' && 'Skript-Bibliothek'}
              {activeView === 'chat' && 'Team Chat'}
              {activeView === 'company' && 'Unternehmensverwaltung'}
              {activeView === 'account' && 'Account Einstellungen'}
            </h1>
            <button
              onClick={() => setShowContentCreator(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Neuer Content
            </button>
          </div>
        </header>

        <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : ''}`}>
          <React.Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg mx-auto mb-3 animate-pulse"></div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Lädt...
                </p>
              </div>
            </div>
          }>
            {renderActiveView()}
          </React.Suspense>
        </div>
      </main>

      {showContentCreator && (
        <ContentCreator onClose={() => setShowContentCreator(false)} />
      )}

      {showScriptCreator && (
        <ScriptCreator 
          onClose={() => {
            setShowScriptCreator(false);
            setPrefilledIdea(null);
          }}
          prefilledIdea={prefilledIdea}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <FirebaseProvider>
        <AppContent />
      </FirebaseProvider>
    </ThemeProvider>
  );
}

export default App;