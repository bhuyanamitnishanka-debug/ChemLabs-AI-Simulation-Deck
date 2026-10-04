import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ReactorCanvas } from './components/ReactorCanvas';
import { CadBlueprintViewer } from './components/CadBlueprintViewer';
import { OrchestrationConsole } from './components/OrchestrationConsole';
import { SafetyMatrix } from './components/SafetyMatrix';
import { SearchHooksPanel } from './components/SearchHooksPanel';
import { ReactantForm } from './components/ReactantForm';
import { SessionHistorySidebar } from './components/SessionHistorySidebar';
import { ReportModal } from './components/ReportModal';
import {
  IndustryType,
  ChemicalReactant,
  ReactionModifiers,
  SimulationRequestPayload,
  SimulationResponsePayload,
  IndustryPreset,
  ExperimentHistoryItem,
} from './types/chemlab';
import { INDUSTRY_PRESETS } from './data/industryPresets';
import { labAudio } from './utils/audioSynth';
import { generateAutoCAD_DXF, downloadDXFFile } from './utils/dxfGenerator';
import { standardizeToVolumeMl } from './utils/unitConverter';

export default function App() {
  const initialPreset = INDUSTRY_PRESETS[0]; // Acid-Base Titration

  const [currentIndustry, setCurrentIndustry] = useState<IndustryType>(initialPreset.industry);
  const [reactants, setReactants] = useState<ChemicalReactant[]>(initialPreset.reactants);
  const [modifiers, setModifiers] = useState<ReactionModifiers>(initialPreset.modifiers);
  const [simulationData, setSimulationData] = useState<SimulationResponsePayload>(
    initialPreset.expectedOutput
  );
  const [activeTab, setActiveTab] = useState<'simulation' | 'cad' | 'json' | 'safety'>(
    'simulation'
  );
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(labAudio.getMuted());
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Initialize Session History from localStorage or seed with initial experiment
  const [sessionHistory, setSessionHistory] = useState<ExperimentHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('chemlabs_session_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 5);
        }
      }
    } catch {}

    const now = new Date();
    return [
      {
        id: `exp-init-${Date.now()}`,
        timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        relativeTime: 'Active initial',
        title: initialPreset.expectedOutput.balanced_equation,
        industry: initialPreset.industry,
        reactants: initialPreset.reactants,
        modifiers: initialPreset.modifiers,
        simulationData: initialPreset.expectedOutput,
      },
    ];
  });

  // Helper to add or push to session history (capped strictly at 5)
  const addHistoryItem = (
    ind: IndustryType,
    r: ChemicalReactant[],
    m: ReactionModifiers,
    out: SimulationResponsePayload
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const newItem: ExperimentHistoryItem = {
      id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: timeStr,
      relativeTime: 'Just now',
      title: out.balanced_equation || 'Chemical Interaction',
      industry: ind,
      reactants: JSON.parse(JSON.stringify(r)),
      modifiers: { ...m },
      simulationData: JSON.parse(JSON.stringify(out)),
    };

    setSessionHistory((prev) => {
      // Remove any duplicate of identical reactants and modifiers
      const filtered = prev.filter(
        (item) =>
          !(
            item.industry === ind &&
            item.modifiers.temperature_c === m.temperature_c &&
            item.modifiers.pressure_atm === m.pressure_atm &&
            JSON.stringify(item.reactants) === JSON.stringify(r)
          )
      );
      const updated = [newItem, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('chemlabs_session_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Calculation logic to ensure total volume used for CAD scaling and rendering remains accurate regardless of selected unit (ml, g, mol)
  const totalVolumeMl = React.useMemo(() => {
    return reactants.reduce((sum, r) => {
      const unit = r.unit || 'ml';
      const inputVal = r.amount_input !== undefined ? r.amount_input : (Number(r.amount_ml) || 0);
      const converted = standardizeToVolumeMl(inputVal, unit, r.name, r.concentration);
      return sum + (converted.volumeMl || 0);
    }, 0);
  }, [reactants]);

  // Dynamically scale structural container dimensions based on total reactant volume
  const dynamicCadParams = React.useMemo(() => {
    const baseW = simulationData.cad_parameters.structural_width_mm || 120;
    const baseH = simulationData.cad_parameters.structural_height_mm || 250;
    const volScale = Math.max(0.65, Math.min(2.4, Math.cbrt((totalVolumeMl || 300) / 300)));
    return {
      ...simulationData.cad_parameters,
      structural_width_mm: Math.round(baseW * volScale * 10) / 10,
      structural_height_mm: Math.round(baseH * volScale * 10) / 10,
    };
  }, [simulationData.cad_parameters, totalVolumeMl]);

  // Switch industry & load the first preset of that industry
  const handleSelectIndustry = (ind: IndustryType) => {
    setCurrentIndustry(ind);
    const firstPreset = INDUSTRY_PRESETS.find((p) => p.industry === ind);
    if (firstPreset) {
      setReactants(firstPreset.reactants);
      setModifiers(firstPreset.modifiers);
      setSimulationData(firstPreset.expectedOutput);
      addHistoryItem(firstPreset.industry, firstPreset.reactants, firstPreset.modifiers, firstPreset.expectedOutput);
    }
  };

  // Load selected preset
  const handleLoadPreset = (preset: IndustryPreset) => {
    setCurrentIndustry(preset.industry);
    setReactants(preset.reactants);
    setModifiers(preset.modifiers);
    setSimulationData(preset.expectedOutput);
    addHistoryItem(preset.industry, preset.reactants, preset.modifiers, preset.expectedOutput);
  };

  // Revert back to a historical experiment configuration
  const handleRevertHistory = (item: ExperimentHistoryItem) => {
    setCurrentIndustry(item.industry);
    setReactants(JSON.parse(JSON.stringify(item.reactants)));
    setModifiers({ ...item.modifiers });
    setSimulationData(JSON.parse(JSON.stringify(item.simulationData)));
    setIsHistoryOpen(false); // Close sidebar smoothly
  };

  // Clear session history
  const handleClearHistory = () => {
    setSessionHistory([]);
    try {
      localStorage.removeItem('chemlabs_session_history');
    } catch {}
  };

  // Run simulation via server backend (/api/simulate) or local fallback
  const handleRunSimulation = async (
    customPayload?: SimulationRequestPayload
  ) => {
    setIsSimulating(true);

    // Standardize reactants so amount_ml strictly matches chosen unit (ml, g, mol)
    const normalizedReactants: ChemicalReactant[] = reactants.map((r) => {
      const unit = r.unit || 'ml';
      const inputVal = r.amount_input !== undefined ? r.amount_input : (Number(r.amount_ml) || 0);
      const converted = standardizeToVolumeMl(inputVal, unit, r.name, r.concentration);
      return {
        ...r,
        amount_ml: converted.volumeMl,
      };
    });

    const payload: SimulationRequestPayload = customPayload || {
      industry: currentIndustry,
      reactants: normalizedReactants,
      modifiers,
    };

    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: SimulationResponsePayload = await response.json();
      setSimulationData(data);
      if (customPayload) {
        setCurrentIndustry(customPayload.industry);
        setReactants(customPayload.reactants);
        setModifiers(customPayload.modifiers);
      }
      // Track in Session History
      addHistoryItem(
        customPayload?.industry || currentIndustry,
        customPayload?.reactants || reactants,
        customPayload?.modifiers || modifiers,
        data
      );
    } catch (err) {
      console.warn('Backend API unavailable, using local chem computation:', err);
      // Find matching preset or generate default response
      const matchingPreset = INDUSTRY_PRESETS.find(
        (p) =>
          p.industry === payload.industry &&
          p.reactants[0]?.name.toLowerCase().includes(payload.reactants[0]?.name.toLowerCase().slice(0, 4) || '')
      );
      if (matchingPreset) {
        setSimulationData(matchingPreset.expectedOutput);
        addHistoryItem(matchingPreset.industry, matchingPreset.reactants, matchingPreset.modifiers, matchingPreset.expectedOutput);
      }
    } finally {
      setIsSimulating(false);
    }
  };

  // Toggle Audio Mute
  const handleToggleMute = () => {
    const muted = labAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      labAudio.triggerBubble(simulationData.visuals.bubbling_speed);
    }
  };

  // Download AutoCAD DXF file
  const handleDownloadDXF = () => {
    const chemicalName =
      reactants[0]?.name || simulationData.balanced_equation.split('->')[0] || 'Vessel';
    const dxfString = generateAutoCAD_DXF({
      chemicalName,
      reactorType: dynamicCadParams.reactor_vessel_type,
      widthMm: dynamicCadParams.structural_width_mm,
      heightMm: dynamicCadParams.structural_height_mm,
      volumeMl: totalVolumeMl || 300,
      industry: currentIndustry,
      balancedEquation: simulationData.balanced_equation,
      temperatureC: modifiers.temperature_c,
      pressureAtm: modifiers.pressure_atm,
    });
    const filename = `AutoCAD_Reactor_${currentIndustry}_${Date.now()}.dxf`;
    downloadDXFFile(filename, dxfString);
  };

  // Reset to initial preset
  const handleReset = () => {
    handleLoadPreset(INDUSTRY_PRESETS[0]);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar Header */}
      <Navbar
        currentIndustry={currentIndustry}
        onSelectIndustry={handleSelectIndustry}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onReset={handleReset}
        onDownloadDXF={handleDownloadDXF}
        isSimulating={isSimulating}
        onRunSimulation={() => handleRunSimulation()}
        onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
        historyCount={sessionHistory.length}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Session History Sidebar Drawer */}
      <SessionHistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={sessionHistory}
        onRevert={handleRevertHistory}
        onClearHistory={handleClearHistory}
        currentModifiers={modifiers}
        currentReactants={reactants}
      />

      {/* Main App Container */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6">
        {/* TAB 1: LIVE SIMULATION DECK */}
        {activeTab === 'simulation' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left Column: Chemical Reactants & Modifier Inputs */}
              <div className="lg:col-span-6">
                <ReactantForm
                  industry={currentIndustry}
                  reactants={reactants}
                  setReactants={setReactants}
                  modifiers={modifiers}
                  setModifiers={setModifiers}
                  onLoadPreset={handleLoadPreset}
                  onSimulate={() => handleRunSimulation()}
                  isSimulating={isSimulating}
                />
              </div>

              {/* Right Column: Dynamic Interactive Reactor Canvas */}
              <div className="flex flex-col gap-6 lg:col-span-6">
                <ReactorCanvas
                  simulationData={{ ...simulationData, cad_parameters: dynamicCadParams }}
                  modifiers={modifiers}
                  totalVolumeMl={totalVolumeMl}
                />
              </div>
            </div>

            {/* Academic & Visual Search Hooks */}
            <SearchHooksPanel
              searchHooks={simulationData.search_hooks}
              primaryChemical={reactants[0]?.name || ''}
            />
          </div>
        )}

        {/* TAB 2: AUTOCAD BLUEPRINT & HARDWARE MATRIX */}
        {activeTab === 'cad' && (
          <CadBlueprintViewer
            cadParams={dynamicCadParams}
            simulationData={simulationData}
            modifiers={modifiers}
            totalVolumeMl={totalVolumeMl}
            industry={currentIndustry}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}

        {/* TAB 3: MASTER ORCHESTRATION RAW JSON CONSOLE */}
        {activeTab === 'json' && (
          <OrchestrationConsole
            inputPayload={{ industry: currentIndustry, reactants, modifiers }}
            outputPayload={{ ...simulationData, cad_parameters: dynamicCadParams }}
            onExecuteRawJson={handleRunSimulation}
            isSimulating={isSimulating}
          />
        )}

        {/* TAB 4: SAFETY & HAZARD MATRIX */}
        {activeTab === 'safety' && (
          <SafetyMatrix
            warnings={simulationData.safety_warnings}
            industry={currentIndustry}
            modifiers={modifiers}
            thermoOutput={simulationData.thermo_output}
          />
        )}
      </main>

      {/* GLP Laboratory PDF Report Generator & Print Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        industry={currentIndustry}
        reactants={reactants}
        modifiers={modifiers}
        simulationData={simulationData}
        dynamicCadParams={dynamicCadParams}
        totalVolumeMl={totalVolumeMl}
      />

      {/* Industrial Engineering Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-3 text-xs text-slate-500 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-slate-400">
              ChemLabs-AI Simulation Core: Online
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>AutoCAD R2010 DXF Active</span>
            <span>•</span>
            <span>Thermodynamic ChemMatrix Engine</span>
            <span>•</span>
            <span>Cross-Industry Architecture (Pharma | Metallurgy | Academic | Petrochemical)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
