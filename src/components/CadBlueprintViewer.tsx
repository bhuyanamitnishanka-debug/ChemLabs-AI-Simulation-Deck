import React, { useState } from 'react';
import {
  Download,
  Layers,
  Maximize2,
  Box,
  FileSpreadsheet,
  CheckCircle,
  Copy,
  Cpu,
  FileText,
} from 'lucide-react';
import { CadParametersOutput, SimulationResponsePayload, ReactionModifiers } from '../types/chemlab';
import { generateAutoCAD_DXF, downloadDXFFile } from '../utils/dxfGenerator';

interface CadBlueprintViewerProps {
  cadParams: CadParametersOutput;
  simulationData: SimulationResponsePayload;
  modifiers: ReactionModifiers;
  totalVolumeMl: number;
  industry: string;
  onOpenReportModal?: () => void;
}

export const CadBlueprintViewer: React.FC<CadBlueprintViewerProps> = ({
  cadParams,
  simulationData,
  modifiers,
  totalVolumeMl,
  industry,
  onOpenReportModal,
}) => {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [copied, setCopied] = useState<boolean>(false);

  const { structural_width_mm, structural_height_mm, reactor_vessel_type } = cadParams;

  // Aspect ratio calculation
  const aspectRatio = (structural_height_mm / (structural_width_mm || 1)).toFixed(2);

  // Recommended metallurgy based on industry & temperature
  let recommendedMaterial = '316L Stainless Steel (ASTM A240)';
  if (industry === 'Petrochemical' || modifiers.temperature_c > 400) {
    recommendedMaterial = 'Hastelloy C-276 / Cr-Mo Alloy (High-Temp Creep Resistant)';
  } else if (industry === 'Metallurgy' || modifiers.temperature_c > 700) {
    recommendedMaterial = 'Refractory Alumina Ceramic Liner with Inconel 625 Jacket';
  } else if (industry === 'Pharma') {
    recommendedMaterial = 'Borosilicate Glass 3.3 / Electropolished 316L (Ra < 0.4 µm)';
  }

  // Handle AutoCAD DXF download
  const handleDownloadDXF = () => {
    const chemicalName = simulationData.balanced_equation.split('->')[0]?.trim() || 'Reaction_Vessel';
    const dxfContent = generateAutoCAD_DXF({
      chemicalName,
      reactorType: reactor_vessel_type,
      widthMm: structural_width_mm,
      heightMm: structural_height_mm,
      volumeMl: totalVolumeMl,
      industry,
      balancedEquation: simulationData.balanced_equation,
      temperatureC: modifiers.temperature_c,
      pressureAtm: modifiers.pressure_atm,
    });

    const safeFilename = `CAD_Vessel_${reactor_vessel_type}_${industry.toLowerCase()}_${Date.now()}.dxf`;
    downloadDXFFile(safeFilename, dxfContent);
  };

  const handleCopySpecs = () => {
    const specs = JSON.stringify(
      {
        cad_parameters: cadParams,
        design_volume_ml: totalVolumeMl,
        aspect_ratio: aspectRatio,
        material_specification: recommendedMaterial,
        design_temperature_c: modifiers.temperature_c,
        design_pressure_atm: modifiers.pressure_atm,
        autocad_version: 'R2010 (AC1024)',
      },
      null,
      2
    );
    navigator.clipboard.writeText(specs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 2D SVG Blueprint coordinates
  const svgW = 560;
  const svgH = 460;
  const cx = svgW / 2;
  const cy = svgH / 2 - 10;

  // Scaling factors to fit in SVG
  const maxDim = Math.max(structural_width_mm * 1.4, structural_height_mm);
  const scale = 260 / (maxDim || 200);

  const drawW = structural_width_mm * scale;
  const drawH = structural_height_mm * scale;
  const halfDrawW = drawW / 2;
  const topY = cy - drawH / 2;
  const botY = cy + drawH / 2;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner & Control Deck */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              AutoCAD Structural Blueprint & Hardware Matrix
            </h2>
            <p className="text-xs text-slate-400">
              Parametric Dimension Engine • R2010 DXF Specification Vector Output
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 2D / 3D Toggle */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={() => setViewMode('2d')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                viewMode === '2d'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>2D Technical Drafting</span>
            </button>

            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                viewMode === '3d'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Box className="h-3.5 w-3.5" />
              <span>3D Isometric Wireframe</span>
            </button>
          </div>

          {/* Copy Spec JSON */}
          <button
            onClick={handleCopySpecs}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
          >
            {copied ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Specs'}</span>
          </button>

          {/* PDF Lab Report */}
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 transition-all hover:border-cyan-500/50 hover:bg-slate-800 hover:text-cyan-300"
            >
              <FileText className="h-3.5 w-3.5 text-cyan-400" />
              <span>Lab Record PDF</span>
            </button>
          )}

          {/* Download AutoCAD DXF */}
          <button
            onClick={handleDownloadDXF}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-blue-500"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export AutoCAD .DXF</span>
          </button>
        </div>
      </div>

      {/* Main Vector CAD Canvas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* CAD Blueprint Drafting Viewport */}
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-[#080d1a] p-4 shadow-2xl lg:col-span-8">
          {/* Engineering CAD Grid Background pattern */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Coordinate overlay corner tags */}
          <div className="absolute top-3 left-4 text-[10px] font-mono text-cyan-500/80">
            [X: 0.000, Y: 0.000, Z: 0.000] • UCS: WORLD • UNITS: MM
          </div>
          <div className="absolute top-3 right-4 text-[10px] font-mono text-slate-400">
            FORMAT: AUTOCAD R2010 (.DXF)
          </div>

          {viewMode === '2d' ? (
            /* 2D Precision Engineering Drafting (SVG) */
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="relative z-10 h-full max-h-[460px] w-full select-none"
            >
              <defs>
                {/* Crosshatch pattern for jacket / insulation */}
                <pattern id="cadHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#38bdf8" strokeWidth="0.8" opacity="0.4" />
                </pattern>
                {/* Arrow markers for dimensioning */}
                <marker id="dimArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 2 L 8 5 L 0 8 z" fill="#facc15" />
                </marker>
              </defs>

              {/* 1. Centerlines (Red dashed) */}
              <line x1={cx} y1={topY - 35} x2={cx} y2={botY + 35} stroke="#f43f5e" strokeWidth="1" strokeDasharray="6,3,1,3" />

              {/* 2. Outer Thermal Jacket (For CSTR & Batch) */}
              {reactor_vessel_type !== 'Tube' && (
                <g>
                  <rect
                    x={cx - halfDrawW - 14}
                    y={topY + 25}
                    width={drawW + 28}
                    height={drawH - 45}
                    rx="8"
                    fill="url(#cadHatch)"
                    stroke="#0284c7"
                    strokeWidth="1.2"
                  />
                  {/* Jacket inlet and outlet ports */}
                  <rect x={cx - halfDrawW - 24} y={topY + 35} width="10" height="12" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
                  <text x={cx - halfDrawW - 28} y={topY + 44} fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="end">
                    COOLANT IN
                  </text>
                  <rect x={cx + halfDrawW + 14} y={botY - 35} width="10" height="12" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
                  <text x={cx + halfDrawW + 28} y={botY - 26} fill="#38bdf8" fontSize="8" fontFamily="monospace">
                    COOLANT OUT
                  </text>
                </g>
              )}

              {/* 3. Main Vessel Body Shell (Cyan Drafting lines) */}
              <rect
                x={cx - halfDrawW}
                y={topY}
                width={drawW}
                height={drawH}
                rx="16"
                fill="#0f172a"
                fillOpacity="0.8"
                stroke="#38bdf8"
                strokeWidth="2.2"
              />

              {/* Top Flange / Vessel Neck */}
              <rect x={cx - halfDrawW * 0.7} y={topY - 10} width={drawW * 0.7} height="10" fill="#1e293b" stroke="#7dd3fc" strokeWidth="1.5" />
              {/* Top Feed Nozzles */}
              <rect x={cx - halfDrawW * 0.45} y={topY - 22} width="14" height="12" fill="#334155" stroke="#38bdf8" strokeWidth="1.2" />
              <text x={cx - halfDrawW * 0.45 + 7} y={topY - 26} fill="#94a3b8" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                FEED N1
              </text>

              {/* Pressure Relief Vent / Rupture Disk */}
              <rect x={cx + halfDrawW * 0.25} y={topY - 20} width="12" height="10" fill="#334155" stroke="#f43f5e" strokeWidth="1.2" />
              <polygon points={`${cx + halfDrawW * 0.25 - 2},${topY - 20} ${cx + halfDrawW * 0.25 + 14},${topY - 20} ${cx + halfDrawW * 0.25 + 6},${topY - 28}`} fill="#f43f5e" />
              <text x={cx + halfDrawW * 0.25 + 6} y={topY - 32} fill="#f43f5e" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                PRV VENT
              </text>

              {/* Bottom Slurry Discharge Valve */}
              <rect x={cx - 10} y={botY} width="20" height="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
              <polygon points={`${cx - 15},${botY + 16} ${cx + 15},${botY + 16} ${cx},${botY + 26}`} fill="#38bdf8" stroke="#7dd3fc" strokeWidth="1" />
              <text x={cx} y={botY + 36} fill="#94a3b8" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                DRAIN DN50
              </text>

              {/* 4. Reactor Specific Internals */}
              {reactor_vessel_type === 'CSTR' ? (
                /* Motor, shaft, and Rushton impeller */
                <g>
                  {/* Top Agitator Motor Gearbox */}
                  <rect x={cx - 18} y={topY - 38} width="36" height="28" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                  <line x1={cx - 18} y1={topY - 24} x2={cx + 18} y2={topY - 24} stroke="#38bdf8" strokeWidth="1" />
                  <text x={cx} y={topY - 28} fill="#38bdf8" fontSize="7" fontFamily="monospace" textAnchor="middle">
                    MOTOR
                  </text>
                  {/* Central Shaft */}
                  <line x1={cx} y1={topY} x2={cx} y2={botY - 25} stroke="#cbd5e1" strokeWidth="3" />
                  {/* Rushton Turbine Lower Blades */}
                  <rect x={cx - halfDrawW * 0.55} y={botY - 35} width={drawW * 0.55} height="12" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="1" />
                  {/* Rushton Turbine Upper Blades */}
                  <rect x={cx - halfDrawW * 0.5} y={topY + drawH * 0.5} width={drawW * 0.5} height="10" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1" />
                  {/* Anti-vortex Wall Baffles */}
                  <line x1={cx - halfDrawW + 6} y1={topY + 30} x2={cx - halfDrawW + 6} y2={botY - 30} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,2" />
                  <line x1={cx + halfDrawW - 6} y1={topY + 30} x2={cx + halfDrawW - 6} y2={botY - 30} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,2" />
                </g>
              ) : reactor_vessel_type === 'Tube' ? (
                /* Tubular PFR multi-pass channels */
                <g>
                  {[-0.3, -0.1, 0.1, 0.3].map((pos, idx) => (
                    <g key={idx}>
                      <line
                        x1={cx + halfDrawW * pos}
                        y1={topY + 15}
                        x2={cx + halfDrawW * pos}
                        y2={botY - 15}
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                      />
                      <circle cx={cx + halfDrawW * pos} cy={topY + 15} r="3" fill="#38bdf8" />
                      <circle cx={cx + halfDrawW * pos} cy={botY - 15} r="3" fill="#38bdf8" />
                    </g>
                  ))}
                  <text x={cx} y={cy} fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="middle">
                    PFR CATALYST BED
                  </text>
                </g>
              ) : (
                /* Batch Reactor: Immersion baffles and internal thermowell */
                <g>
                  <line x1={cx - halfDrawW * 0.3} y1={topY + 8} x2={cx - halfDrawW * 0.3} y2={botY - 20} stroke="#f59e0b" strokeWidth="2" />
                  <text x={cx - halfDrawW * 0.3} y={botY - 24} fill="#f59e0b" fontSize="7" fontFamily="monospace" textAnchor="middle">
                    THERMOWELL
                  </text>
                  <ellipse cx={cx} cy={botY - 12} rx={drawW * 0.25} ry="6" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
                </g>
              )}

              {/* 5. Precision Dimensioning (Yellow Drafting Layer) */}
              {/* Horizontal Width Dimension */}
              <g>
                <line
                  x1={cx - halfDrawW}
                  y1={botY + 30}
                  x2={cx + halfDrawW}
                  y2={botY + 30}
                  stroke="#facc15"
                  strokeWidth="1.2"
                  markerStart="url(#dimArrow)"
                  markerEnd="url(#dimArrow)"
                />
                <line x1={cx - halfDrawW} y1={botY + 4} x2={cx - halfDrawW} y2={botY + 36} stroke="#facc15" strokeWidth="0.8" />
                <line x1={cx + halfDrawW} y1={botY + 4} x2={cx + halfDrawW} y2={botY + 36} stroke="#facc15" strokeWidth="0.8" />
                <text x={cx} y={botY + 44} fill="#facc15" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  W: {structural_width_mm.toFixed(1)} mm
                </text>
              </g>

              {/* Vertical Height Dimension */}
              <g>
                <line
                  x1={cx + halfDrawW + 36}
                  y1={topY}
                  x2={cx + halfDrawW + 36}
                  y2={botY}
                  stroke="#facc15"
                  strokeWidth="1.2"
                  markerStart="url(#dimArrow)"
                  markerEnd="url(#dimArrow)"
                />
                <line x1={cx + halfDrawW + 6} y1={topY} x2={cx + halfDrawW + 42} y2={topY} stroke="#facc15" strokeWidth="0.8" />
                <line x1={cx + halfDrawW + 6} y1={botY} x2={cx + halfDrawW + 42} y2={botY} stroke="#facc15" strokeWidth="0.8" />
                <text
                  x={cx + halfDrawW + 48}
                  y={cy}
                  fill="#facc15"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                  dominantBaseline="middle"
                >
                  H: {structural_height_mm.toFixed(1)} mm
                </text>
              </g>

              {/* 6. AutoCAD Engineering Title Block */}
              <g transform="translate(16, 360)">
                <rect x="0" y="0" width="230" height="76" fill="#0f172a" fillOpacity="0.9" stroke="#38bdf8" strokeWidth="1" />
                <line x1="0" y1="20" x2="230" y2="20" stroke="#38bdf8" strokeWidth="0.8" />
                <line x1="0" y1="48" x2="230" y2="48" stroke="#38bdf8" strokeWidth="0.8" />
                <text x="8" y="14" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  CHEMLABS-AI AUTOCAD SYSTEM
                </text>
                <text x="8" y="32" fill="#e2e8f0" fontSize="8" fontFamily="monospace">
                  VESSEL: {reactor_vessel_type} ({industry.toUpperCase()})
                </text>
                <text x="8" y="42" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">
                  VOLUME: {totalVolumeMl} mL • SCALE: 1:1 VECTOR
                </text>
                <text x="8" y="60" fill="#facc15" fontSize="7.5" fontFamily="monospace">
                  DIMENSIONS: {structural_width_mm} x {structural_height_mm} mm
                </text>
                <text x="8" y="70" fill="#38bdf8" fontSize="7" fontFamily="monospace">
                  STATUS: VERIFIED CAD MATRIX (R2010 DXF)
                </text>
              </g>
            </svg>
          ) : (
            /* 3D Isometric Rotating Perspective Wireframe */
            <div className="relative flex h-[420px] w-full items-center justify-center">
              <svg viewBox="0 0 500 400" className="h-full w-full">
                {/* 3D Cylindrical Isometric Rings */}
                {Array.from({ length: 9 }).map((_, i) => {
                  const y = 80 + i * 28;
                  const rx = 100;
                  const ry = 36;
                  const opacity = i === 0 || i === 8 ? 0.9 : 0.45;
                  return (
                    <g key={i}>
                      <ellipse
                        cx="250"
                        cy={y}
                        rx={rx}
                        ry={ry}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth={i === 0 || i === 8 ? '2' : '1'}
                        strokeOpacity={opacity}
                      />
                    </g>
                  );
                })}

                {/* Vertical bounding wireframes */}
                <line x1="150" y1="80" x2="150" y2="304" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.8" />
                <line x1="350" y1="80" x2="350" y2="304" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.8" />
                <line x1="250" y1="44" x2="250" y2="340" stroke="#f43f5e" strokeWidth="1" strokeDasharray="6,3" />

                {/* 3D Impeller / internals */}
                {reactor_vessel_type === 'CSTR' && (
                  <g>
                    <ellipse cx="250" cy="270" rx="60" ry="22" fill="none" stroke="#facc15" strokeWidth="2.5" />
                    <line x1="190" y1="270" x2="310" y2="270" stroke="#facc15" strokeWidth="3" />
                  </g>
                )}

                {/* 3D Labels */}
                <text x="250" y="55" fill="#38bdf8" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  TOP ACCESS NOZZLE (DN50)
                </text>
                <text x="250" y="370" fill="#facc15" fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  3D ISOMETRIC VECTOR SHELL (L/D: {aspectRatio})
                </text>
              </svg>
            </div>
          )}
        </div>

        {/* CAD Specifications & Engineering Metadata */}
        <div className="flex flex-col gap-4 lg:col-span-4">
          {/* Hardware Parameters Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg backdrop-blur-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <FileSpreadsheet className="h-4 w-4 text-cyan-400" />
              <span>Dimensional Engineering Matrix</span>
            </h3>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Reactor Profile</span>
                <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-semibold text-cyan-300">
                  {reactor_vessel_type} Vessel
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Structural Width (O.D.)</span>
                <span className="font-mono font-medium text-slate-200">
                  {structural_width_mm.toFixed(1)} mm
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Structural Height (T/T)</span>
                <span className="font-mono font-medium text-slate-200">
                  {structural_height_mm.toFixed(1)} mm
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Aspect Ratio (L/D)</span>
                <span className="font-mono font-medium text-slate-200">{aspectRatio}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Design Capacity</span>
                <span className="font-mono font-medium text-slate-200">
                  {totalVolumeMl} mL ({(totalVolumeMl / 1000).toFixed(2)} L)
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Design Pressure Rating</span>
                <span className="font-mono font-medium text-amber-300">
                  {modifiers.pressure_atm} atm ({(modifiers.pressure_atm * 1.01325).toFixed(2)} bar)
                </span>
              </div>

              <div className="flex items-center justify-between pb-1">
                <span className="text-slate-400">Operating Temperature</span>
                <span className="font-mono font-medium text-rose-300">
                  {modifiers.temperature_c}°C
                </span>
              </div>
            </div>
          </div>

          {/* Material & Fabrication Recommender */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg backdrop-blur-sm">
            <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              ASME Material & Metallurgy
            </h4>
            <p className="mt-2 text-xs font-medium text-slate-200 leading-relaxed">
              {recommendedMaterial}
            </p>
            <div className="mt-3 rounded-lg bg-slate-950/70 p-2.5 text-[11px] text-slate-400">
              <span className="font-semibold text-cyan-400">AutoCAD Pipeline:</span> Output conforms to AC1024 vector layers. Import directly into Autodesk AutoCAD, SolidWorks, or QCAD via the exported DXF file.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
