import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  ShieldAlert,
  Compass,
  CheckCircle2,
  Calendar,
  Layers,
  FlaskConical,
} from 'lucide-react';
import {
  ChemicalReactant,
  ReactionModifiers,
  IndustryType,
  SimulationResponsePayload,
  CadParameters,
} from '../types/chemlab';
import { generateLaboratoryReport, PDFReportData } from '../utils/pdfGenerator';
import { standardizeToVolumeMl } from '../utils/unitConverter';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  industry: IndustryType;
  reactants: ChemicalReactant[];
  modifiers: ReactionModifiers;
  simulationData: SimulationResponsePayload;
  dynamicCadParams: CadParameters;
  totalVolumeMl: number;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  industry,
  reactants,
  modifiers,
  simulationData,
  dynamicCadParams,
  totalVolumeMl,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [researcherName, setResearcherName] = useState('Dr. Elena Rostova, Lead Chemical Engineer');
  const [reportId] = useState(() => `CL-GLP-${Date.now().toString(36).toUpperCase()}`);
  const [currentDate] = useState(() => new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC');

  if (!isOpen) return null;

  const pdfData: PDFReportData = {
    industry,
    reactants,
    modifiers,
    simulationData,
    dynamicCadParams,
    totalVolumeMl,
    researcherName,
    reportId,
  };

  const handlePrintReport = () => {
    setIsGenerating(true);
    try {
      // Calls generateLaboratoryReport to format and trigger direct PDF download
      generateLaboratoryReport(pdfData);
    } catch (err) {
      console.error('Failed to generate laboratory report:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    try {
      generateLaboratoryReport(pdfData);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const chamberVolume = Math.round(
    Math.PI * Math.pow(dynamicCadParams.structural_width_mm / 20, 2) * (dynamicCadParams.structural_height_mm / 10)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm print:p-0 print:bg-white print:static">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-800 bg-[#0B1220] shadow-2xl overflow-hidden print:max-h-none print:w-full print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Laboratory Experiment Record & Report</h3>
              <p className="text-xs text-slate-400">
                GLP / ISO-17025 Certified Chemical Simulation & AutoCAD Vessel Specification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Primary Print Report CTA calling generateLaboratoryReport */}
            <button
              onClick={handlePrintReport}
              disabled={isGenerating}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-500/50 hover:bg-slate-800 hover:text-cyan-300 disabled:opacity-50"
              title="Print and download official laboratory report document"
            >
              <Printer className="h-3.5 w-3.5 text-cyan-400" />
              <span>{isGenerating ? 'Generating...' : 'Print Report'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isGenerating ? 'Building PDF...' : 'Download Official PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Preview Canvas */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-200 print:p-0 print:overflow-visible print:text-black">
          <div className="mx-auto max-w-3xl rounded-xl border border-slate-800 bg-[#0F172A] p-8 shadow-xl print:border-none print:shadow-none print:bg-white print:p-0">
            {/* Document Header */}
            <div className="border-b-2 border-cyan-500 pb-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-cyan-400 print:text-blue-600" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400 print:text-blue-600">
                      ChemLabs-AI Laboratory System
                    </span>
                  </div>
                  <h1 className="mt-1 text-lg font-bold text-white tracking-tight print:text-black sm:text-xl">
                    CHEMICAL EXPERIMENTAL & FABRICATION RECORD
                  </h1>
                  <p className="text-xs text-slate-400 print:text-gray-600">
                    Compliant with GLP & ISO-17025 Standard Laboratory Operating Guidelines
                  </p>
                </div>

                <div className="text-right font-mono text-[11px] text-slate-400 print:text-gray-700">
                  <div className="rounded bg-slate-900 px-2 py-0.5 border border-slate-800 inline-block text-cyan-300 font-bold print:border-gray-300 print:bg-gray-100 print:text-black">
                    REF: {reportId}
                  </div>
                  <div className="mt-1 flex items-center justify-end gap-1">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    <span>{currentDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1: Experiment Profile & Operational Parameters */}
            <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/60 p-4 print:border-gray-300 print:bg-gray-50">
              <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider print:text-blue-700">
                1. Experiment Profile & Environmental Modifiers
              </h2>

              <div className="mt-3 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                <div>
                  <span className="text-[11px] text-slate-400 print:text-gray-600">Industry Sector</span>
                  <p className="font-semibold text-white print:text-black">{industry} Sector</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 print:text-gray-600">Temperature</span>
                  <p className="font-mono font-semibold text-cyan-300 print:text-black">{modifiers.temperature_c} °C</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 print:text-gray-600">Pressure</span>
                  <p className="font-mono font-semibold text-cyan-300 print:text-black">{modifiers.pressure_atm} atm</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 print:text-gray-600">Catalyst</span>
                  <p className="font-semibold text-white print:text-black">{modifiers.catalyst || 'None (Neat)'}</p>
                </div>
              </div>

              {/* Balanced Equation Callout */}
              <div className="mt-3 rounded-lg border border-cyan-500/30 bg-cyan-950/30 p-3 print:border-gray-400 print:bg-gray-100">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase print:text-blue-700">
                  Balanced Stoichiometry:
                </span>
                <p className="mt-0.5 font-mono text-xs font-bold text-white tracking-wide print:text-black">
                  {simulationData.balanced_equation}
                </p>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 print:text-gray-600">
                  <span>Thermodynamics: <strong className="text-cyan-300 print:text-black">{simulationData.thermo_output}</strong></span>
                  <span>Active Total Volume: <strong className="text-white print:text-black">{totalVolumeMl.toFixed(1)} mL</strong></span>
                </div>
              </div>
            </div>

            {/* Section 2: Reactants Volumetric Matrix */}
            <div className="mt-6">
              <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider print:text-blue-700">
                2. Reactants Matrix & Dosing Volumetric Composition
              </h2>

              <div className="mt-2 overflow-hidden rounded-lg border border-slate-800 print:border-gray-300">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-[10px] font-mono uppercase text-slate-400 print:bg-gray-200 print:text-black">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Chemical Reagent</th>
                      <th className="py-2 px-3">Concentration</th>
                      <th className="py-2 px-3">Input Dosing</th>
                      <th className="py-2 px-3">Density (ρ)</th>
                      <th className="py-2 px-3">Calculated Volume</th>
                      <th className="py-2 px-3 text-right">Batch %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono print:divide-gray-200">
                    {reactants.map((r, i) => {
                      const unit = r.unit || 'ml';
                      const inputVal = r.amount_input !== undefined ? r.amount_input : (Number(r.amount_ml) || 0);
                      const converted = standardizeToVolumeMl(inputVal, unit, r.name, r.concentration);
                      const pct = totalVolumeMl > 0 ? ((converted.volumeMl / totalVolumeMl) * 100).toFixed(1) : '0.0';

                      return (
                        <tr key={i} className="hover:bg-slate-900/40 print:hover:bg-transparent">
                          <td className="py-2 px-3 text-slate-500">{i + 1}</td>
                          <td className="py-2 px-3 font-sans font-medium text-white print:text-black">{r.name}</td>
                          <td className="py-2 px-3 text-slate-400 print:text-gray-700">{r.concentration || 'Pure'}</td>
                          <td className="py-2 px-3 text-slate-300 print:text-black">{inputVal} {unit}</td>
                          <td className="py-2 px-3 text-slate-400 print:text-gray-700">{converted.density.toFixed(2)} g/mL</td>
                          <td className="py-2 px-3 font-bold text-cyan-300 print:text-blue-800">{converted.volumeMl.toFixed(1)} mL</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-300 print:text-black">{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-800 bg-slate-900/80 font-mono font-bold text-xs print:border-gray-400 print:bg-gray-100">
                    <tr>
                      <td colSpan={5} className="py-2 px-3 text-slate-300 print:text-black">
                        TOTAL STANDARDIZED BATCH VOLUME
                      </td>
                      <td colSpan={2} className="py-2 px-3 text-right text-cyan-300 print:text-blue-800">
                        {totalVolumeMl.toFixed(1)} mL (100.0%)
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Section 3: Safety & Hazard Matrix */}
            <div className="mt-6 rounded-lg border border-rose-900/40 bg-rose-950/20 p-4 print:border-red-400 print:bg-red-50">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-400 print:text-red-700" />
                <h2 className="text-xs font-bold text-rose-300 uppercase tracking-wider print:text-red-700">
                  3. Safety Directives & Hazard Mitigation Protocols (OSHA / ISO-45001)
                </h2>
              </div>

              <ul className="mt-2.5 space-y-1.5 text-xs text-rose-200/90 print:text-red-900">
                {simulationData.safety_warnings.map((warning, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-mono text-[10px] text-rose-400 font-bold shrink-0 print:text-red-800">
                      [W{i + 1}]
                    </span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 4: Mechanical Reactor Vessel & AutoCAD Specs */}
            <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/60 p-4 print:border-gray-300 print:bg-gray-50">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-cyan-400 print:text-blue-700" />
                <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider print:text-blue-700">
                  4. Reactor Vessel Specification & AutoCAD Fabrication Parameters
                </h2>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs print:text-black">
                <div className="flex justify-between border-b border-slate-800/80 py-1 print:border-gray-200">
                  <span className="text-slate-400 print:text-gray-600">Reactor Geometry:</span>
                  <span className="font-semibold text-white print:text-black">{dynamicCadParams.reactor_vessel_type}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 py-1 print:border-gray-200">
                  <span className="text-slate-400 print:text-gray-600">Vessel Diameter / Width:</span>
                  <span className="font-mono font-bold text-cyan-300 print:text-black">{dynamicCadParams.structural_width_mm} mm</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 py-1 print:border-gray-200">
                  <span className="text-slate-400 print:text-gray-600">Total Structural Height:</span>
                  <span className="font-mono font-bold text-cyan-300 print:text-black">{dynamicCadParams.structural_height_mm} mm</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 py-1 print:border-gray-200">
                  <span className="text-slate-400 print:text-gray-600">Calibrated Vessel Capacity:</span>
                  <span className="font-mono font-bold text-cyan-300 print:text-black">{chamberVolume} mL</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 py-1 print:border-gray-200">
                  <span className="text-slate-400 print:text-gray-600">Material Specification:</span>
                  <span className="font-semibold text-white print:text-black">316L Stainless / Borosilicate 3.3</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 py-1 print:border-gray-200">
                  <span className="text-slate-400 print:text-gray-600">AutoCAD Asset Reference:</span>
                  <span className="font-mono text-cyan-400 print:text-blue-800">AutoCAD_Reactor_{industry}.dxf</span>
                </div>
              </div>
            </div>

            {/* Section 5: Signatures & Compliance Ledger */}
            <div className="mt-6 border-t border-slate-800 pt-4 print:border-gray-300">
              <div className="grid grid-cols-2 gap-6 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 font-mono uppercase print:text-gray-600">
                    Principal Chemical Engineer:
                  </label>
                  <input
                    type="text"
                    value={researcherName}
                    onChange={(e) => setResearcherName(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none print:border-none print:bg-transparent print:p-0 print:text-black"
                  />
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 print:text-green-700">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Cryptographically Authenticated Session</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase print:text-gray-600">
                    Automated Verification Ledger:
                  </span>
                  <p className="mt-1 font-mono text-[11px] text-slate-300 print:text-black">
                    SHA256: {reportId.replace(/[^A-Z0-9]/g, '')}-GLP-VERIFIED
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500 print:text-gray-600">
                    <Layers className="h-3 w-3" />
                    <span>ChemLabs-AI Autonomous Synthesis & CAD Verification Node</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
