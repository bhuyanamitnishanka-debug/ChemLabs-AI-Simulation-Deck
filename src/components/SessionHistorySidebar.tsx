import React from 'react';
import {
  History,
  X,
  RotateCcw,
  Check,
  Trash2,
  Thermometer,
  Gauge,
  Flame,
  Snowflake,
  Compass,
  ArrowRight,
  FlaskConical,
} from 'lucide-react';
import { ExperimentHistoryItem, ReactionModifiers, ChemicalReactant } from '../types/chemlab';

interface SessionHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: ExperimentHistoryItem[];
  onRevert: (item: ExperimentHistoryItem) => void;
  onClearHistory: () => void;
  currentModifiers: ReactionModifiers;
  currentReactants: ChemicalReactant[];
}

export const SessionHistorySidebar: React.FC<SessionHistorySidebarProps> = ({
  isOpen,
  onClose,
  history,
  onRevert,
  onClearHistory,
  currentModifiers,
  currentReactants,
}) => {
  if (!isOpen) return null;

  // Helper to determine if an item is currently active
  const isCurrentConfig = (item: ExperimentHistoryItem) => {
    if (item.modifiers.temperature_c !== currentModifiers.temperature_c) return false;
    if (item.modifiers.pressure_atm !== currentModifiers.pressure_atm) return false;
    if (item.reactants.length !== currentReactants.length) return false;
    return item.reactants.every(
      (r, i) =>
        r.name === currentReactants[i]?.name &&
        r.amount_ml === currentReactants[i]?.amount_ml &&
        r.concentration === currentReactants[i]?.concentration
    );
  };

  const industryIcons: Record<string, string> = {
    Pharma: '💊',
    Metallurgy: '⚙️',
    Academic: '🔬',
    Petrochemical: '⛽',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-[#090e1a] shadow-2xl transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <History className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Session History</h3>
                <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-cyan-400">
                  {history.length}/5
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tracks the last 5 simulated experiments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                title="Clear all session history"
                className="flex items-center gap-1 rounded-md border border-slate-800 px-2 py-1 text-[11px] text-slate-400 hover:border-rose-900/60 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {history.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-slate-800 bg-slate-950/40">
              <FlaskConical className="h-8 w-8 text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-300">No Experiment History Yet</p>
              <p className="mt-1 text-[11px] text-slate-500 max-w-[220px]">
                Run a simulation or load an industry preset. Your last 5 experiments will automatically appear here.
              </p>
            </div>
          ) : (
            history.map((item, index) => {
              const active = isCurrentConfig(item);
              const isExo = item.simulationData.thermo_output.toLowerCase().includes('exothermic');

              return (
                <div
                  key={item.id}
                  className={`group relative flex flex-col rounded-xl border p-3.5 transition-all ${
                    active
                      ? 'border-cyan-500/60 bg-cyan-950/20 shadow-md shadow-cyan-500/10'
                      : 'border-slate-800/90 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  {/* Top Bar: Order badge, Industry, Timestamp */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-mono font-bold text-slate-300">
                        #{index + 1}
                      </span>
                      <span className="rounded bg-slate-800/90 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
                        {industryIcons[item.industry] || '🔬'} {item.industry}
                      </span>
                      {active && (
                        <span className="flex items-center gap-1 rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/40">
                          <Check className="h-2.5 w-2.5" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                      <span>{item.relativeTime || item.timestamp}</span>
                    </div>
                  </div>

                  {/* Reaction Formula Title */}
                  <div className="mt-2.5">
                    <p className="font-mono text-xs font-semibold text-white leading-snug line-clamp-2">
                      {item.simulationData.balanced_equation}
                    </p>
                  </div>

                  {/* Reactants Preview */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.reactants.map((r, rIdx) => (
                      <span
                        key={rIdx}
                        className="inline-flex items-center rounded-md bg-slate-950/80 px-2 py-0.5 font-mono text-[10px] text-slate-300 border border-slate-800/60"
                      >
                        {r.name} ({r.concentration}, {r.amount_ml}ml)
                      </span>
                    ))}
                  </div>

                  {/* Modifiers & Output Badges */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60 pt-2 text-[11px]">
                    <div className="flex items-center gap-2">
                      {/* Temp */}
                      <span className="flex items-center gap-1 font-mono text-amber-400">
                        <Thermometer className="h-3 w-3" />
                        <span>{item.modifiers.temperature_c}°C</span>
                      </span>

                      {/* Pressure */}
                      <span className="flex items-center gap-1 font-mono text-blue-400">
                        <Gauge className="h-3 w-3" />
                        <span>{item.modifiers.pressure_atm}atm</span>
                      </span>

                      {/* Vessel */}
                      <span className="flex items-center gap-1 font-mono text-cyan-400">
                        <Compass className="h-3 w-3" />
                        <span>{item.simulationData.cad_parameters.reactor_vessel_type}</span>
                      </span>
                    </div>

                    {/* Thermo output chip */}
                    <span
                      className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        isExo
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                          : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                      }`}
                    >
                      {isExo ? <Flame className="h-2.5 w-2.5" /> : <Snowflake className="h-2.5 w-2.5" />}
                      <span className="truncate max-w-[120px]">
                        {item.simulationData.thermo_output}
                      </span>
                    </span>
                  </div>

                  {/* Revert Action Button */}
                  <div className="mt-3">
                    <button
                      onClick={() => onRevert(item)}
                      disabled={active}
                      className={`flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                        active
                          ? 'bg-slate-800/40 text-slate-500 cursor-default'
                          : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 hover:border-cyan-400 shadow-sm'
                      }`}
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>{active ? 'Current Configuration' : 'Revert to This Setup'}</span>
                      {!active && <ArrowRight className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info note */}
        <div className="border-t border-slate-800/80 bg-slate-950/80 px-4 py-3 text-[11px] text-slate-400">
          <p>
            Reverting instantly restores all reactant quantities, temperatures, pressures, and AutoCAD dimensional profiles.
          </p>
        </div>
      </div>
    </div>
  );
};
