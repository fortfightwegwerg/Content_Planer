export interface ContentPost {
  title: string;
  content: string;
  platform: string;
  category: string;
  hashtags: string;
  scheduledDate: string;
  scheduledTime: string;
  assignee: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  avatar: string;
  posts: number;
  lastActive: string;
  createdAt: Date;
}

export interface Partner {
  name: string;
  type: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  specialization: string;
  rating: number;
  status: 'active' | 'pending' | 'inactive';
  projects: number;
  avatar: string;
  createdAt: Date;
}

export interface Analytics {
  platform: string;
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  engagement: number;
}

export interface Script {
  id: string;
  title: string;
  content: string;
  type: 'hook' | 'main' | 'cta' | 'full';
  platform: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  attachedTo?: string; // Content ID
}

import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Users,
  Shield,
  TrendingUp,
  User,
  FileText,
  MessageCircle,
  Building,
  LogOut
} from 'lucide-react';
import { supabase } from '../hooks/useSupabase';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isDarkMode?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isDarkMode = false }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Kalender', icon: Calendar },
    { id: 'planner', label: 'Status Planer', icon: BarChart3 },
    { id: 'ideas', label: 'Ideen', icon: FileText },
    { id: 'scripts', label: 'Skripte', icon: FileText },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'partners', label: 'Partner', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'company', label: 'Unternehmen', icon: Building },
    { id: 'account', label: 'Account', icon: User },
  ];

  const handleLogout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div 
      className={`${isHovered ? 'w-64' : 'w-16'} h-full flex flex-col fixed left-0 top-0 transition-all duration-300 ease-in-out z-50 ${
      isDarkMode 
        ? 'bg-gray-900 text-white border-r border-gray-800' 
        : 'bg-gray-900 text-white'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`p-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-700'}`}>
        <div className={`flex items-center ${isHovered ? 'space-x-3' : 'justify-center'} transition-all duration-300`}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className={`text-xl font-bold transition-all duration-300 ${
            isHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
          }`}>
            SocialPlan
          </span>
        </div>
      </div>
      
      <nav className={`flex-1 ${isHovered ? 'p-4' : 'p-2'} transition-all duration-300`}>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center ${isHovered ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg transition-all duration-300 ${
                    activeView === item.id
                      ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-indigo-600 text-white')
                      : (isDarkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white')
                  }`}
                  title={!isHovered ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className={`transition-all duration-300 ${
                    isHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                  }`}>
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={`border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-700'} ${isHovered ? 'p-4' : 'p-2'}`}>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${isHovered ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg transition-all duration-300 text-red-400 hover:bg-red-900/20 hover:text-red-300`}
          title={!isHovered ? 'Abmelden' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className={`transition-all duration-300 ${
            isHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
          }`}>
            Abmelden
          </span>
        </button>
      </div>
    </div>
  );
};


export default Sidebar;