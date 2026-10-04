import { ReactantUnit } from '../types/chemlab';

export interface ChemicalConversionResult {
  amount_ml: number;
  explanation: string;
  density_g_ml?: number;
}

// Known densities (g/mL) for common laboratory & industrial reagents
const KNOWN_DENSITIES: Record<string, number> = {
  water: 1.0,
  h2o: 1.0,
  aqueous: 1.02,
  hcl: 1.18,
  hydrochloric: 1.18,
  h2so4: 1.84,
  sulfuric: 1.84,
  naoh: 1.15,
  sodium_hydroxide: 1.15,
  acetic_anhydride: 1.08,
  acetic_acid: 1.05,
  salicylic: 1.44,
  aminophenol: 1.29,
  paracetamol: 1.26,
  diclofenac: 1.34,
  cuso4: 1.12,
  copper: 3.5, // bulk powder
  iron: 3.8, // bulk powder
  fe2o3: 2.8,
  aluminum: 2.1,
  al: 2.1,
  zinc: 3.2,
  zn: 3.2,
  lead: 4.5,
  pb: 4.5,
  ki: 1.15,
  potassium_iodide: 1.15,
  decane: 0.73,
  isobutane: 0.56,
  butene: 0.60,
  ammonia: 0.68,
  nh3: 0.68,
  ethanol: 0.789,
};

// Known molecular weights (g/mol)
const KNOWN_MOLAR_MASS: Record<string, number> = {
  hcl: 36.46,
  naoh: 40.0,
  h2so4: 98.08,
  h2o: 18.02,
  salicylic: 138.12,
  acetic_anhydride: 102.09,
  aminophenol: 109.13,
  paracetamol: 151.16,
  diclofenac: 296.15,
  cuso4: 159.61,
  ki: 166.0,
  lead: 331.2,
  pb: 331.2,
  fe2o3: 159.69,
  al: 26.98,
  zinc: 65.38,
  zn: 65.38,
  n2: 28.01,
  h2: 2.016,
  nh3: 17.03,
  decane: 142.28,
  isobutane: 58.12,
  butene: 56.11,
};

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

function findDensity(name: string): number {
  const norm = normalizeName(name);
  for (const [key, val] of Object.entries(KNOWN_DENSITIES)) {
    if (norm.includes(key)) return val;
  }
  return 1.02; // default liquid density in g/mL
}

function findMolarMass(name: string): number {
  const norm = normalizeName(name);
  for (const [key, val] of Object.entries(KNOWN_MOLAR_MASS)) {
    if (norm.includes(key)) return val;
  }
  return 75.0; // default average molar mass in g/mol
}

function parseMolarity(concentration: string): number | null {
  const match = concentration.match(/([\d.]+)\s*M\b/i);
  if (match) {
    const val = parseFloat(match[1]);
    if (!isNaN(val) && val > 0) return val;
  }
  return null;
}

/**
 * Calculates the equivalent volumetric amount in mL from any unit (ml, g, mol)
 */
export function calculateVolumetricMl(
  name: string,
  amount: number,
  unit: ReactantUnit,
  concentration: string
): ChemicalConversionResult {
  const safeAmount = Math.max(0, amount || 0);

  if (unit === 'ml') {
    return {
      amount_ml: Math.round(safeAmount * 10) / 10,
      explanation: `${safeAmount} mL volumetric direct`,
    };
  }

  if (unit === 'g') {
    const density = findDensity(name);
    // V (mL) = Mass (g) / Density (g/mL)
    const ml = safeAmount / density;
    const roundedMl = Math.max(1, Math.round(ml * 10) / 10);
    return {
      amount_ml: roundedMl,
      explanation: `≈ ${roundedMl} mL (ρ ≈ ${density} g/mL)`,
      density_g_ml: density,
    };
  }

  if (unit === 'mol') {
    const molarity = parseMolarity(concentration);
    if (molarity) {
      // V (L) = moles / M  => V (mL) = (moles / M) * 1000
      const ml = (safeAmount / molarity) * 1000;
      const roundedMl = Math.max(1, Math.round(ml * 10) / 10);
      return {
        amount_ml: roundedMl,
        explanation: `≈ ${roundedMl} mL (${molarity}M sol.)`,
      };
    } else {
      // For pure substances or non-molar concentrations:
      // Mass (g) = moles * M_w; Volume (mL) = Mass / density
      const mw = findMolarMass(name);
      const density = findDensity(name);
      const massG = safeAmount * mw;
      const ml = massG / density;
      const roundedMl = Math.max(1, Math.round(ml * 10) / 10);
      return {
        amount_ml: roundedMl,
        explanation: `≈ ${roundedMl} mL (Mw: ${mw} g/mol)`,
        density_g_ml: density,
      };
    }
  }

  return {
    amount_ml: safeAmount,
    explanation: `${safeAmount} mL`,
  };
}

/**
 * Converts value from one unit to another, preserving physical volume
 */
export function convertBetweenUnits(
  name: string,
  value: number,
  fromUnit: ReactantUnit,
  toUnit: ReactantUnit,
  concentration: string
): { convertedValue: number; amount_ml: number; explanation: string } {
  if (fromUnit === toUnit) {
    const res = calculateVolumetricMl(name, value, toUnit, concentration);
    return {
      convertedValue: value,
      amount_ml: res.amount_ml,
      explanation: res.explanation,
    };
  }

  // 1. Convert source to base volumetric mL
  const volInMl = calculateVolumetricMl(name, value, fromUnit, concentration).amount_ml;

  // 2. Convert from mL to target unit
  const density = findDensity(name);
  const molarity = parseMolarity(concentration);
  const mw = findMolarMass(name);

  let newAmount = value;

  if (toUnit === 'ml') {
    newAmount = Math.round(volInMl * 10) / 10;
  } else if (toUnit === 'g') {
    // Mass = Volume * Density
    const mass = volInMl * density;
    newAmount = Math.max(0.1, Math.round(mass * 10) / 10);
  } else if (toUnit === 'mol') {
    if (molarity) {
      // Moles = (Volume_mL / 1000) * Molarity
      const moles = (volInMl / 1000) * molarity;
      newAmount = Math.max(0.001, Math.round(moles * 1000) / 1000);
    } else {
      // Moles = (Volume * Density) / Mw
      const mass = volInMl * density;
      const moles = mass / mw;
      newAmount = Math.max(0.001, Math.round(moles * 1000) / 1000);
    }
  }

  const finalCalc = calculateVolumetricMl(name, newAmount, toUnit, concentration);
  return {
    convertedValue: newAmount,
    amount_ml: finalCalc.amount_ml,
    explanation: finalCalc.explanation,
  };
}

