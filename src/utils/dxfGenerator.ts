/**
 * AutoCAD DXF R2010 Generator for Chemical Reactor Vessels
 * Produces industry-compliant DXF ASCII layout files directly compatible with
 * AutoCAD, SolidWorks, FreeCAD, Fusion 360, and QCAD.
 */

export interface DXFOptions {
  chemicalName: string;
  reactorType: 'CSTR' | 'Batch' | 'Tube';
  widthMm: number;
  heightMm: number;
  volumeMl: number;
  industry: string;
  balancedEquation?: string;
  temperatureC?: number;
  pressureAtm?: number;
}

export function generateAutoCAD_DXF(options: DXFOptions): string {
  const {
    chemicalName,
    reactorType,
    widthMm,
    heightMm,
    volumeMl,
    industry,
    balancedEquation = 'N/A',
    temperatureC = 25,
    pressureAtm = 1.0,
  } = options;

  const w = Math.max(20, widthMm);
  const h = Math.max(40, heightMm);
  const halfW = w / 2;

  // Formatting helper for DXF entities
  const lines: string[] = [];

  function addPair(code: number, val: string | number) {
    lines.push(`${code}`);
    lines.push(`${val}`);
  }

  function addLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    layer = 'VESSEL_OUTLINE',
    color = 7
  ) {
    addPair(0, 'LINE');
    addPair(8, layer);
    addPair(62, color);
    addPair(10, x1.toFixed(3));
    addPair(20, y1.toFixed(3));
    addPair(30, '0.000');
    addPair(11, x2.toFixed(3));
    addPair(21, y2.toFixed(3));
    addPair(31, '0.000');
  }

  function addCircle(
    cx: number,
    cy: number,
    radius: number,
    layer = 'VESSEL_DETAILS',
    color = 4
  ) {
    addPair(0, 'CIRCLE');
    addPair(8, layer);
    addPair(62, color);
    addPair(10, cx.toFixed(3));
    addPair(20, cy.toFixed(3));
    addPair(30, '0.000');
    addPair(40, radius.toFixed(3));
  }

  function addText(
    text: string,
    x: number,
    y: number,
    height = 3.5,
    layer = 'ANNOTATIONS',
    color = 2
  ) {
    addPair(0, 'TEXT');
    addPair(8, layer);
    addPair(62, color);
    addPair(10, x.toFixed(3));
    addPair(20, y.toFixed(3));
    addPair(30, '0.000');
    addPair(40, height.toFixed(3));
    addPair(1, text);
  }

  // --- HEADER SECTION ---
  addPair(0, 'SECTION');
  addPair(2, 'HEADER');
  addPair(9, '$ACADVER');
  addPair(1, 'AC1024'); // AutoCAD R2010
  addPair(9, '$INSUNITS');
  addPair(70, 4); // Millimeters
  addPair(0, 'ENDSEC');

  // --- TABLES SECTION (Layers) ---
  addPair(0, 'SECTION');
  addPair(2, 'TABLES');
  addPair(0, 'TABLE');
  addPair(2, 'LAYER');
  addPair(70, 6);

  const layerDefs = [
    { name: 'VESSEL_OUTLINE', color: 7 }, // White / Black
    { name: 'VESSEL_DETAILS', color: 4 }, // Cyan
    { name: 'DIMENSIONS', color: 2 }, // Yellow
    { name: 'ANNOTATIONS', color: 3 }, // Green
    { name: 'CENTERLINES', color: 1 }, // Red
    { name: 'TITLE_BLOCK', color: 5 }, // Blue
  ];

  for (const l of layerDefs) {
    addPair(0, 'LAYER');
    addPair(2, l.name);
    addPair(70, 0);
    addPair(62, l.color);
    addPair(6, 'CONTINUOUS');
  }

  addPair(0, 'ENDTAB');
  addPair(0, 'ENDSEC');

  // --- BLOCKS SECTION ---
  addPair(0, 'SECTION');
  addPair(2, 'BLOCKS');
  addPair(0, 'ENDSEC');

  // --- ENTITIES SECTION ---
  addPair(0, 'SECTION');
  addPair(2, 'ENTITIES');

  // 1. Centerline
  const centerExt = 15;
  addLine(0, -centerExt, 0, h + centerExt, 'CENTERLINES', 1);

  // 2. Main vessel cylindrical body
  const dishedH = Math.min(w * 0.25, 25);
  const bodyBottomY = dishedH;
  const bodyTopY = h - dishedH;

  // Left wall
  addLine(-halfW, bodyBottomY, -halfW, bodyTopY, 'VESSEL_OUTLINE', 7);
  // Right wall
  addLine(halfW, bodyBottomY, halfW, bodyTopY, 'VESSEL_OUTLINE', 7);

  // Bottom head (torispherical curve approximate segments)
  addLine(-halfW, bodyBottomY, -halfW * 0.7, 0, 'VESSEL_OUTLINE', 7);
  addLine(-halfW * 0.7, 0, halfW * 0.7, 0, 'VESSEL_OUTLINE', 7);
  addLine(halfW * 0.7, 0, halfW, bodyBottomY, 'VESSEL_OUTLINE', 7);

  // Top head
  addLine(-halfW, bodyTopY, -halfW * 0.7, h, 'VESSEL_OUTLINE', 7);
  addLine(-halfW * 0.7, h, halfW * 0.7, h, 'VESSEL_OUTLINE', 7);
  addLine(halfW * 0.7, h, halfW, bodyTopY, 'VESSEL_OUTLINE', 7);

  // 3. Reactor Specific Internals & Fittings
  if (reactorType === 'CSTR') {
    // Top Motor Mount Box
    addLine(-halfW * 0.3, h, -halfW * 0.3, h + 18, 'VESSEL_DETAILS', 4);
    addLine(halfW * 0.3, h, halfW * 0.3, h + 18, 'VESSEL_DETAILS', 4);
    addLine(-halfW * 0.3, h + 18, halfW * 0.3, h + 18, 'VESSEL_DETAILS', 4);

    // Agitator central shaft
    addLine(-1.5, 12, -1.5, h + 15, 'VESSEL_DETAILS', 4);
    addLine(1.5, 12, 1.5, h + 15, 'VESSEL_DETAILS', 4);

    // Impeller Turbine blades (tier 1)
    const bladeW = halfW * 0.65;
    addLine(-bladeW, 20, bladeW, 20, 'VESSEL_DETAILS', 4);
    addLine(-bladeW, 28, -bladeW, 20, 'VESSEL_DETAILS', 4);
    addLine(bladeW, 28, bladeW, 20, 'VESSEL_DETAILS', 4);

    // Impeller Turbine blades (tier 2 if tall)
    if (h > 120) {
      const midH = h * 0.55;
      addLine(-bladeW, midH, bladeW, midH, 'VESSEL_DETAILS', 4);
      addLine(-bladeW, midH + 8, -bladeW, midH, 'VESSEL_DETAILS', 4);
      addLine(bladeW, midH + 8, bladeW, midH, 'VESSEL_DETAILS', 4);
    }

    // Baffle plates
    addLine(-halfW + 4, bodyBottomY + 5, -halfW + 4, bodyTopY - 5, 'VESSEL_DETAILS', 4);
    addLine(halfW - 4, bodyBottomY + 5, halfW - 4, bodyTopY - 5, 'VESSEL_DETAILS', 4);
  } else if (reactorType === 'Tube') {
    // Tubular PFR internals (serpentine or tube bundle)
    const tubes = 4;
    const step = (w * 0.7) / (tubes + 1);
    for (let i = 1; i <= tubes; i++) {
      const tx = -halfW * 0.7 + i * step;
      addLine(tx, bodyBottomY + 8, tx, bodyTopY - 8, 'VESSEL_DETAILS', 4);
      addCircle(tx, bodyBottomY + 8, 2, 'VESSEL_DETAILS', 4);
      addCircle(tx, bodyTopY - 8, 2, 'VESSEL_DETAILS', 4);
    }
  } else {
    // Batch Reactor: Heating/Cooling Jacket
    const jGap = 8;
    addLine(-halfW - jGap, bodyBottomY - 2, -halfW - jGap, bodyTopY - 15, 'VESSEL_DETAILS', 4);
    addLine(halfW + jGap, bodyBottomY - 2, halfW + jGap, bodyTopY - 15, 'VESSEL_DETAILS', 4);
    addLine(-halfW - jGap, bodyBottomY - 2, -halfW, bodyBottomY - 2, 'VESSEL_DETAILS', 4);
    addLine(halfW + jGap, bodyBottomY - 2, halfW, bodyBottomY - 2, 'VESSEL_DETAILS', 4);
    addLine(-halfW - jGap, bodyTopY - 15, -halfW, bodyTopY - 15, 'VESSEL_DETAILS', 4);
    addLine(halfW + jGap, bodyTopY - 15, halfW, bodyTopY - 15, 'VESSEL_DETAILS', 4);
  }

  // 4. Nozzles & Flanges
  // Top Feed nozzle
  addLine(-halfW * 0.5, h, -halfW * 0.5, h + 12, 'VESSEL_DETAILS', 4);
  addLine(-halfW * 0.5 + 8, h, -halfW * 0.5 + 8, h + 12, 'VESSEL_DETAILS', 4);
  addLine(-halfW * 0.5 - 3, h + 12, -halfW * 0.5 + 11, h + 12, 'VESSEL_DETAILS', 4);

  // Pressure Relief / Vent Nozzle
  addLine(halfW * 0.5 - 6, h, halfW * 0.5 - 6, h + 10, 'VESSEL_DETAILS', 4);
  addLine(halfW * 0.5, h, halfW * 0.5, h + 10, 'VESSEL_DETAILS', 4);
  addLine(halfW * 0.5 - 8, h + 10, halfW * 0.5 + 2, h + 10, 'VESSEL_DETAILS', 4);

  // Bottom Drain Nozzle
  addLine(-5, 0, -5, -12, 'VESSEL_DETAILS', 4);
  addLine(5, 0, 5, -12, 'VESSEL_DETAILS', 4);
  addLine(-8, -12, 8, -12, 'VESSEL_DETAILS', 4);

  // 5. Dimensioning
  // Horizontal Width Dimension
  const dimY = -22;
  addLine(-halfW, dimY, halfW, dimY, 'DIMENSIONS', 2);
  // Extension lines
  addLine(-halfW, 0, -halfW, dimY - 4, 'DIMENSIONS', 2);
  addLine(halfW, 0, halfW, dimY - 4, 'DIMENSIONS', 2);
  // Dimension tick marks
  addLine(-halfW - 2, dimY - 2, -halfW + 2, dimY + 2, 'DIMENSIONS', 2);
  addLine(halfW - 2, dimY - 2, halfW + 2, dimY + 2, 'DIMENSIONS', 2);
  addText(`WIDTH: ${w.toFixed(1)} mm`, -20, dimY - 6, 3.2, 'DIMENSIONS', 2);

  // Vertical Height Dimension
  const dimX = halfW + 22;
  addLine(dimX, 0, dimX, h, 'DIMENSIONS', 2);
  // Extension lines
  addLine(halfW, 0, dimX + 4, 0, 'DIMENSIONS', 2);
  addLine(halfW, h, dimX + 4, h, 'DIMENSIONS', 2);
  // Dimension tick marks
  addLine(dimX - 2, -2, dimX + 2, 2, 'DIMENSIONS', 2);
  addLine(dimX - 2, h - 2, dimX + 2, h + 2, 'DIMENSIONS', 2);
  addText(`HEIGHT: ${h.toFixed(1)} mm`, dimX + 4, h / 2, 3.2, 'DIMENSIONS', 2);

  // 6. Title Block & Annotations
  const tbX = -halfW - 75;
  const tbY = h + 25;
  addText(`CHEMLABS-AI AUTOCAD SPECIFICATION`, tbX, tbY, 4.5, 'ANNOTATIONS', 3);
  addText(`VESSEL DESIGN: ${chemicalName.toUpperCase()} REACTION SYSTEM`, tbX, tbY - 7, 3.5, 'ANNOTATIONS', 3);
  addText(`VESSEL TYPE: ${reactorType} REACTOR`, tbX, tbY - 14, 3.0, 'ANNOTATIONS', 3);
  addText(`INDUSTRY: ${industry}`, tbX, tbY - 20, 2.8, 'ANNOTATIONS', 3);
  addText(`DESIGN CAPACITY: ${volumeMl} mL`, tbX, tbY - 26, 2.8, 'ANNOTATIONS', 3);
  addText(`DESIGN PARAMETERS: ${temperatureC} C | ${pressureAtm} atm`, tbX, tbY - 32, 2.8, 'ANNOTATIONS', 3);
  addText(`EQUATION: ${balancedEquation.slice(0, 50)}`, tbX, tbY - 38, 2.5, 'ANNOTATIONS', 3);

  // Close sections
  addPair(0, 'ENDSEC');
  addPair(0, 'EOF');

  return lines.join('\n');
}

export function downloadDXFFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'application/dxf;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.dxf') ? filename : `${filename}.dxf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
