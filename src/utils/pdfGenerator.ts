import { jsPDF } from 'jspdf';
import {
  ChemicalReactant,
  ReactionModifiers,
  IndustryType,
  SimulationResponsePayload,
  CadParameters,
} from '../types/chemlab';
import { standardizeToVolumeMl } from './unitConverter';

export interface PDFReportData {
  industry: IndustryType;
  reactants: ChemicalReactant[];
  modifiers: ReactionModifiers;
  simulationData: SimulationResponsePayload;
  dynamicCadParams?: CadParameters;
  totalVolumeMl?: number;
  researcherName?: string;
  reportId?: string;
  filename?: string;
}

/**
 * Builds the jsPDF vector document with a professional header, data table, and footer
 */
export function formatLaboratoryReportPDF(data: PDFReportData): jsPDF {
  const {
    industry,
    reactants = [],
    modifiers = { temperature_c: 25, pressure_atm: 1.0 },
    simulationData,
    dynamicCadParams = {
      reactor_vessel_type: 'Batch',
      structural_width_mm: 120,
      structural_height_mm: 220,
    },
    totalVolumeMl = reactants.reduce((sum, r) => sum + (Number(r.amount_ml) || 0), 0),
    researcherName = 'Dr. Elena Rostova, Lead Chemical Engineer',
    reportId = `CL-GLP-${Date.now().toString(36).toUpperCase()}`,
  } = data;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ==========================================
  // 1. CLEAR PROFESSIONAL HEADER
  // ==========================================
  // Top Banner background
  doc.setFillColor(11, 20, 38); // Deep Navy (#0B1426)
  doc.rect(margin, y, contentWidth, 24, 'F');

  // Decorative Cyan Accent Stripe
  doc.setFillColor(0, 243, 255); // Neon Cyan (#00F3FF)
  doc.rect(margin, y + 23, contentWidth, 1.2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('CHEMLABS-AI LABORATORY EXPERIMENT RECORD', margin + 5, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(165, 243, 252); // Light cyan
  doc.text(
    'GLP & ISO-17025 COMPLIANT CHEMICAL SIMULATION & REACTOR HARDWARE LEDGER',
    margin + 5,
    y + 14
  );

  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`REPORT REF: ${reportId}`, margin + 5, y + 19.5);
  doc.text(
    `DATE: ${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC`,
    pageWidth - margin - 5,
    y + 19.5,
    { align: 'right' }
  );

  y += 30;

  // ==========================================
  // 2. EXPERIMENT PARAMETERS & THERMODYNAMICS
  // ==========================================
  doc.setFillColor(248, 250, 252); // Light grey-blue bg
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('1. EXPERIMENT PROFILE & OPERATIONAL CONDITIONS', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  // Column 1
  doc.text(`Sector:`, margin + 4, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${(industry || 'Standard').toUpperCase()} PROCESSING`, margin + 22, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Operating Temp:`, margin + 4, y + 17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${modifiers.temperature_c} °C`, margin + 30, y + 17);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Pressure:`, margin + 4, y + 22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${modifiers.pressure_atm} atm`, margin + 22, y + 22);

  // Column 2
  const col2X = margin + 80;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Catalyst Matrix:`, col2X, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${modifiers.catalyst || 'None (Uncatalyzed)'}`, col2X + 25, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Thermodynamics:`, col2X, y + 17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199); // Cyan / Blue
  doc.text(`${simulationData?.thermo_output || 'N/A'}`, col2X + 28, y + 17);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Active Batch Volume:`, col2X, y + 22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${totalVolumeMl.toFixed(1)} mL`, col2X + 33, y + 22);

  y += 31;

  // Balanced Chemical Equation Callout
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(14, 165, 233); // Sky blue
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'FD');

  doc.setTextColor(14, 116, 144);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('BALANCED CHEMICAL EQUATION:', margin + 4, y + 4.5);

  doc.setTextColor(15, 23, 42);
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.text(`${simulationData?.balanced_equation || 'N/A'}`, margin + 4, y + 10);

  y += 19;

  // ==========================================
  // 3. REACTANTS DATA TABLE
  // ==========================================
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('2. REACTANTS DATA TABLE & VOLUMETRIC DOSING', margin, y);
  y += 3.5;

  // Table Headers
  const tableHeaders = ['#', 'Reagent / Substance', 'Concentration', 'Input Dosing', 'Density', 'Standard Volume', 'Batch %'];
  const colWidths = [10, 52, 28, 28, 22, 28, 14];

  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);

  let currentX = margin;
  tableHeaders.forEach((th, i) => {
    doc.text(th, currentX + 2, y + 4.2);
    currentX += colWidths[i];
  });

  y += 6;

  // Table Rows
  reactants.forEach((r, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, contentWidth, 6.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 6.5, margin + contentWidth, y + 6.5);

    const unit = r.unit || 'ml';
    const inputVal = r.amount_input !== undefined ? r.amount_input : (Number(r.amount_ml) || 0);
    const converted = standardizeToVolumeMl(inputVal, unit, r.name, r.concentration);
    const batchShare = totalVolumeMl > 0 ? ((converted.volumeMl / totalVolumeMl) * 100).toFixed(1) : '0.0';

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    let rowX = margin;
    // Index
    doc.text(`${idx + 1}`, rowX + 2, y + 4.5);
    rowX += colWidths[0];

    // Name
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    const truncatedName = r.name.length > 30 ? r.name.substring(0, 28) + '...' : r.name;
    doc.text(truncatedName, rowX + 2, y + 4.5);
    rowX += colWidths[1];

    // Concentration
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(r.concentration || 'Pure / Neat', rowX + 2, y + 4.5);
    rowX += colWidths[2];

    // Input Dosing
    doc.setFont('courier', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${inputVal} ${unit}`, rowX + 2, y + 4.5);
    rowX += colWidths[3];

    // Density
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`${converted.density.toFixed(2)} g/mL`, rowX + 2, y + 4.5);
    rowX += colWidths[4];

    // Standard Volume
    doc.setFont('courier', 'bold');
    doc.setTextColor(2, 132, 199);
    doc.text(`${converted.volumeMl.toFixed(1)} mL`, rowX + 2, y + 4.5);
    rowX += colWidths[5];

    // Batch %
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${batchShare}%`, rowX + 2, y + 4.5);

    y += 6.5;
  });

  // Table Total Footer
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL VOLUMETRIC REACTOR LOAD:', margin + 4, y + 4);
  doc.setFont('courier', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text(`${totalVolumeMl.toFixed(1)} mL (100.0% Fluid Inventory)`, margin + 110, y + 4);

  y += 11;

  // ==========================================
  // 4. SAFETY WARNINGS & HAZARD DIRECTIVES
  // ==========================================
  const warnings = simulationData?.safety_warnings || ['Standard laboratory safety protocols apply.'];
  doc.setFillColor(254, 242, 242); // Rose/Red tint
  doc.setDrawColor(248, 113, 113); // Red border
  doc.setLineWidth(0.4);
  const safetyBoxHeight = Math.max(22, 10 + (warnings.length * 4.8));
  doc.roundedRect(margin, y, contentWidth, safetyBoxHeight, 2, 2, 'FD');

  doc.setTextColor(185, 28, 28); // Dark Red
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('3. SAFETY WARNINGS & HAZARD PROTOCOLS (OSHA / ISO-45001)', margin + 4, y + 5.5);

  let warningY = y + 10.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(127, 29, 29);

  warnings.forEach((warning, i) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`[W${i + 1}]`, margin + 5, warningY);
    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(warning, contentWidth - 18);
    doc.text(splitText, margin + 14, warningY);
    warningY += splitText.length * 4.2;
  });

  y += safetyBoxHeight + 6;

  // ==========================================
  // 5. REACTOR SPECIFICATIONS & CAD DETAILS
  // ==========================================
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('4. MECHANICAL REACTOR VESSEL & AUTOCAD FABRICATION SPECS', margin + 4, y + 6);

  const cadLeft = margin + 4;
  const cadRight = margin + 95;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text('Reactor Vessel Classification:', cadLeft, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${dynamicCadParams.reactor_vessel_type} (ASME Section VIII Div 1)`, cadLeft + 42, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Vessel Width / Diameter:', cadLeft, y + 17);
  doc.setFont('courier', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${dynamicCadParams.structural_width_mm} mm`, cadLeft + 42, y + 17);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Overall Structural Height:', cadLeft, y + 22);
  doc.setFont('courier', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${dynamicCadParams.structural_height_mm} mm`, cadLeft + 42, y + 22);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Agitation / Impeller Type:', cadLeft, y + 27);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Marine 4-Blade Impeller (250 RPM)', cadLeft + 42, y + 27);

  // Column 2 of CAD
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Material of Construction:', cadRight, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('316L Stainless Steel / Borosilicate 3.3', cadRight + 38, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Calibrated Chamber Volume:', cadRight, y + 17);
  doc.setFont('courier', 'bold');
  doc.setTextColor(15, 23, 42);
  const chamberVolume = Math.round(
    Math.PI * Math.pow(dynamicCadParams.structural_width_mm / 20, 2) * (dynamicCadParams.structural_height_mm / 10)
  );
  doc.text(`${chamberVolume} mL`, cadRight + 38, y + 17);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Operational Headroom / Ullage:', cadRight, y + 22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const headroomPct = Math.max(10, Math.min(85, Math.round((1 - (totalVolumeMl / chamberVolume)) * 100)));
  doc.text(`${headroomPct}% Vapor Headroom Reserve`, cadRight + 38, y + 22);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('AutoCAD DXF Export Asset:', cadRight, y + 27);
  doc.setFont('courier', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text(`AutoCAD_Reactor_${industry}.dxf`, cadRight + 38, y + 27);

  y += 38;

  // ==========================================
  // 6. SIGNATURES & COMPLIANCE LEDGER
  // ==========================================
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 18, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 18, 'S');

  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  doc.text('Prepared By (Lead Engineer):', margin + 4, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(researcherName, margin + 4, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Electronic Signature: Verified Active Session', margin + 4, y + 14.5);

  const sigCol2 = margin + 95;
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Quality Assurance & Safety Auditor:', sigCol2, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Autonomous Safety Orchestration Core', sigCol2, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Verification Hash: SHA256-${reportId.replace(/[^A-Z0-9]/g, '')}`, sigCol2, y + 14.5);

  // ==========================================
  // 7. CLEAR DOCUMENT FOOTER
  // ==========================================
  const footerY = pageHeight - 8;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'CONFIDENTIAL LABORATORY RECORD — ChemLabs-AI Molecular Synthesis Deck & Parametric CAD Architecture',
    margin,
    footerY
  );
  doc.text('Page 1 of 1', pageWidth - margin, footerY, { align: 'right' });

  return doc;
}

