import React from 'react';
import { ShieldAlert, AlertTriangle, Eye, Sparkles, Droplets, HardHat, Flame } from 'lucide-react';
import { ReactionModifiers } from '../types/chemlab';

interface SafetyMatrixProps {
  warnings: string[];
  industry: string;
  modifiers: ReactionModifiers;
  thermoOutput: string;
}

export const SafetyMatrix: React.FC<SafetyMatrixProps> = ({
  warnings,
  industry,
  modifiers,
  thermoOutput,
}) => {
  const isHighTemp = modifiers.temperature_c > 200;
  const isHighPress = modifiers.pressure_atm > 5;
  const isExothermic = thermoOutput.toLowerCase().includes('exothermic');

  // Compute NFPA 704 ratings
  const healthRating = industry === 'Pharma' ? 2 : industry === 'Metallurgy' ? 3 : industry === 'Petrochemical' ? 3 : 2;
  const flammabilityRating = industry === 'Petrochemical' ? 4 : industry === 'Metallurgy' ? 3 : isHighTemp ? 2 : 1;
  const instabilityRating = isHighPress || (isHighTemp && isExothermic) ? 3 : 1;
  const specialSymbol = industry === 'Metallurgy' ? 'W' : industry === 'Academic' ? 'COR' : 'OX';

  return (
    <div className="flex flex-col gap-6">
      {/* Banner */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Engineering Safety & Hazard Matrix</h3>
            <p className="text-xs text-slate-400">
              OSHA • NFPA 704 Hazard Ratings • Containment & Personal Protective Protocols
            </p>
          </div>
        </div>

        <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300">
          Tier 2 Industrial Protocol Active
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Safety Warnings List */}
        <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm lg:col-span-8">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>Precise Protective Protocols</span>
          </h4>

          <div className="mt-4 space-y-3">
            {warnings.map((warning, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 text-xs transition-colors hover:border-slate-700"
              >
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px]">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-200 leading-relaxed">{warning}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mandatory PPE Checklist */}
          <div className="mt-6 border-t border-slate-800/80 pt-4">
            <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Mandatory Personal Protective Equipment (PPE)
            </h5>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <div className="flex items-center gap-2 rounded-lg bg-slate-950/80 p-2.5 text-slate-300 border border-slate-800/60">
                <Eye className="h-4 w-4 text-cyan-400" />
                <span>Splash Goggles</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-950/80 p-2.5 text-slate-300 border border-slate-800/60">
                <HardHat className="h-4 w-4 text-amber-400" />
                <span>Impact Face Shield</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-950/80 p-2.5 text-slate-300 border border-slate-800/60">
                <Droplets className="h-4 w-4 text-blue-400" />
                <span>Nitrile/Viton Gloves</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-950/80 p-2.5 text-slate-300 border border-slate-800/60">
                <Flame className="h-4 w-4 text-rose-400" />
                <span>Fume Exhaust Hood</span>
              </div>
            </div>
          </div>
        </div>

        {/* NFPA 704 Diamond & Thermal Overview */}
        <div className="flex flex-col gap-4 lg:col-span-4">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Standard NFPA 704 Hazard Diamond
            </h4>

            {/* SVG NFPA Diamond */}
            <div className="relative h-44 w-44">
              <svg viewBox="0 0 160 160" className="h-full w-full">
                {/* Red (Flammability - Top) */}
                <polygon points="80,0 120,40 80,80 40,40" fill="#ef4444" stroke="#0f172a" strokeWidth="2" />
                <text x="80" y="48" fill="#ffffff" fontSize="26" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  {flammabilityRating}
                </text>

                {/* Blue (Health - Left) */}
                <polygon points="40,40 80,80 40,120 0,80" fill="#3b82f6" stroke="#0f172a" strokeWidth="2" />
                <text x="40" y="88" fill="#ffffff" fontSize="26" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  {healthRating}
                </text>

                {/* Yellow (Instability - Right) */}
                <polygon points="120,40 160,80 120,120 80,80" fill="#eab308" stroke="#0f172a" strokeWidth="2" />
                <text x="120" y="88" fill="#000000" fontSize="26" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  {instabilityRating}
                </text>

                {/* White (Special - Bottom) */}
                <polygon points="80,80 120,120 80,160 40,120" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
                <text x="80" y="126" fill="#000000" fontSize="20" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  {specialSymbol}
                </text>
              </svg>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-center text-[11px] text-slate-400 w-full">
              <div className="rounded bg-slate-950 p-1.5 border border-slate-800">
                <span className="text-blue-400 font-semibold">Health:</span> Level {healthRating}
              </div>
              <div className="rounded bg-slate-950 p-1.5 border border-slate-800">
                <span className="text-rose-400 font-semibold">Flammability:</span> Level {flammabilityRating}
              </div>
              <div className="rounded bg-slate-950 p-1.5 border border-slate-800">
                <span className="text-amber-400 font-semibold">Instability:</span> Level {instabilityRating}
              </div>
              <div className="rounded bg-slate-950 p-1.5 border border-slate-800">
                <span className="text-slate-200 font-semibold">Special:</span> {specialSymbol}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
