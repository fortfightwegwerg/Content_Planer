import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Bell, Trash2, LogOut, Save, Eye, EyeOff, AlertCircle, CheckCircle, Moon, Sun, Monitor } from 'lucide-react';
import { updatePassword, updateEmail, deleteUser, signOut, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useFirebase } from '../contexts/FirebaseContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../hooks/useSupabase';

const AccountSettings: React.FC = () => {
  const { user } = useFirebase();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    bio: '',
    photoURL: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
    contentReminders: true,
    teamUpdates: true
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          const userEmail = user.email || '';
          const userName = user.displayName || '';

          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfile({
              name: userData.name || userName,
              email: userEmail,
              company: userData.company || '',
              role: userData.role || '',
              bio: userData.bio || '',
              photoURL: userData.photoURL || ''
            });
          } else {
            const newUserData = {
              name: userName,
              email: userEmail,
              company: '',
              role: '',
              bio: '',
              onboardingCompleted: true,
              createdAt: new Date(),
              updatedAt: new Date()
            };

            await setDoc(doc(db, 'users', user.uid), newUserData);

            setUserProfile({
              name: newUserData.name,
              email: newUserData.email,
              company: newUserData.company,
              role: newUserData.role,
              bio: newUserData.bio,
              photoURL: ''
            });
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          setMessage({ type: 'error', text: 'Fehler beim Laden des Profils. Bitte Seite neu laden.' });
        }
      }
    };

    loadUserProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (user) {
        // Ensure the document exists first, then update
        await setDoc(doc(db, 'users', user.uid), {
          name: userProfile.name,
          email: userProfile.email,
          company: userProfile.company,
          role: userProfile.role,
          bio: userProfile.bio,
          onboardingCompleted: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }, { merge: true });

        setMessage({ type: 'success', text: 'Profil erfolgreich aktualisiert!' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: `Fehler beim Aktualisieren des Profils: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}` });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Neue Passwörter stimmen nicht überein.' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Neues Passwort muss mindestens 6 Zeichen lang sein.' });
      setLoading(false);
      return;
    }

    try {
      if (user) {
        // Reauthenticate user
        const credential = EmailAuthProvider.credential(user.email!, passwordData.currentPassword);
        await reauthenticateWithCredential(user, credential);
        
        // Update password
        await updatePassword(user, passwordData.newPassword);
        
        setMessage({ type: 'success', text: 'Passwort erfolgreich geändert!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error: any) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/wrong-password') {
        setMessage({ type: 'error', text: 'Aktuelles Passwort ist falsch.' });
      } else {
        setMessage({ type: 'error', text: 'Fehler beim Ändern des Passworts.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (user) {
        // Reauthenticate user
        const credential = EmailAuthProvider.credential(user.email!, emailData.password);
        await reauthenticateWithCredential(user, credential);
        
        // Update email
        await updateEmail(user, emailData.newEmail);
        
        // Update in Firestore
        await updateDoc(doc(db, 'users', user.uid), {
          email: emailData.newEmail,
          updatedAt: new Date()
        });
        
        setUserProfile(prev => ({ ...prev, email: emailData.newEmail }));
        setMessage({ type: 'success', text: 'E-Mail-Adresse erfolgreich geändert!' });
        setEmailData({ newEmail: '', password: '' });
      }
    } catch (error: any) {
      console.error('Error updating email:', error);
      if (error.code === 'auth/wrong-password') {
        setMessage({ type: 'error', text: 'Passwort ist falsch.' });
      } else if (error.code === 'auth/email-already-in-use') {
        setMessage({ type: 'error', text: 'E-Mail-Adresse wird bereits verwendet.' });
      } else {
        setMessage({ type: 'error', text: 'Fehler beim Ändern der E-Mail-Adresse.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setMessage(null);

    try {
      if (user) {
        // Delete user data from Firestore
        await deleteDoc(doc(db, 'users', user.uid));
        
        // Delete user account
        await deleteUser(user);
        
        setMessage({ type: 'success', text: 'Account erfolgreich gelöscht.' });
      }
    } catch (error: any) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/requires-recent-login') {
        setMessage({ type: 'error', text: 'Bitte melden Sie sich erneut an, um Ihren Account zu löschen.' });
      } else {
        setMessage({ type: 'error', text: 'Fehler beim Löschen des Accounts.' });
      }
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      } else {
        await signOut(auth);
      }
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
      setMessage({ type: 'error', text: 'Fehler beim Abmelden. Bitte versuchen Sie es erneut.' });
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const sections = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'security', name: 'Sicherheit', icon: Lock },
    { id: 'appearance', name: 'Erscheinungsbild', icon: isDarkMode ? Moon : Sun },
    { id: 'notifications', name: 'Benachrichtigungen', icon: Bell },
    { id: 'account', name: 'Account', icon: Trash2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Account Einstellungen</h2>
          <p className="text-gray-600 mt-1">Verwalten Sie Ihr Profil und Account-Einstellungen</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <LogOut size={20} />
          Abmelden
        </button>
      </div>

      <div className="flex gap-6">
        {/* Settings Navigation */}
        <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  {section.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Success/Error Messages */}
          {message && (
            <div className={`m-6 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          )}

          {/* Profile Settings */}
          {activeSection === 'profile' && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Profil Einstellungen</h3>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-medium border-4 border-white shadow-lg">
                    {userProfile.name ? userProfile.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{userProfile.name || 'Benutzername'}</h4>
                    <p className="text-sm text-gray-600">{userProfile.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vollständiger Name
                    </label>
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ihr vollständiger Name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-Mail-Adresse
                    </label>
                    <input
                      type="email"
                      value={userProfile.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">E-Mail-Adresse kann im Sicherheits-Bereich geändert werden</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Firma/Organisation
                    </label>
                    <input
                      type="text"
                      value={userProfile.company}
                      onChange={(e) => setUserProfile({ ...userProfile, company: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Firmenname"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rolle
                    </label>
                    <select
                      value={userProfile.role}
                      onChange={(e) => setUserProfile({ ...userProfile, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Rolle wählen</option>
                      <option value="creator">Creator</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={userProfile.bio}
                    onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Erzählen Sie uns etwas über sich..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Save size={16} />
                    {loading ? 'Speichern...' : 'Änderungen speichern'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Sicherheits-Einstellungen</h3>
              
              <div className="space-y-8">
                {/* Change Password */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Passwort ändern</h4>
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aktuelles Passwort
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Aktuelles Passwort eingeben"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Neues Passwort
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Neues Passwort"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Passwort bestätigen
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Neues Passwort wiederholen"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Passwort wird geändert...' : 'Passwort ändern'}
                    </button>
                  </form>
                </div>

                {/* Change Email */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">E-Mail-Adresse ändern</h4>
                  <form onSubmit={handleUpdateEmail} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aktuelle E-Mail
                      </label>
                      <input
                        type="email"
                        value={userProfile.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        disabled
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Neue E-Mail-Adresse
                        </label>
                        <input
                          type="email"
                          value={emailData.newEmail}
                          onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="neue.email@firma.de"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Passwort bestätigen
                        </label>
                        <input
                          type="password"
                          value={emailData.password}
                          onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ihr aktuelles Passwort"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? 'E-Mail wird geändert...' : 'E-Mail ändern'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeSection === 'appearance' && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Erscheinungsbild</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                      Dark Mode
                    </h4>
                    <p className="text-sm text-gray-600">
                      {isDarkMode ? 'Dunkles Design für bessere Sicht bei schlechten Lichtverhältnissen' : 'Helles Design für optimale Lesbarkeit'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleDarkMode}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                      isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform transform ${
                        isDarkMode ? 'translate-x-6' : 'translate-x-1'
                      } mt-1`}
                    />
                  </button>
                </div>

                {/* Theme Preview */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Vorschau</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Light Theme Preview */}
                    <div 
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        !isDarkMode 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => !isDarkMode || toggleDarkMode()}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sun size={16} className="text-yellow-500" />
                        <span className="text-sm font-medium text-gray-900">Hell</span>
                      </div>
                      <div className="bg-white rounded p-2 space-y-1">
                        <div className="h-2 bg-gray-100 rounded"></div>
                        <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 bg-blue-100 rounded w-1/2"></div>
                      </div>
                    </div>

                    {/* Dark Theme Preview */}
                    <div 
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        isDarkMode 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => isDarkMode || toggleDarkMode()}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Moon size={16} className="text-blue-400" />
                        <span className="text-sm font-medium text-gray-900">Dunkel</span>
                      </div>
                      <div className="bg-gray-900 rounded p-2 space-y-1">
                        <div className="h-2 bg-gray-700 rounded"></div>
                        <div className="h-2 bg-gray-600 rounded w-3/4"></div>
                        <div className="h-2 bg-blue-600 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Preference Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Monitor className="text-blue-600 mt-0.5" size={20} />
                    <div>
                      <h5 className="font-medium text-blue-900">System-Einstellung</h5>
                      <p className="text-sm text-blue-700 mt-1">
                        Das Theme wird automatisch basierend auf Ihrer System-Einstellung gewählt, 
                        wenn Sie SocialPlan zum ersten Mal öffnen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeSection === 'notifications' && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Benachrichtigungs-Einstellungen</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">E-Mail Benachrichtigungen</h4>
                    <p className="text-sm text-gray-600">Erhalten Sie wichtige Updates per E-Mail</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNotificationChange('emailNotifications')}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                      notifications.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform transform ${
                        notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      } mt-1`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Content Erinnerungen</h4>
                    <p className="text-sm text-gray-600">Erinnerungen für geplante Posts</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNotificationChange('contentReminders')}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                      notifications.contentReminders ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform transform ${
                        notifications.contentReminders ? 'translate-x-6' : 'translate-x-1'
                      } mt-1`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Wöchentlicher Bericht</h4>
                    <p className="text-sm text-gray-600">Zusammenfassung Ihrer Performance</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNotificationChange('weeklyReport')}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                      notifications.weeklyReport ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform transform ${
                        notifications.weeklyReport ? 'translate-x-6' : 'translate-x-1'
                      } mt-1`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Team Updates</h4>
                    <p className="text-sm text-gray-600">Benachrichtigungen über Team-Aktivitäten</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNotificationChange('teamUpdates')}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                      notifications.teamUpdates ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform transform ${
                        notifications.teamUpdates ? 'translate-x-6' : 'translate-x-1'
                      } mt-1`}
                    />
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Einstellungen speichern
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Account Management */}
          {activeSection === 'account' && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Account Verwaltung</h3>
              
              <div className="space-y-6">
                {/* Account Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Erstellt am:</strong> {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('de-DE') : 'Unbekannt'}</p>
                    <p><strong>Letzte Anmeldung:</strong> {user?.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString('de-DE') : 'Unbekannt'}</p>
                    <p><strong>User ID:</strong> {user?.uid}</p>
                  </div>
                </div>

                {/* Export Data */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Daten exportieren</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Laden Sie alle Ihre Daten in einem JSON-Format herunter.
                  </p>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                    Daten exportieren
                  </button>
                </div>

                {/* Delete Account */}
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h4 className="font-medium text-red-900 mb-2">Account löschen</h4>
                  <p className="text-sm text-red-700 mb-4">
                    <strong>Achtung:</strong> Diese Aktion kann nicht rückgängig gemacht werden. 
                    Alle Ihre Daten, Posts und Team-Informationen werden dauerhaft gelöscht.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Trash2 size={16} />
                    Account löschen
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Account löschen</h3>
                  <p className="text-sm text-gray-600">Diese Aktion kann nicht rückgängig gemacht werden.</p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-800 text-sm font-medium">Alle folgenden Daten werden dauerhaft gelöscht:</p>
                <ul className="text-red-700 text-sm mt-2 space-y-1 list-disc list-inside">
                  <li>Ihr Profil und persönliche Daten</li>
                  <li>Alle erstellten Content-Posts</li>
                  <li>Team-Mitgliedschaften</li>
                  <li>Analytics-Daten</li>
                  <li>Partner-Informationen</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  {loading ? 'Löschen...' : 'Account endgültig löschen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;