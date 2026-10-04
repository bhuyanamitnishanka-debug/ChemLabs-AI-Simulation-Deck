import { ReactantUnit } from '../types/chemlab';

/**
 * Standard physical & chemical properties for common laboratory and industrial chemicals
 */
export interface ChemicalProperties {
  density: number; // in g/mL at 20-25°C
  molarMass: number; // in g/mol
  standardPhase: 'liquid' | 'solid' | 'aqueous' | 'gas';
  commonName: string;
}

/**
 * Exhaustive database of common laboratory reagents, solvents, acids, bases, and industrial chemicals
 */
export const CHEMICAL_DATABASE: Record<string, ChemicalProperties> = {
  // Common Inorganic Acids & Bases
  'hydrochloric acid': { density: 1.18, molarMass: 36.46, standardPhase: 'aqueous', commonName: 'Hydrochloric Acid (HCl)' },
  'hcl': { density: 1.18, molarMass: 36.46, standardPhase: 'aqueous', commonName: 'Hydrochloric Acid (HCl)' },
  'sulfuric acid': { density: 1.84, molarMass: 98.08, standardPhase: 'liquid', commonName: 'Sulfuric Acid (H2SO4)' },
  'h2so4': { density: 1.84, molarMass: 98.08, standardPhase: 'liquid', commonName: 'Sulfuric Acid (H2SO4)' },
  'nitric acid': { density: 1.42, molarMass: 63.01, standardPhase: 'liquid', commonName: 'Nitric Acid (HNO3)' },
  'hno3': { density: 1.42, molarMass: 63.01, standardPhase: 'liquid', commonName: 'Nitric Acid (HNO3)' },
  'acetic acid': { density: 1.05, molarMass: 60.05, standardPhase: 'liquid', commonName: 'Acetic Acid (CH3COOH)' },
  'ch3cooh': { density: 1.05, molarMass: 60.05, standardPhase: 'liquid', commonName: 'Acetic Acid (CH3COOH)' },
  'sodium hydroxide': { density: 1.15, molarMass: 40.00, standardPhase: 'aqueous', commonName: 'Sodium Hydroxide (NaOH)' },
  'naoh': { density: 1.15, molarMass: 40.00, standardPhase: 'aqueous', commonName: 'Sodium Hydroxide (NaOH)' },
  'potassium hydroxide': { density: 1.18, molarMass: 56.11, standardPhase: 'aqueous', commonName: 'Potassium Hydroxide (KOH)' },
  'koh': { density: 1.18, molarMass: 56.11, standardPhase: 'aqueous', commonName: 'Potassium Hydroxide (KOH)' },
  'ammonia': { density: 0.90, molarMass: 17.03, standardPhase: 'aqueous', commonName: 'Ammonia Solution (NH4OH)' },
  'nh3': { density: 0.90, molarMass: 17.03, standardPhase: 'aqueous', commonName: 'Ammonia (NH3)' },

  // Solvents & Water
  'water': { density: 1.00, molarMass: 18.02, standardPhase: 'liquid', commonName: 'Water (H2O)' },
  'h2o': { density: 1.00, molarMass: 18.02, standardPhase: 'liquid', commonName: 'Water (H2O)' },
  'ethanol': { density: 0.789, molarMass: 46.07, standardPhase: 'liquid', commonName: 'Ethanol (C2H5OH)' },
  'c2h5oh': { density: 0.789, molarMass: 46.07, standardPhase: 'liquid', commonName: 'Ethanol (C2H5OH)' },
  'methanol': { density: 0.792, molarMass: 32.04, standardPhase: 'liquid', commonName: 'Methanol (CH3OH)' },
  'acetone': { density: 0.784, molarMass: 58.08, standardPhase: 'liquid', commonName: 'Acetone (C3H6O)' },
  'decane': { density: 0.730, molarMass: 142.28, standardPhase: 'liquid', commonName: 'Decane (C10H22)' },
  'c10h22': { density: 0.730, molarMass: 142.28, standardPhase: 'liquid', commonName: 'Decane (C10H22)' },
  'isobutane': { density: 0.557, molarMass: 58.12, standardPhase: 'liquid', commonName: 'Isobutane (C4H10)' },
  'butene': { density: 0.595, molarMass: 56.11, standardPhase: 'liquid', commonName: '1-Butene (C4H8)' },

  // Pharmaceutical Reagents
  'salicylic acid': { density: 1.44, molarMass: 138.12, standardPhase: 'solid', commonName: 'Salicylic Acid (C7H6O3)' },
  'acetic anhydride': { density: 1.08, molarMass: 102.09, standardPhase: 'liquid', commonName: 'Acetic Anhydride (C4H6O3)' },
  '4-aminophenol': { density: 1.29, molarMass: 109.13, standardPhase: 'solid', commonName: '4-Aminophenol (C6H7NO)' },
  'aminophenol': { density: 1.29, molarMass: 109.13, standardPhase: 'solid', commonName: '4-Aminophenol (C6H7NO)' },
  'aspirin': { density: 1.40, molarMass: 180.16, standardPhase: 'solid', commonName: 'Acetylsalicylic Acid' },
  'paracetamol': { density: 1.26, molarMass: 151.16, standardPhase: 'solid', commonName: 'Paracetamol (Acetaminophen)' },

  // Inorganic Salts, Precipitants & Metallurgy
  'copper': { density: 3.50, molarMass: 63.55, standardPhase: 'solid', commonName: 'Copper Granules (Cu)' },
  'cu': { density: 3.50, molarMass: 63.55, standardPhase: 'solid', commonName: 'Copper Granules (Cu)' },
  'copper sulfate': { density: 1.15, molarMass: 159.61, standardPhase: 'aqueous', commonName: 'Copper(II) Sulfate (CuSO4)' },
  'cuso4': { density: 1.15, molarMass: 159.61, standardPhase: 'aqueous', commonName: 'Copper(II) Sulfate (CuSO4)' },
  'zinc': { density: 3.20, molarMass: 65.38, standardPhase: 'solid', commonName: 'Zinc Powder (Zn)' },
  'zn': { density: 3.20, molarMass: 65.38, standardPhase: 'solid', commonName: 'Zinc Powder (Zn)' },
  'iron': { density: 3.80, molarMass: 55.85, standardPhase: 'solid', commonName: 'Iron Powder (Fe)' },
  'iron oxide': { density: 2.80, molarMass: 159.69, standardPhase: 'solid', commonName: 'Iron(III) Oxide (Fe2O3)' },
  'fe2o3': { density: 2.80, molarMass: 159.69, standardPhase: 'solid', commonName: 'Iron(III) Oxide (Fe2O3)' },
  'aluminum': { density: 2.10, molarMass: 26.98, standardPhase: 'solid', commonName: 'Aluminum Powder (Al)' },
  'al': { density: 2.10, molarMass: 26.98, standardPhase: 'solid', commonName: 'Aluminum Powder (Al)' },
  'lead nitrate': { density: 1.35, molarMass: 331.20, standardPhase: 'aqueous', commonName: 'Lead(II) Nitrate (Pb(NO3)2)' },
  'potassium iodide': { density: 1.15, molarMass: 166.00, standardPhase: 'aqueous', commonName: 'Potassium Iodide (KI)' },
  'ki': { density: 1.15, molarMass: 166.00, standardPhase: 'aqueous', commonName: 'Potassium Iodide (KI)' },
  'nitrogen': { density: 0.808, molarMass: 28.01, standardPhase: 'gas', commonName: 'Nitrogen (N2)' },
  'hydrogen': { density: 0.071, molarMass: 2.016, standardPhase: 'gas', commonName: 'Hydrogen (H2)' },
};

