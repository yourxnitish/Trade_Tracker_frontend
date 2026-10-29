import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsApi } from '../services/api';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    initialBalance: '100000.00',
    currency: 'INR',
    currencySymbol: '₹',
    dateFormat: 'YYYY-MM-DD',
    theme: 'light',
    traderName: 'Trader',
  });
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const res = await settingsApi.getSettings();
      if (res.data) {
        setSettings(prev => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.warn('Failed to load settings, using defaults', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSettings = async (newSettings) => {
    try {
      const res = await settingsApi.updateSettings(newSettings);
      setSettings(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to update settings', err);
      throw err;
    }
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined || isNaN(val)) return `${settings.currencySymbol || '₹'}0.00`;
    const num = Number(val);
    const sign = num < 0 ? '-' : '';
    const abs = Math.abs(num).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${sign}${settings.currencySymbol || '₹'}${abs}`;
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, formatCurrency, reloadSettings: loadSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
