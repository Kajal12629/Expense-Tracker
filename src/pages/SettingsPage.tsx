import React, { useState, useEffect, useRef } from 'react';
import {
  Sun,
  Moon,
  Laptop,
  Coins,
  Palette,
  User,
  Database,
  Download,
  Upload,
  RefreshCcw,
  Trash2,
  Check,
} from 'lucide-react';
import { useFinance, ACCENT_COLOR_MAP } from '../context/FinanceContext';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ThemeMode, AccentColor, CurrencyCode } from '../types/finance';
import { CURRENCY_SYMBOLS } from '../utils/formatters';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    setTheme,
    setAccentColor,
    setCurrency,
    resetDemo,
    clearAll,
    exportData,
    importData,
    showToast,
  } = useFinance();

  const [nameInput, setNameInput] = useState(settings.userName);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNameInput(settings.userName);
  }, [settings.userName]);

  const accent = ACCENT_COLOR_MAP[settings.accentColor];

  const themeOptions: { id: ThemeMode; label: string; icon: React.ElementType }[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System Default', icon: Laptop },
  ];

  const currencyOptions: { id: CurrencyCode; label: string; desc: string }[] = [
    { id: 'INR', label: '₹ INR', desc: 'Indian Rupee (₹)' },
    { id: 'USD', label: '$ USD', desc: 'US Dollar ($)' },
    { id: 'EUR', label: '€ EUR', desc: 'Euro (€)' },
    { id: 'GBP', label: '£ GBP', desc: 'British Pound (£)' },
  ];

  const accentOptions: { id: AccentColor; label: string; hex: string }[] = [
    { id: 'emerald', label: 'Emerald Green', hex: '#10B981' },
    { id: 'indigo', label: 'Electric Indigo', hex: '#6366F1' },
    { id: 'violet', label: 'Royal Violet', hex: '#8B5CF6' },
    { id: 'amber', label: 'Sunset Amber', hex: '#F59E0B' },
    { id: 'rose', label: 'Rose Pink', hex: '#F43F5E' },
    { id: 'cyan', label: 'Ocean Cyan', hex: '#06B6D4' },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      updateSettings({ userName: nameInput.trim() });
    }
  };

  const handleExportBackup = () => {
    const dataStr = exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spendwise-complete-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Complete backup exported successfully', 'success');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importData(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
          Settings & Customization
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
          Personalize your visual experience, currency conventions, and local storage data.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="p-6 rounded-2xl glass-panel shadow-sm space-y-4 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass-subtle flex items-center justify-center text-neutral-600 dark:text-neutral-300 shadow-sm">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              User Profile
            </h3>
            <p className="text-xs text-neutral-500">Your display name for greetings and dashboard reports</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Enter your name"
            className="flex-1 px-4 py-2.5 glass-subtle rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 shadow-inner"
          />
          <button
            type="submit"
            className={`px-5 py-2.5 text-xs font-semibold text-white rounded-xl shadow-lg shadow-emerald-500/15 dark:shadow-emerald-500/10 transition-all hover:opacity-95 ${accent.primary}`}
          >
            Save Name
          </button>
        </form>
      </div>

      {/* Theme Appearance Card */}
      <div className="p-6 rounded-2xl glass-panel shadow-sm space-y-4 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass-subtle flex items-center justify-center text-neutral-600 dark:text-neutral-300 shadow-sm">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Interface Theme
            </h3>
            <p className="text-xs text-neutral-500">Choose light mode, dark mode, or sync with your operating system</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = settings.theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`p-4 rounded-xl text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'glass-card border-white/90 dark:border-white/20 shadow-md scale-[1.02]'
                    : 'glass-subtle hover:border-white/60 dark:hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">
                    {opt.label}
                  </span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Color Palette Card */}
      <div className="p-6 rounded-2xl glass-panel shadow-sm space-y-4 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass-subtle flex items-center justify-center text-neutral-600 dark:text-neutral-300 shadow-sm">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Brand Accent Color
            </h3>
            <p className="text-xs text-neutral-500">Pick your personalized primary highlight tint</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {accentOptions.map((c) => {
            const isSelected = settings.accentColor === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setAccentColor(c.id)}
                className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                  isSelected
                    ? 'glass-card border-white/90 dark:border-white/20 scale-[1.05] shadow-md ring-2 ring-emerald-500/20'
                    : 'glass-subtle hover:border-white/60 dark:hover:border-white/15'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full shadow-md ring-2 ring-white/40"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 text-center">
                  {c.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Currency Selection Card */}
      <div className="p-6 rounded-2xl glass-panel shadow-sm space-y-4 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass-subtle flex items-center justify-center text-neutral-600 dark:text-neutral-300 shadow-sm">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Base Currency
            </h3>
            <p className="text-xs text-neutral-500">All balances, transactions, and reports will adapt to this currency</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {currencyOptions.map((curr) => {
            const isSelected = settings.currency === curr.id;
            return (
              <button
                key={curr.id}
                onClick={() => setCurrency(curr.id)}
                className={`p-4 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'glass-card border-white/90 dark:border-white/20 shadow-md scale-[1.02]'
                    : 'glass-subtle hover:border-white/60 dark:hover:border-white/15'
                }`}
              >
                <div className="text-base font-bold font-mono text-neutral-900 dark:text-white mb-0.5">
                  {curr.label}
                </div>
                <div className="text-[11px] text-neutral-500">{curr.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Data Management & Backup Card */}
      <div className="p-6 rounded-2xl glass-panel shadow-sm space-y-4 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass-subtle flex items-center justify-center text-neutral-600 dark:text-neutral-300 shadow-sm">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Data Storage & Backup
            </h3>
            <p className="text-xs text-neutral-500">Your data is stored securely in your browser&apos;s LocalStorage</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Export JSON */}
          <button
            onClick={handleExportBackup}
            className="p-4 rounded-xl glass-card flex flex-col items-start gap-2 text-left"
          >
            <Download className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white">Export Backup</p>
              <p className="text-[11px] text-neutral-500">Download complete JSON dataset</p>
            </div>
          </button>

          {/* Import JSON */}
          <label className="p-4 rounded-xl glass-card flex flex-col items-start gap-2 text-left cursor-pointer">
            <Upload className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white">Restore Backup</p>
              <p className="text-[11px] text-neutral-500">Load existing JSON snapshot</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          {/* Reset Demo Data */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-4 rounded-xl glass-card flex flex-col items-start gap-2 text-left"
          >
            <RefreshCcw className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white">Reset Demo Data</p>
              <p className="text-[11px] text-neutral-500">Repopulate realistic initial dataset</p>
            </div>
          </button>

          {/* Clear All */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="p-4 rounded-xl glass-subtle border-rose-300/40 dark:border-rose-900/40 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 flex flex-col items-start gap-2 text-left transition-all"
          >
            <Trash2 className="w-5 h-5 text-rose-500" />
            <div>
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">Clear All Records</p>
              <p className="text-[11px] text-neutral-500">Erase all transactions & budgets</p>
            </div>
          </button>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={resetDemo}
        title="Reset to Demo Data?"
        message="This will replace current entries with realistic seed transactions, default category budgets, and sample savings goals."
        confirmText="Reset to Demo"
        isDestructive={false}
      />

      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={clearAll}
        title="Clear All Financial Data?"
        message="Are you sure you want to permanently erase all transactions, budgets, and savings goals? This action cannot be undone."
        confirmText="Clear All Data"
        isDestructive={true}
      />
    </div>
  );
};
