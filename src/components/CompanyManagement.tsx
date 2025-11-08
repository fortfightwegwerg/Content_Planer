import React, { useState, useEffect } from 'react';
import { Building, Users, Plus, Copy, Check, RefreshCw, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../hooks/useSupabase';

const CompanyManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [inviteCodes, setInviteCodes] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingChannelId, setEditingChannelId] = useState(false);
  const [channelIdInput, setChannelIdInput] = useState('');

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      if (!supabase) {
        setError('Supabase ist nicht konfiguriert');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (companyError) throw companyError;
      setCompany(companyData);
      setChannelIdInput(companyData?.youtube_channel_id || '');

      if (companyData) {
        const { data: codesData, error: codesError } = await supabase
          .from('company_invite_codes')
          .select('*')
          .eq('company_id', companyData.id)
          .order('created_at', { ascending: false });

        if (codesError) throw codesError;
        setInviteCodes(codesData || []);

        const { data: employeesData, error: employeesError } = await supabase
          .from('user_profiles')
          .select('id, user_type, invite_code_used, created_at, email')
          .eq('company_id', companyData.id)
          .eq('user_type', 'employee');

        if (employeesError) throw employeesError;

        setEmployees(employeesData || []);
      }
    } catch (error: any) {
      console.error('Error loading company data:', error);
      setError('Fehler beim Laden der Unternehmensdaten');
    } finally {
      setLoading(false);
    }
  };

  const generateInviteCode = async () => {
    try {
      if (!supabase || !company) return;

      setError('');
      setSuccessMessage('');

      const { data, error } = await supabase.rpc('generate_company_code');

      if (error) throw error;

      const newCode = data;

      const { error: insertError } = await supabase
        .from('company_invite_codes')
        .insert({
          company_id: company.id,
          code: newCode,
          is_active: true
        });

      if (insertError) throw insertError;

      setSuccessMessage('Neuer Einladungscode wurde erstellt!');
      loadCompanyData();
    } catch (error: any) {
      console.error('Error generating invite code:', error);
      setError('Fehler beim Erstellen des Einladungscodes');
    }
  };

  const toggleCodeStatus = async (codeId: string, currentStatus: boolean) => {
    try {
      if (!supabase) return;

      const { error } = await supabase
        .from('company_invite_codes')
        .update({ is_active: !currentStatus })
        .eq('id', codeId);

      if (error) throw error;

      setSuccessMessage(`Code ${!currentStatus ? 'aktiviert' : 'deaktiviert'}`);
      loadCompanyData();
    } catch (error: any) {
      console.error('Error toggling code status:', error);
      setError('Fehler beim Ändern des Code-Status');
    }
  };

  const deleteCode = async (codeId: string) => {
    if (!confirm('Möchten Sie diesen Code wirklich löschen?')) return;

    try {
      if (!supabase) return;

      const { error } = await supabase
        .from('company_invite_codes')
        .delete()
        .eq('id', codeId);

      if (error) throw error;

      setSuccessMessage('Code wurde gelöscht');
      loadCompanyData();
    } catch (error: any) {
      console.error('Error deleting code:', error);
      setError('Fehler beim Löschen des Codes');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const saveChannelId = async () => {
    try {
      if (!supabase || !company) return;

      setError('');
      setSuccessMessage('');

      const { error } = await supabase
        .from('companies')
        .update({ youtube_channel_id: channelIdInput.trim() || null })
        .eq('id', company.id);

      if (error) throw error;

      setSuccessMessage('YouTube Kanal-ID wurde gespeichert');
      setEditingChannelId(false);
      loadCompanyData();
    } catch (error: any) {
      console.error('Error saving channel ID:', error);
      setError('Fehler beim Speichern der Kanal-ID');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Lädt...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Sie sind kein Unternehmensbesitzer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Unternehmensverwaltung</h2>
        <p className="text-gray-600">Verwalten Sie Ihr Team und Einladungscodes</p>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Check className="text-green-600 mt-0.5 flex-shrink-0" size={20} />
          <p className="text-green-800 text-sm">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{company.name}</h3>
            <p className="text-sm text-gray-500">Firmeninformationen</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">YouTube Kanal-ID</label>
            {!editingChannelId && (
              <button
                onClick={() => setEditingChannelId(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Bearbeiten
              </button>
            )}
          </div>

          {editingChannelId ? (
            <div className="space-y-3">
              <input
                type="text"
                value={channelIdInput}
                onChange={(e) => setChannelIdInput(e.target.value)}
                placeholder="UCxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveChannelId}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Speichern
                </button>
                <button
                  onClick={() => {
                    setEditingChannelId(false);
                    setChannelIdInput(company?.youtube_channel_id || '');
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-800 font-mono">
                {company.youtube_channel_id || 'Nicht konfiguriert'}
              </p>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Diese Kanal-ID wird für YouTube Analytics und andere YouTube-Funktionen verwendet.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="text-blue-600" size={24} />
            <div>
              <h3 className="font-semibold text-gray-800">Einladungscodes</h3>
              <p className="text-sm text-gray-500">Erstellen Sie Codes für neue Mitarbeiter</p>
            </div>
          </div>
          <button
            onClick={generateInviteCode}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={20} />
            Neuer Code
          </button>
        </div>

        {inviteCodes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Keine Einladungscodes vorhanden. Erstellen Sie einen neuen Code.
          </div>
        ) : (
          <div className="space-y-3">
            {inviteCodes.map((code) => (
              <div
                key={code.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <div className="font-mono text-lg font-bold text-gray-800">{code.code}</div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Verwendet: {code.used_count}x</span>
                    <span className={`px-2 py-1 rounded ${
                      code.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-300 text-gray-700'
                    }`}>
                      {code.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(code.code)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Code kopieren"
                  >
                    {copiedCode === code.code ? (
                      <Check className="text-green-600" size={20} />
                    ) : (
                      <Copy className="text-gray-600" size={20} />
                    )}
                  </button>
                  <button
                    onClick={() => toggleCodeStatus(code.id, code.is_active)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title={code.is_active ? 'Deaktivieren' : 'Aktivieren'}
                  >
                    <RefreshCw className="text-gray-600" size={20} />
                  </button>
                  <button
                    onClick={() => deleteCode(code.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Code löschen"
                  >
                    <Trash2 className="text-red-600" size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="text-blue-600" size={24} />
          <div>
            <h3 className="font-semibold text-gray-800">Mitarbeiter</h3>
            <p className="text-sm text-gray-500">{employees.length} Mitarbeiter registriert</p>
          </div>
        </div>

        {employees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Noch keine Mitarbeiter registriert.
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div>
                  <div className="font-medium text-gray-800">{employee.email}</div>
                  <div className="text-sm text-gray-500">
                    Code: {employee.invite_code_used} • Beigetreten: {new Date(employee.created_at).toLocaleDateString('de-DE')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyManagement;
