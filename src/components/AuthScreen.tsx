import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Check, AlertCircle, Building, Users, Ticket } from 'lucide-react';
import { supabase } from '../hooks/useSupabase';

interface AuthScreenProps {
  onComplete: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<'login' | 'register'>('login');
  const [registrationType, setRegistrationType] = useState<'company' | 'employee'>('employee');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    inviteCode: ''
  });

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (!supabase) {
      setError('Supabase ist nicht konfiguriert');
      setLoading(false);
      return;
    }

    if (!validateEmail(loginData.email)) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      setLoading(false);
      return;
    }

    if (loginData.password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;
      setSuccessMessage('Login erfolgreich!');
      setTimeout(() => onComplete(), 1000);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (!supabase) {
      setError('Supabase ist nicht konfiguriert');
      setLoading(false);
      return;
    }

    if (!validateEmail(registerData.email)) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein.');
      setLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwörter stimmen nicht überein.');
      setLoading(false);
      return;
    }

    if (registrationType === 'company' && !registerData.companyName.trim()) {
      setError('Bitte geben Sie einen Firmennamen ein.');
      setLoading(false);
      return;
    }

    if (registrationType === 'employee' && !registerData.inviteCode.trim()) {
      setError('Bitte geben Sie einen Einladungscode ein.');
      setLoading(false);
      return;
    }

    try {
      if (registrationType === 'employee') {
        const { data: codeData, error: codeError } = await supabase
          .from('company_invite_codes')
          .select('id, company_id, is_active, expires_at')
          .eq('code', registerData.inviteCode.toUpperCase())
          .eq('is_active', true)
          .maybeSingle();

        if (codeError || !codeData) {
          setError('Ungültiger oder inaktiver Einladungscode.');
          setLoading(false);
          return;
        }

        if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
          setError('Dieser Einladungscode ist abgelaufen.');
          setLoading(false);
          return;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: registerData.email,
          password: registerData.password,
        });

        if (authError) throw authError;

        if (authData.user) {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: authData.user.id,
              user_type: 'employee',
              company_id: codeData.company_id,
              invite_code_used: registerData.inviteCode.toUpperCase()
            });

          if (profileError) throw profileError;

          await supabase
            .from('company_invite_codes')
            .update({ used_count: codeData.used_count + 1 })
            .eq('id', codeData.id);
        }
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: registerData.email,
          password: registerData.password,
        });

        if (authError) throw authError;

        if (authData.user) {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .insert({
              name: registerData.companyName,
              owner_id: authData.user.id
            })
            .select()
            .single();

          if (companyError) throw companyError;

          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: authData.user.id,
              user_type: 'company_owner',
              company_id: companyData.id
            });

          if (profileError) throw profileError;
        }
      }

      setSuccessMessage('Registrierung erfolgreich! Sie sind jetzt angemeldet.');
      setTimeout(() => onComplete(), 1000);
    } catch (error: any) {
      console.error('Register error:', error);
      setError(error.message || 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SocialPlan</h1>
          <p className="text-gray-400">Verwalten Sie Ihren Social-Media-Content</p>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          {successMessage && (
            <div className="mb-6 p-4 bg-green-900/20 border border-green-500/50 rounded-lg flex items-start gap-3">
              <Check className="text-green-400 mt-1 flex-shrink-0" size={20} />
              <p className="text-green-300 text-sm">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-400 mt-1 flex-shrink-0" size={20} />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setCurrentStep('login');
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Anmelden
            </button>
            <button
              onClick={() => {
                setCurrentStep('register');
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 'register'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Registrieren
            </button>
          </div>

          {currentStep === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">E-Mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="ihre@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Passwort</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Passwort eingeben"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition-all"
              >
                {loading ? 'Wird angemeldet...' : 'Anmelden'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-3">Als was möchten Sie sich registrieren?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegistrationType('employee')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      registrationType === 'employee'
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                    }`}
                  >
                    <Users className={`mx-auto mb-2 ${registrationType === 'employee' ? 'text-blue-400' : 'text-gray-400'}`} size={24} />
                    <span className={`text-sm font-medium ${registrationType === 'employee' ? 'text-blue-300' : 'text-gray-300'}`}>Mitarbeiter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegistrationType('company')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      registrationType === 'company'
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                    }`}
                  >
                    <Building className={`mx-auto mb-2 ${registrationType === 'company' ? 'text-blue-400' : 'text-gray-400'}`} size={24} />
                    <span className={`text-sm font-medium ${registrationType === 'company' ? 'text-blue-300' : 'text-gray-300'}`}>Unternehmen</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">E-Mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="ihre@email.com"
                  />
                </div>
              </div>

              {registrationType === 'company' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Firmenname</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 text-gray-500" size={20} />
                    <input
                      type="text"
                      value={registerData.companyName}
                      onChange={(e) => setRegisterData({ ...registerData, companyName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="Ihr Firmenname"
                    />
                  </div>
                </div>
              )}

              {registrationType === 'employee' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Einladungscode</label>
                  <div className="relative">
                    <Ticket className="absolute left-3 top-3 text-gray-500" size={20} />
                    <input
                      type="text"
                      value={registerData.inviteCode}
                      onChange={(e) => setRegisterData({ ...registerData, inviteCode: e.target.value.toUpperCase() })}
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all uppercase"
                      placeholder="XXXXXXXX"
                      maxLength={8}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Erhalten Sie den Code von Ihrem Arbeitgeber</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Passwort</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Passwort erstellen"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Passwort bestätigen</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Passwort wiederholen"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition-all"
              >
                {loading ? 'Wird registriert...' : 'Registrieren'}
              </button>
            </form>
          )}

          <p className="text-center text-gray-400 text-xs mt-6">
            Durch die Anmeldung akzeptieren Sie unsere Datenschutzrichtlinie
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