/**
 * Standard density fallback for unlisted chemicals
 */
export const DEFAULT_DENSITY = 1.02; // g/mL (typical aqueous liquid)
export const DEFAULT_MOLAR_MASS = 75.0; // g/mol

/**
 * Normalizes chemical names for robust database lookup
 */
export function normalizeChemicalKey(rawName: string): string {
  return rawName.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().replace(/\s+/g, ' ');
}

/**
 * Looks up density (g/mL) for a chemical substance with intelligent substring matching
 */
export function getChemicalDensity(chemicalName: string): number {
  const norm = normalizeChemicalKey(chemicalName);
  
  // Exact match
  if (CHEMICAL_DATABASE[norm]) {
    return CHEMICAL_DATABASE[norm].density;
  }

  // Substring match
  for (const [key, prop] of Object.entries(CHEMICAL_DATABASE)) {
    if (norm.includes(key) || key.includes(norm)) {
      return prop.density;
    }
  }

  return DEFAULT_DENSITY;
}

/**
 * Looks up molar mass (g/mol) for a chemical substance
 */
export function getChemicalMolarMass(chemicalName: string): number {
  const norm = normalizeChemicalKey(chemicalName);

  if (CHEMICAL_DATABASE[norm]) {
    return CHEMICAL_DATABASE[norm].molarMass;
  }

  for (const [key, prop] of Object.entries(CHEMICAL_DATABASE)) {
    if (norm.includes(key) || key.includes(norm)) {
      return prop.molarMass;
    }
  }

  return DEFAULT_MOLAR_MASS;
}

