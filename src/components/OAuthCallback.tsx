import React, { useEffect, useState } from 'react';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../hooks/useSupabase';

const OAuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Autorisierung wird verarbeitet...');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      if (!supabase) {
        setStatus('error');
        setMessage('Supabase nicht konfiguriert');
        setTimeout(() => window.close(), 3000);
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        setStatus('error');
        setMessage('Autorisierung abgebrochen');
        setTimeout(() => window.close(), 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('Kein Autorisierungscode erhalten');
        setTimeout(() => window.close(), 3000);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus('error');
        setMessage('Nicht angemeldet');
        setTimeout(() => window.close(), 3000);
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/youtube-oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          code,
          userId: user.id,
          redirectUri: window.location.origin + '/oauth2callback',
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setStatus('error');
        setMessage(data.error || 'Fehler bei der Autorisierung');
        setTimeout(() => window.close(), 3000);
        return;
      }

      setStatus('success');
      setMessage('YouTube Kanal erfolgreich verbunden!');
      setTimeout(() => {
        window.opener?.postMessage({ type: 'youtube-connected' }, window.location.origin);
        window.close();
      }, 2000);

    } catch (error: any) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage(error.message || 'Ein Fehler ist aufgetreten');
      setTimeout(() => window.close(), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        {status === 'loading' && (
          <div className="text-center">
            <Loader className="animate-spin mx-auto text-blue-600 mb-4" size={48} />
            <p className="text-lg font-medium text-gray-900">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
            <p className="text-lg font-medium text-gray-900">{message}</p>
            <p className="text-sm text-gray-600 mt-2">Dieses Fenster wird automatisch geschlossen...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
            <p className="text-lg font-medium text-gray-900">{message}</p>
            <p className="text-sm text-gray-600 mt-2">Dieses Fenster wird automatisch geschlossen...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