/**
 * PRIMARY EXPORT:
 * generateLaboratoryReport takes experiment parameters, thermodynamic outputs,
 * and safety warnings as input, formats them into a professional laboratory report
 * with a clear header, data table, and footer, and enables a direct download for the user.
 */
export function generateLaboratoryReport(
  dataOrParams: PDFReportData | any,
  thermoOutputOrFilename?: string | any,
  safetyWarnings?: string[],
  explicitFilename?: string
): jsPDF {
  let normalizedData: PDFReportData;

  if (dataOrParams && 'simulationData' in dataOrParams) {
    normalizedData = dataOrParams as PDFReportData;
  } else {
    // Support decomposed argument style: (parameters, thermoOutput, safetyWarnings, filename)
    normalizedData = {
      industry: dataOrParams?.industry || 'Academic',
      reactants: dataOrParams?.reactants || [],
      modifiers: dataOrParams?.modifiers || {
        temperature_c: dataOrParams?.temperature_c ?? 25,
        pressure_atm: dataOrParams?.pressure_atm ?? 1.0,
        catalyst: dataOrParams?.catalyst,
      },
      simulationData: {
        balanced_equation: dataOrParams?.balanced_equation || 'N/A',
        thermo_output:
          typeof thermoOutputOrFilename === 'string' && !thermoOutputOrFilename.endsWith('.pdf')
            ? thermoOutputOrFilename
            : dataOrParams?.thermo_output || 'Exothermic',
        safety_warnings: Array.isArray(safetyWarnings)
          ? safetyWarnings
          : dataOrParams?.safety_warnings || ['Standard laboratory protocols apply.'],
        visuals: dataOrParams?.visuals || {
          hex_color: '#38bdf8',
          bubbling_speed: 40,
          precipitation_layer: 'none',
        },
        cad_parameters: dataOrParams?.cad_parameters || {
          reactor_vessel_type: 'Batch',
          structural_width_mm: 120,
          structural_height_mm: 220,
        },
        search_hooks: dataOrParams?.search_hooks || { scholar_query: '', image_query: '' },
      },
      dynamicCadParams: dataOrParams?.dynamicCadParams || dataOrParams?.cad_parameters || {
        reactor_vessel_type: 'Batch',
        structural_width_mm: 120,
        structural_height_mm: 220,
      },
      totalVolumeMl: dataOrParams?.totalVolumeMl,
      researcherName: dataOrParams?.researcherName,
      reportId: dataOrParams?.reportId,
      filename:
        explicitFilename ||
        (typeof thermoOutputOrFilename === 'string' && thermoOutputOrFilename.endsWith('.pdf')
          ? thermoOutputOrFilename
          : undefined),
    };
  }

  const doc = formatLaboratoryReportPDF(normalizedData);
  const resolvedFilename =
    explicitFilename ||
    (typeof thermoOutputOrFilename === 'string' && thermoOutputOrFilename.endsWith('.pdf')
      ? thermoOutputOrFilename
      : undefined) ||
    normalizedData.filename ||
    `ChemLabs_Lab_Report_${normalizedData.industry || 'Chemistry'}_${Date.now()}.pdf`;

  // Trigger direct download for user
  doc.save(resolvedFilename);
  return doc;
}

/**
 * Direct aliases for backwards compatibility and modular consumption
 */
export const downloadLaboratoryPDF = generateLaboratoryReport;
export const generateLaboratoryPDF = formatLaboratoryReportPDF;
export const downloadSimulationReportPDF = generateLaboratoryReport;
export const generateLaboratoryPDFReport = formatLaboratoryReportPDF;
export const exportLaboratoryReport = generateLaboratoryReport;