/**
 * Extracts molarity M (mol/L) from concentration strings like "2M", "1.5 M", "0.25M", "2 mol/L"
 */
export function parseMolarityFromConcentration(concentration: string): number | null {
  if (!concentration) return null;
  const match = concentration.match(/([\d.]+)\s*(?:M|mol\/L)\b/i);
  if (match) {
    const val = parseFloat(match[1]);
    if (!isNaN(val) && val > 0) return val;
  }
  return null;
}

/**
 * Standardizes mass (g) to equivalent volume (mL) using chemical density lookup
 * Formula: Volume (mL) = Mass (g) / Density (g/mL)
 */
export function convertMassToVolume(
  massG: number,
  chemicalName: string
): { volumeMl: number; density: number } {
  const safeMass = Math.max(0, massG || 0);
  const density = getChemicalDensity(chemicalName);
  const volumeMl = Math.max(0.1, Math.round((safeMass / density) * 10) / 10);
  return { volumeMl, density };
}

/**
 * Standardizes volume (mL) to equivalent mass (g) using chemical density lookup
 * Formula: Mass (g) = Volume (mL) * Density (g/mL)
 */
export function convertVolumeToMass(
  volumeMl: number,
  chemicalName: string
): { massG: number; density: number } {
  const safeVol = Math.max(0, volumeMl || 0);
  const density = getChemicalDensity(chemicalName);
  const massG = Math.max(0.1, Math.round((safeVol * density) * 10) / 10);
  return { massG, density };
}

/**
 * Standardizes moles (mol) to equivalent volume (mL)
 * If molar concentration is provided (e.g. 2M):
 *   Volume (mL) = (Moles / Molarity) * 1000
 * If pure substance or non-molar:
 *   Volume (mL) = (Moles * Molar Mass) / Density
 */
export function convertMolesToVolume(
  moles: number,
  chemicalName: string,
  concentration: string = ''
): { volumeMl: number; explanation: string; density: number; molarMass: number } {
  const safeMoles = Math.max(0, moles || 0);
  const molarity = parseMolarityFromConcentration(concentration);
  const density = getChemicalDensity(chemicalName);
  const molarMass = getChemicalMolarMass(chemicalName);

  if (molarity) {
    const volumeMl = Math.max(0.1, Math.round(((safeMoles / molarity) * 1000) * 10) / 10);
    return {
      volumeMl,
      explanation: `${safeMoles} mol ÷ ${molarity}M = ${volumeMl} mL`,
      density,
      molarMass,
    };
  }

  // Pure reagent: mass = moles * Mw; vol = mass / density
  const massG = safeMoles * molarMass;
  const volumeMl = Math.max(0.1, Math.round((massG / density) * 10) / 10);
  return {
    volumeMl,
    explanation: `${safeMoles} mol × ${molarMass} g/mol ÷ ${density} g/mL = ${volumeMl} mL`,
    density,
    molarMass,
  };
}

