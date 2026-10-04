import React from 'react';
import {
  Plus,
  Trash2,
  Sliders,
  Thermometer,
  Gauge,
  Sparkles,
  BookOpen,
  FlaskConical,
  Scale,
} from 'lucide-react';
import {
  ChemicalReactant,
  ReactionModifiers,
  IndustryType,
  IndustryPreset,
  ReactantUnit,
} from '../types/chemlab';
import { INDUSTRY_PRESETS } from '../data/industryPresets';
import {
  standardizeToVolumeMl,
  convertReactantAmount,
  getChemicalDensity,
  getChemicalMolarMass,
} from '../utils/unitConverter';

interface ReactantFormProps {
  industry: IndustryType;
  reactants: ChemicalReactant[];
  setReactants: React.Dispatch<React.SetStateAction<ChemicalReactant[]>>;
  modifiers: ReactionModifiers;
  setModifiers: React.Dispatch<React.SetStateAction<ReactionModifiers>>;
  onLoadPreset: (preset: IndustryPreset) => void;
  onSimulate: () => void;
  isSimulating: boolean;
}

export const ReactantForm: React.FC<ReactantFormProps> = ({
  industry,
  reactants,
  setReactants,
  modifiers,
  setModifiers,
  onLoadPreset,
  onSimulate,
  isSimulating,
}) => {
  const currentPresets = INDUSTRY_PRESETS.filter((p) => p.industry === industry);

  // Total volumetric sum passed to the reactor canvas
  const totalVolumeMl = reactants.reduce((sum, r) => sum + (Number(r.amount_ml) || 0), 0);

  const handleAddReactant = () => {
    setReactants([
      ...reactants,
      {
        name: 'New Chemical Reagent',
        concentration: '1.0M',
        amount_ml: 100,
        unit: 'ml',
        amount_input: 100,
      },
    ]);
  };

  const handleRemoveReactant = (index: number) => {
    if (reactants.length <= 1) return;
    setReactants(reactants.filter((_, i) => i !== index));
  };

  // Change amount input value and recompute volumetric mL using standardized physical chemical density lookup
  const handleAmountChange = (index: number, newAmountVal: number) => {
    const updated = [...reactants];
    const r = updated[index];
    const unit: ReactantUnit = r.unit || 'ml';
    const conv = standardizeToVolumeMl(newAmountVal, unit, r.name, r.concentration);

    updated[index] = {
      ...r,
      amount_input: newAmountVal,
      amount_ml: conv.volumeMl,
    };
    setReactants(updated);
  };

  // Change unit toggle (ml | g | mol) and smoothly recompute volumetric mL and input amount
  const handleUnitToggle = (index: number, newUnit: ReactantUnit) => {
    const updated = [...reactants];
    const r = updated[index];
    const currentUnit: ReactantUnit = r.unit || 'ml';
    const currentInputVal =
      r.amount_input !== undefined ? r.amount_input : r.amount_ml;

    const conversion = convertReactantAmount(
      currentInputVal,
      currentUnit,
      newUnit,
      r.name,
      r.concentration
    );

    updated[index] = {
      ...r,
      unit: newUnit,
      amount_input: conversion.convertedAmount,
      amount_ml: conversion.volumeMl,
    };
    setReactants(updated);
  };

  // Change reactant name or concentration and update calculation if using g or mol
  const handleReactantChange = (
    index: number,
    field: 'name' | 'concentration',
    value: string
  ) => {
    const updated = [...reactants];
    const r = { ...updated[index], [field]: value };
    const unit: ReactantUnit = r.unit || 'ml';
    const currentInputVal =
      r.amount_input !== undefined ? r.amount_input : r.amount_ml;

    if (unit !== 'ml') {
      const conv = standardizeToVolumeMl(
        currentInputVal,
        unit,
        field === 'name' ? value : r.name,
        field === 'concentration' ? value : r.concentration
      );
      r.amount_ml = conv.volumeMl;
    }

    updated[index] = r;
    setReactants(updated);
  };

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
      {/* Preset Selector Bar */}
      <div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
            <span>{industry} Reaction Presets</span>
          </label>
          <span className="text-[11px] text-slate-400">{currentPresets.length} recipes</span>
        </div>

        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {currentPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onLoadPreset(preset)}
              className="flex flex-col items-start rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-left transition-all hover:border-cyan-500/50 hover:bg-slate-900/80"
            >
              <div className="flex w-full items-center justify-between">
                <span className="font-semibold text-xs text-white truncate">{preset.name}</span>
                <span className="rounded bg-cyan-950 px-1.5 py-0.5 text-[10px] text-cyan-400 font-mono">
                  {preset.expectedOutput.cad_parameters.reactor_vessel_type}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-800/80 pt-4">
        {/* Reactants Matrix */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <FlaskConical className="h-4 w-4 text-cyan-400" />
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Reactants Matrix (Chemicals & Quantities)
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
              <span>Total Volume:</span>
              <span className="font-bold">{totalVolumeMl.toFixed(1)} mL</span>
            </span>

            <button
              onClick={handleAddReactant}
              className="flex items-center gap-1 rounded-md border border-cyan-500/40 bg-cyan-950/40 px-2.5 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-900/50"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Chemical</span>
            </button>
          </div>
        </div>

        <div className="mt-3 space-y-2.5">
          {reactants.map((reactant, idx) => {
            const currentUnit: ReactantUnit = reactant.unit || 'ml';
            const currentInputAmount =
              reactant.amount_input !== undefined ? reactant.amount_input : reactant.amount_ml;
            const conv = standardizeToVolumeMl(
              currentInputAmount,
              currentUnit,
              reactant.name,
              reactant.concentration
            );

            return (
              <div
                key={idx}
                className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/90 p-3 transition-all hover:border-slate-700"
              >
                <div className="flex flex-wrap items-center gap-2.5 sm:flex-nowrap">
                  {/* Substance Name */}
                  <div className="flex-1 min-w-[140px]">
                    <label className="text-[10px] text-slate-400 font-mono">
                      Substance Name/Formula
                    </label>
                    <input
                      type="text"
                      value={reactant.name}
                      onChange={(e) => handleReactantChange(idx, 'name', e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="e.g., Hydrochloric Acid (HCl)"
                    />
                  </div>

                  {/* Concentration */}
                  <div className="w-28">
                    <label className="text-[10px] text-slate-400 font-mono">Concentration</label>
                    <input
                      type="text"
                      value={reactant.concentration}
                      onChange={(e) => handleReactantChange(idx, 'concentration', e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="e.g., 2M or 98%"
                    />
                  </div>

                  {/* Amount & Unit Selector: Dropdown & Radio Toggle */}
                  <div className="min-w-[240px]">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-slate-400 font-mono">Amount & Unit</label>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                        {currentUnit === 'ml' ? 'Volume (ml)' : currentUnit === 'g' ? 'Mass (g)' : 'Molar (mol)'}
                      </span>
                    </div>

                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 p-1">
                      {/* Amount Numeric Input */}
                      <input
                        type="number"
                        step={currentUnit === 'mol' ? '0.01' : '1'}
                        min="0.001"
                        max="10000"
                        value={currentInputAmount}
                        onChange={(e) =>
                          handleAmountChange(idx, parseFloat(e.target.value) || 0)
                        }
                        className="w-20 rounded bg-slate-950 px-2 py-1 text-xs font-mono font-medium text-white border border-slate-800 focus:border-cyan-500 focus:outline-none"
                      />

                      {/* Dropdown Selector */}
                      <select
                        value={currentUnit}
                        onChange={(e) => handleUnitToggle(idx, e.target.value as ReactantUnit)}
                        className="rounded border border-slate-800 bg-slate-950 px-1.5 py-1 text-xs font-mono font-semibold text-cyan-300 focus:border-cyan-500 focus:outline-none cursor-pointer"
                        title="Dropdown: Select Unit (ml, g, mol)"
                      >
                        <option value="ml">ml (Volume)</option>
                        <option value="g">g (Mass)</option>
                        <option value="mol">mol (Moles)</option>
                      </select>

                      {/* Radio Toggle Group */}
                      <div className="flex items-center gap-0.5 rounded-md bg-slate-950 p-0.5 border border-slate-800">
                        {(['ml', 'g', 'mol'] as ReactantUnit[]).map((u) => {
                          const isSelected = currentUnit === u;
                          return (
                            <label
                              key={u}
                              className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono font-bold cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`unit-radio-${idx}`}
                                value={u}
                                checked={isSelected}
                                onChange={() => handleUnitToggle(idx, u)}
                                className="h-2.5 w-2.5 accent-cyan-400 cursor-pointer"
                              />
                              <span>{u}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Remove reactant button */}
                  {reactants.length > 1 && (
                    <button
                      onClick={() => handleRemoveReactant(idx)}
                      className="mt-3.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-rose-900/50 bg-rose-950/30 text-rose-400 hover:bg-rose-900/40 transition-colors"
                      title="Remove Reactant"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Conversion explanation & dynamic volumetric readout */}
                <div className="flex items-center justify-between gap-2 border-t border-slate-900 pt-1.5 text-[10px]">
                  <div className="flex items-center gap-1.5 font-mono text-slate-400">
                    <Scale className="h-3 w-3 text-cyan-400" />
                    <span>Reactor Volumetric Load:</span>
                    <span className="font-bold text-cyan-300">
                      {reactant.amount_ml.toFixed(1)} mL
                    </span>
                    {currentUnit !== 'ml' && (
                      <span className="text-slate-500 italic">({conv.explanation})</span>
                    )}
                  </div>

                  <span className="rounded bg-slate-900 px-1.5 py-0.2 text-[9px] font-mono text-slate-400 border border-slate-800">
                    {((reactant.amount_ml / (totalVolumeMl || 1)) * 100).toFixed(0)}% batch
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Environmental Modifiers (Temperature, Pressure, Catalyst) */}
      <div className="border-t border-slate-800/80 pt-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Sliders className="h-4 w-4 text-cyan-400" />
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
            Environmental Modifiers
          </h4>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Temperature Slider */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-slate-300">
                <Thermometer className="h-3.5 w-3.5 text-amber-400" />
                <span>Temperature:</span>
              </span>
              <span className="font-mono text-xs font-bold text-amber-400">
                {modifiers.temperature_c} °C
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="1200"
              value={modifiers.temperature_c}
              onChange={(e) =>
                setModifiers({ ...modifiers, temperature_c: parseInt(e.target.value, 10) })
              }
              className="mt-2 w-full accent-amber-500 cursor-pointer"
            />
            <div className="mt-2 flex gap-1.5">
              {[25, 65, 250, 520, 980].map((t) => (
                <button
                  key={t}
                  onClick={() => setModifiers({ ...modifiers, temperature_c: t })}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-mono transition-colors ${
                    modifiers.temperature_c === t
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}°
                </button>
              ))}
            </div>
          </div>

          {/* Pressure Slider */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-slate-300">
                <Gauge className="h-3.5 w-3.5 text-blue-400" />
                <span>Pressure:</span>
              </span>
              <span className="font-mono text-xs font-bold text-blue-400">
                {modifiers.pressure_atm} atm
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="250"
              step="0.5"
              value={modifiers.pressure_atm}
              onChange={(e) =>
                setModifiers({ ...modifiers, pressure_atm: parseFloat(e.target.value) })
              }
              className="mt-2 w-full accent-blue-500 cursor-pointer"
            />
            <div className="mt-2 flex gap-1.5">
              {[1.0, 2.5, 10.0, 50.0, 200.0].map((p) => (
                <button
                  key={p}
                  onClick={() => setModifiers({ ...modifiers, pressure_atm: p })}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-mono transition-colors ${
                    modifiers.pressure_atm === p
                      ? 'bg-blue-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p} atm
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Catalyst Optional */}
        <div className="mt-3">
          <label className="text-[10px] text-slate-400 font-mono">Catalytic Agent (Optional)</label>
          <input
            type="text"
            value={modifiers.catalyst || ''}
            onChange={(e) => setModifiers({ ...modifiers, catalyst: e.target.value })}
            placeholder="e.g. Zeolite ZSM-5, H2SO4, Promoted Magnetite Fe, or None"
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Execute Button */}
      <button
        onClick={onSimulate}
        disabled={isSimulating}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:opacity-95 hover:shadow-cyan-500/40 disabled:opacity-50"
      >
        {isSimulating ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Computing ChemMatrix & AutoCAD Vector Scales...</span>
          </span>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            <span>Process Simulation Deck & Generate Blueprint</span>
          </>
        )}
      </button>
    </div>
  );
};
