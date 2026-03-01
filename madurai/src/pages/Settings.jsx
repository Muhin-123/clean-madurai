import { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // Kept motion import as it is used in motion.div
import {
  Bell, Moon, Sun, Globe, Shield, Database,
  Smartphone, Save, RefreshCw, CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getNotificationPermission, requestNotificationPermission, showLocalNotification } from '../utils/notifications';

function ToggleSwitch({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-civic-green shadow-glow' : 'bg-gray-200 dark:bg-white/10'}`}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function SettingSection({ title, icon: Icon, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 mb-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-civic-green/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-civic-green" />
        </div>
        <h2 className="font-semibold text-gray-800 dark:text-white text-sm">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

function SettingRow({ label, desc, right }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      {right}
    </div>
  );
}

export default function Settings() {
  const { darkMode, toggleDarkMode } = useApp();
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    pushNotifications: getNotificationPermission() === 'granted',
    criticalAlerts: true,
    emailReports: false,
    smsAlerts: true,
    autoRefresh: true,
    offlineMode: true,
    language: 'English',
    theme: darkMode ? 'Dark' : 'Light',
    dataRetention: '90 days',
    twoFactor: false,
  });

  useEffect(() => {
    // Sync notification status on mount
    setSettings(s => ({ ...s, pushNotifications: getNotificationPermission() === 'granted' }));
  }, []);

  const toggle = async (key) => {
    if (key === 'pushNotifications') {
      const currentStatus = getNotificationPermission();
      if (currentStatus !== 'granted') {
        const result = await requestNotificationPermission();
        if (result === 'granted') {
          setSettings(s => ({ ...s, [key]: true }));
          showLocalNotification('Notifications Enabled', { body: 'You will now receive alerts from Clean Madurai.' });
        } else {
          setSettings(s => ({ ...s, [key]: false }));
        }
        return;
      }
    }
    setSettings(s => ({ ...s, [key]: !s[key] }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Configure dashboard preferences and notifications</p>
        </div>
        <button onClick={handleSave} className={`btn-primary flex items-center gap-2 ${saved ? 'from-civic-green to-emerald-600' : ''}`}>
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-6">
        <div>
          <SettingSection title="Notifications" icon={Bell}>
            <SettingRow label="Push Notifications" desc="Receive alerts in browser" right={<ToggleSwitch enabled={settings.pushNotifications} onChange={() => toggle('pushNotifications')} />} />
            <SettingRow label="Critical Bin Alerts" desc="Notify when bins exceed 80%" right={<ToggleSwitch enabled={settings.criticalAlerts} onChange={() => toggle('criticalAlerts')} />} />
            <SettingRow label="Email Reports" desc="Daily summary via email" right={<ToggleSwitch enabled={settings.emailReports} onChange={() => toggle('emailReports')} />} />
            <SettingRow label="SMS Alerts" desc="Critical alerts via SMS" right={<ToggleSwitch enabled={settings.smsAlerts} onChange={() => toggle('smsAlerts')} />} />
          </SettingSection>

          <SettingSection title="Appearance" icon={darkMode ? Moon : Sun}>
            <SettingRow
              label="Dark Mode"
              desc="Switch between light and dark theme"
              right={<ToggleSwitch enabled={darkMode} onChange={toggleDarkMode} />}
            />
            <SettingRow
              label="Language"
              desc="Interface language"
              right={
                <select className="text-sm bg-transparent text-civic-green dark:text-civic-green font-medium border-none outline-none cursor-pointer"
                  value={settings.language} onChange={e => setSettings(s => ({ ...s, language: e.target.value }))}>
                  <option>English</option>
                  <option>Tamil</option>
                  <option>Hindi</option>
                </select>
              }
            />
          </SettingSection>

          <SettingSection title="Security" icon={Shield}>
            <SettingRow label="Two-Factor Authentication" desc="Extra security for your account" right={<ToggleSwitch enabled={settings.twoFactor} onChange={() => toggle('twoFactor')} />} />
            <SettingRow
              label="Session Timeout"
              desc="Auto logout after inactivity"
              right={
                <select className="text-sm bg-transparent text-civic-green dark:text-civic-green font-medium border-none outline-none cursor-pointer">
                  <option>30 min</option>
                  <option>1 hour</option>
                  <option>4 hours</option>
                  <option>Never</option>
                </select>
              }
            />
          </SettingSection>
        </div>

        <div>
          <SettingSection title="Dashboard & Data" icon={Database}>
            <SettingRow label="Auto Refresh" desc="Update data every 30 seconds" right={<ToggleSwitch enabled={settings.autoRefresh} onChange={() => toggle('autoRefresh')} />} />
            <SettingRow label="Offline Mode" desc="Cache data for offline access" right={<ToggleSwitch enabled={settings.offlineMode} onChange={() => toggle('offlineMode')} />} />
            <SettingRow
              label="Data Retention"
              desc="How long to keep complaint data"
              right={
                <select className="text-sm bg-transparent text-civic-green dark:text-civic-green font-medium border-none outline-none cursor-pointer"
                  value={settings.dataRetention} onChange={e => setSettings(s => ({ ...s, dataRetention: e.target.value }))}>
                  <option>30 days</option>
                  <option>90 days</option>
                  <option>1 year</option>
                  <option>Forever</option>
                </select>
              }
            />
          </SettingSection>

          <SettingSection title="PWA & Mobile" icon={Smartphone}>
            <SettingRow label="Install App" desc="Add to home screen as PWA" right={
              <button className="text-xs px-3 py-1.5 rounded-lg bg-civic-green/10 text-civic-green dark:bg-civic-green/10 dark:text-civic-green font-medium">
                Install
              </button>
            } />
            <SettingRow label="App Version" right={<span className="text-xs font-mono text-gray-500 dark:text-gray-400">v1.0.0</span>} />
            <SettingRow label="Clear Cache" right={
              <button className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 flex items-center gap-1 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                <RefreshCw className="w-3 h-3" /> Clear
              </button>
            } />
          </SettingSection>

          <div className="glass-card p-5">
            <h2 className="font-semibold text-gray-800 dark:text-white text-sm mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-civic-green dark:text-civic-green" /> System Information
            </h2>
            {[
              { label: 'City', value: 'Madurai, Tamil Nadu' },
              { label: 'Authority', value: 'Madurai Smart City Limited' },
              { label: 'API Status', value: '● Online', valueClass: 'text-civic-green' },
              { label: 'Last Sync', value: 'Just now' },
              { label: 'Total Wards', value: '15' },
              { label: 'Active Bins', value: '142 / 150' },
            ].map(({ label, value, valueClass }) => (
              <div key={label} className="flex justify-between py-2 text-xs border-b border-white/5 last:border-0">
                <span className="text-gray-500 dark:text-gray-400">{label}</span>
                <span className={`font-semibold text-gray-800 dark:text-white ${valueClass || ''}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
