import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Users, Paperclip, Smile, MoreVertical, Search } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useTheme } from '../contexts/ThemeContext';

interface Message {
  id: string;
  text: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: Date;
  type: 'text' | 'file' | 'system';
  edited?: boolean;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'general';
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

const Chat: React.FC = () => {
  const { user } = useFirebase();
  const { isDarkMode } = useTheme();
  const [activeRoom, setActiveRoom] = useState<string>('general');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatRooms] = useState<ChatRoom[]>([]);

  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: {
        id: 'user1',
        name: 'Sie',
        avatar: user?.displayName?.split(' ').map(n => n[0]).join('') || 'U'
      },
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Heute';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Gestern';
    } else {
      return date.toLocaleDateString('de-DE');
    }
  };

  const activeRoomData = chatRooms.find(room => room.id === activeRoom);
  const filteredRooms = chatRooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <MessageCircle className="text-white" size={24} />
            </div>
            Team Chat
          </h2>
          <p className="text-gray-600 mt-1">Kommunizieren Sie mit Ihrem Team in Echtzeit</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
        {/* Chat Rooms Sidebar */}
        <div className={`lg:col-span-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} flex flex-col`}>
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Chats durchsuchen..."
              />
            </div>
          </div>

          {/* Room List */}
          <div className="flex-1 overflow-y-auto">
            {filteredRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room.id)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  activeRoom === room.id 
                    ? (isDarkMode ? 'bg-gray-700' : 'bg-blue-50 border-blue-200') 
                    : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      room.type === 'general' ? 'bg-green-500' :
                      room.type === 'group' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}>
                      {room.type === 'direct' ? room.name.split(' ').map(n => n[0]).join('') : 
                       room.type === 'general' ? '#' : <Users size={16} />}
                    </div>
                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {room.name}
                      </h4>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {room.participants.length} Teilnehmer
                      </p>
                    </div>
                  </div>
                  {room.unreadCount > 0 && (
                    <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {room.unreadCount}
                    </div>
                  )}
                </div>
                {room.lastMessage && (
                  <div className="ml-13">
                    <p className={`text-sm truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {room.lastMessage.text}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                      {formatTime(room.lastMessage.timestamp)}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`lg:col-span-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} flex flex-col`}>
          {/* Chat Header */}
          <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                activeRoomData?.type === 'general' ? 'bg-green-500' :
                activeRoomData?.type === 'group' ? 'bg-blue-500' : 'bg-purple-500'
              }`}>
                {activeRoomData?.type === 'direct' ? activeRoomData.name.split(' ').map(n => n[0]).join('') : 
                 activeRoomData?.type === 'general' ? '#' : <Users size={16} />}
              </div>
              <div>
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {activeRoomData?.name}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {activeRoomData?.participants.length} Teilnehmer • Online
                </p>
              </div>
            </div>
            <button className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : ''}`}>
              <MoreVertical size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => {
              const showDate = index === 0 || 
                formatDate(messages[index - 1].timestamp) !== formatDate(msg.timestamp);
              const isOwnMessage = msg.sender.id === 'user1';
              
              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex items-center justify-center my-4">
                      <div className={`px-3 py-1 rounded-full text-xs ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {formatDate(msg.timestamp)}
                      </div>
                    </div>
                  )}
                  
                  {msg.type === 'system' ? (
                    <div className="flex justify-center">
                      <div className={`px-3 py-1 rounded-full text-xs ${
                        isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-3 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                        {!isOwnMessage && (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                            {msg.sender.avatar}
                          </div>
                        )}
                        <div>
                          {!isOwnMessage && (
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                              {msg.sender.name}
                            </p>
                          )}
                          <div className={`px-4 py-2 rounded-2xl ${
                            isOwnMessage 
                              ? 'bg-blue-600 text-white' 
                              : (isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900')
                          }`}>
                            <p className="text-sm">{msg.text}</p>
                          </div>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1 ${
                            isOwnMessage ? 'text-right' : 'text-left'
                          }`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <button
                type="button"
                className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
              >
                <Paperclip size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Nachricht eingeben..."
                />
                <button
                  type="button"
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-600' : ''}`}
                >
                  <Smile size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                </button>
              </div>
              
              <button
                type="submit"
                disabled={!message.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;