/**
 * Standardizes volume (mL) to equivalent moles (mol)
 */
export function convertVolumeToMoles(
  volumeMl: number,
  chemicalName: string,
  concentration: string = ''
): { moles: number; explanation: string } {
  const safeVol = Math.max(0, volumeMl || 0);
  const molarity = parseMolarityFromConcentration(concentration);
  const density = getChemicalDensity(chemicalName);
  const molarMass = getChemicalMolarMass(chemicalName);

  if (molarity) {
    const moles = Math.max(0.001, Math.round(((safeVol / 1000) * molarity) * 1000) / 1000);
    return {
      moles,
      explanation: `${safeVol} mL × ${molarity}M ÷ 1000 = ${moles} mol`,
    };
  }

  const massG = safeVol * density;
  const moles = Math.max(0.001, Math.round((massG / molarMass) * 1000) / 1000);
  return {
    moles,
    explanation: `${safeVol} mL × ${density} g/mL ÷ ${molarMass} g/mol = ${moles} mol`,
  };
}

/**
 * Standardizes any input amount in (ml, g, mol) to equivalent liquid volume in mL
 * This is the primary function for reactor CAD scaling and liquid visual rendering.
 */
export function standardizeToVolumeMl(
  amount: number,
  unit: ReactantUnit,
  chemicalName: string,
  concentration: string = ''
): { volumeMl: number; explanation: string; density: number } {
  const safeAmount = Math.max(0, amount || 0);
  const density = getChemicalDensity(chemicalName);

  if (unit === 'ml') {
    return {
      volumeMl: Math.round(safeAmount * 10) / 10,
      explanation: `${safeAmount} mL direct volume`,
      density,
    };
  }

  if (unit === 'g') {
    const res = convertMassToVolume(safeAmount, chemicalName);
    return {
      volumeMl: res.volumeMl,
      explanation: `${safeAmount}g ÷ ${res.density} g/mL = ${res.volumeMl} mL`,
      density: res.density,
    };
  }

  if (unit === 'mol') {
    const res = convertMolesToVolume(safeAmount, chemicalName, concentration);
    return {
      volumeMl: res.volumeMl,
      explanation: res.explanation,
      density: res.density,
    };
  }

  return {
    volumeMl: safeAmount,
    explanation: `${safeAmount} mL`,
    density,
  };
}

/**
 * Converts reactant amount between any two units (ml <-> g <-> mol) preserving physical batch quantity
 */
export function convertReactantAmount(
  value: number,
  fromUnit: ReactantUnit,
  toUnit: ReactantUnit,
  chemicalName: string,
  concentration: string = ''
): { convertedAmount: number; volumeMl: number; explanation: string } {
  if (fromUnit === toUnit) {
    const std = standardizeToVolumeMl(value, toUnit, chemicalName, concentration);
    return {
      convertedAmount: value,
      volumeMl: std.volumeMl,
      explanation: std.explanation,
    };
  }

  // 1. Calculate base volumetric mL
  const baseVolMl = standardizeToVolumeMl(value, fromUnit, chemicalName, concentration).volumeMl;

  // 2. Convert from base volumetric mL to target unit
  let targetAmount = value;

  if (toUnit === 'ml') {
    targetAmount = Math.round(baseVolMl * 10) / 10;
  } else if (toUnit === 'g') {
    const res = convertVolumeToMass(baseVolMl, chemicalName);
    targetAmount = res.massG;
  } else if (toUnit === 'mol') {
    const res = convertVolumeToMoles(baseVolMl, chemicalName, concentration);
    targetAmount = res.moles;
  }

  const finalVol = standardizeToVolumeMl(targetAmount, toUnit, chemicalName, concentration);

  return {
    convertedAmount: targetAmount,
    volumeMl: finalVol.volumeMl,
    explanation: finalVol.explanation,
  };
}
