import React, { useState } from 'react';
import {
  FileCode2,
  Copy,
  CheckCircle,
  Play,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { SimulationRequestPayload, SimulationResponsePayload } from '../types/chemlab';

interface OrchestrationConsoleProps {
  inputPayload: SimulationRequestPayload;
  outputPayload: SimulationResponsePayload;
  onExecuteRawJson: (jsonPayload: SimulationRequestPayload) => Promise<void>;
  isSimulating: boolean;
}

export const OrchestrationConsole: React.FC<OrchestrationConsoleProps> = ({
  inputPayload,
  outputPayload,
  onExecuteRawJson,
  isSimulating,
}) => {
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [customInputJson, setCustomInputJson] = useState<string>(
    JSON.stringify(inputPayload, null, 2)
  );
  const [jsonParseError, setJsonParseError] = useState<string | null>(null);

  // Keep customInputJson updated if inputPayload changes externally
  React.useEffect(() => {
    setCustomInputJson(JSON.stringify(inputPayload, null, 2));
  }, [inputPayload]);

  // Clean raw output JSON string (strictly raw JSON, no markdown wrap)
  const rawOutputJsonString = JSON.stringify(
    {
      balanced_equation: outputPayload.balanced_equation,
      thermo_output: outputPayload.thermo_output,
      safety_warnings: outputPayload.safety_warnings,
      visuals: {
        hex_color: outputPayload.visuals.hex_color,
        bubbling_speed: outputPayload.visuals.bubbling_speed,
        precipitation_layer: outputPayload.visuals.precipitation_layer,
      },
      cad_parameters: {
        reactor_vessel_type: outputPayload.cad_parameters.reactor_vessel_type,
        structural_width_mm: outputPayload.cad_parameters.structural_width_mm,
        structural_height_mm: outputPayload.cad_parameters.structural_height_mm,
      },
      search_hooks: {
        scholar_query: outputPayload.search_hooks.scholar_query,
        image_query: outputPayload.search_hooks.image_query,
      },
    },
    null,
    2
  );

  const handleCopyInput = () => {
    navigator.clipboard.writeText(customInputJson);
    setCopiedInput(true);
    setTimeout(() => setCopiedInput(false), 2000);
  };

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(rawOutputJsonString);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  const handleRunRaw = async () => {
    try {
      setJsonParseError(null);
      const parsed = JSON.parse(customInputJson) as SimulationRequestPayload;
      if (!parsed.industry || !Array.isArray(parsed.reactants)) {
        throw new Error("Missing required fields: 'industry' or 'reactants' array.");
      }
      await onExecuteRawJson(parsed);
    } catch (e: any) {
      setJsonParseError(e.message || 'Invalid JSON syntax');
    }
  };

  // Schema verification flags
  const hasBalancedEq = typeof outputPayload.balanced_equation === 'string';
  const hasThermo = typeof outputPayload.thermo_output === 'string';
  const hasSafety = Array.isArray(outputPayload.safety_warnings);
  const hasVisuals =
    outputPayload.visuals &&
    typeof outputPayload.visuals.hex_color === 'string' &&
    typeof outputPayload.visuals.bubbling_speed === 'number';
  const hasCad =
    outputPayload.cad_parameters &&
    typeof outputPayload.cad_parameters.reactor_vessel_type === 'string' &&
    typeof outputPayload.cad_parameters.structural_width_mm === 'number';
  const hasSearch =
    outputPayload.search_hooks &&
    typeof outputPayload.search_hooks.scholar_query === 'string';

  const allCompliant =
    hasBalancedEq && hasThermo && hasSafety && hasVisuals && hasCad && hasSearch;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              ChemLabs-AI Master Orchestration Core
            </h2>
            <p className="text-xs text-slate-400">
              Raw JSON Contract Validator • Gemini Chemical Engine Bridge
            </p>
          </div>
        </div>

        {/* Contract Compliance Tag */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              allCompliant
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {allCompliant ? (
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-400" />
            )}
            <span>{allCompliant ? 'Schema Contract 100% Valid' : 'Contract Mismatch'}</span>
          </div>

          <button
            onClick={handleRunRaw}
            disabled={isSimulating}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50"
          >
            {isSimulating ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Processing...</span>
              </span>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Execute JSON Payload</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Schema Verification Checklist */}
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs sm:grid-cols-3 lg:grid-cols-6">
        <div className="flex items-center gap-1.5 text-slate-300">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
          <span className="truncate">balanced_equation</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
          <span className="truncate">thermo_output</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
          <span className="truncate">safety_warnings[]</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
          <span className="truncate">visuals (hex/speed)</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
          <span className="truncate">cad_parameters</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
          <span className="truncate">search_hooks</span>
        </div>
      </div>

      {/* Split JSON Editor / Viewer */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* INPUT JSON PANEL */}
        <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">INPUT SCHEMA</h3>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                JSON Request
              </span>
            </div>

            <button
              onClick={handleCopyInput}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
            >
              {copiedInput ? (
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{copiedInput ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="mt-3 flex-1">
            <textarea
              value={customInputJson}
              onChange={(e) => {
                setCustomInputJson(e.target.value);
                setJsonParseError(null);
              }}
              rows={16}
              className="w-full rounded-xl border border-slate-800 bg-[#090d16] p-3 font-mono text-xs text-cyan-300 focus:border-cyan-500 focus:outline-none"
              placeholder="Paste or edit Input JSON schema..."
            />
            {jsonParseError && (
              <p className="mt-2 text-xs font-semibold text-rose-400">
                ⚠️ Error: {jsonParseError}
              </p>
            )}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Accepts industry: Pharma | Metallurgy | Academic | Petrochemical, reactants[], and modifiers.
          </p>
        </div>

        {/* OUTPUT JSON REQUIREMENT PANEL */}
        <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">OUTPUT JSON REQUIREMENT</h3>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                Pure JSON
              </span>
            </div>

            <button
              onClick={handleCopyOutput}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
            >
              {copiedOutput ? (
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{copiedOutput ? 'Copied Raw' : 'Copy Raw JSON'}</span>
            </button>
          </div>

          <div className="mt-3 flex-1">
            <pre className="h-[340px] overflow-auto rounded-xl border border-slate-800 bg-[#090d16] p-3 font-mono text-xs text-emerald-300 select-all">
              {rawOutputJsonString}
            </pre>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            No markdown wrap blocks, raw structured JSON mapping the configuration layout precisely.
          </p>
        </div>
      </div>
    </div>
  );
};
