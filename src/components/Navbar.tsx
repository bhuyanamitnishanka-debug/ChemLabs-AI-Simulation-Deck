import React from 'react';
import {
  FlaskConical,
  Compass,
  FileCode2,
  Volume2,
  VolumeX,
  Download,
  RotateCcw,
  Sparkles,
  History,
  FileText,
} from 'lucide-react';
import { IndustryType } from '../types/chemlab';

interface NavbarProps {
  currentIndustry: IndustryType;
  onSelectIndustry: (ind: IndustryType) => void;
  activeTab: 'simulation' | 'cad' | 'json' | 'safety';
  setActiveTab: (tab: 'simulation' | 'cad' | 'json' | 'safety') => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onReset: () => void;
  onDownloadDXF: () => void;
  isSimulating: boolean;
  onRunSimulation: () => void;
  onToggleHistory: () => void;
  historyCount: number;
  onOpenReportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentIndustry,
  onSelectIndustry,
  activeTab,
  setActiveTab,
  isMuted,
  onToggleMute,
  onReset,
  onDownloadDXF,
  isSimulating,
  onRunSimulation,
  onToggleHistory,
  historyCount,
  onOpenReportModal,
}) => {
  const industries: { id: IndustryType; label: string; icon: string }[] = [
    { id: 'Pharma', label: 'Pharma', icon: '💊' },
    { id: 'Metallurgy', label: 'Metallurgy', icon: '⚙️' },
    { id: 'Academic', label: 'Academic', icon: '🔬' },
    { id: 'Petrochemical', label: 'Petrochemical', icon: '⛽' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand & Core Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-lg shadow-cyan-500/20">
            <FlaskConical className="h-5 w-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
                ChemLabs<span className="text-cyan-400">-AI</span>
              </h1>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Sim Deck
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">
              Cross-Industry Chemistry Orchestration & AutoCAD Blueprint Core
            </p>
          </div>
        </div>

        {/* Industry Pill Selector */}
        <div className="hidden items-center rounded-lg border border-slate-800 bg-slate-900/80 p-1 md:flex">
          {industries.map((ind) => {
            const isSelected = currentIndustry === ind.id;
            return (
              <button
                key={ind.id}
                onClick={() => onSelectIndustry(ind.id)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{ind.icon}</span>
                <span>{ind.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute lab bubbling sound' : 'Mute lab audio'}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-slate-400" /> : <Volume2 className="h-4 w-4 text-cyan-400 animate-pulse" />}
          </button>

          {/* Quick DXF Export */}
          <button
            onClick={onDownloadDXF}
            title="Download AutoCAD DXF Blueprint"
            className="hidden items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3 py-1.5 text-xs font-medium text-cyan-300 transition-all hover:bg-cyan-900/50 hover:border-cyan-400 sm:flex"
          >
            <Download className="h-3.5 w-3.5" />
            <span>AutoCAD .DXF</span>
          </button>

          {/* Official PDF Lab Record Export */}
          <button
            onClick={onOpenReportModal}
            title="Generate & Print GLP Laboratory Experiment Record PDF"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-all hover:border-cyan-500/50 hover:bg-slate-800 hover:text-cyan-300"
          >
            <FileText className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">PDF Report</span>
          </button>

          {/* Session History Trigger Button */}
          <button
            onClick={onToggleHistory}
            title="Open Session History (Tracks last 5 experiments)"
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
          >
            <History className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">History</span>
            <span className="flex items-center justify-center rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono font-bold text-cyan-400 border border-slate-700">
              {historyCount}
            </span>
          </button>

          {/* Reset button */}
          <button
            onClick={onReset}
            title="Reset Simulation Deck"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Execute Simulation CTA */}
          <button
            onClick={onRunSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/40 disabled:opacity-50"
          >
            {isSimulating ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Simulating...</span>
              </span>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Run Matrix</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-t border-slate-800/80 bg-slate-950/50 px-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <nav className="flex space-x-1 py-1.5">
            <button
              onClick={() => setActiveTab('simulation')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === 'simulation'
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FlaskConical className="h-3.5 w-3.5" />
              <span>Live Reactor Simulation</span>
            </button>

            <button
              onClick={() => setActiveTab('cad')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === 'cad'
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>AutoCAD Blueprint & CAD Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === 'json'
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode2 className="h-3.5 w-3.5" />
              <span>Raw JSON Orchestrator Payload</span>
            </button>
          </nav>

          {/* Mobile Industry Switch */}
          <div className="flex md:hidden">
            <select
              value={currentIndustry}
              onChange={(e) => onSelectIndustry(e.target.value as IndustryType)}
              className="rounded bg-slate-900 border border-slate-800 px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {industries.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  {ind.icon} {ind.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
