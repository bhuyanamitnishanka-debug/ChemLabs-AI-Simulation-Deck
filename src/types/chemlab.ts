export type IndustryType = 'Pharma' | 'Metallurgy' | 'Academic' | 'Petrochemical';

export type ReactantUnit = 'ml' | 'g' | 'mol';

export interface ChemicalReactant {
  name: string;
  concentration: string;
  amount_ml: number;
  unit?: ReactantUnit;
  amount_input?: number;
}

export interface ReactionModifiers {
  temperature_c: number;
  pressure_atm: number;
  catalyst?: string;
}

export interface SimulationRequestPayload {
  industry: IndustryType;
  reactants: ChemicalReactant[];
  modifiers: ReactionModifiers;
}

export interface VisualsOutput {
  hex_color: string;
  bubbling_speed: number; // 0-100
  precipitation_layer: 'none' | 'bottom' | 'suspended';
}

export interface CadParametersOutput {
  reactor_vessel_type: 'CSTR' | 'Batch' | 'Tube';
  structural_width_mm: number;
  structural_height_mm: number;
}

export type CadParameters = CadParametersOutput;

export interface SearchHooksOutput {
  scholar_query: string;
  image_query: string;
}

export interface SimulationResponsePayload {
  balanced_equation: string;
  thermo_output: string; // "Exothermic | Endothermic (Value in kJ/mol)"
  safety_warnings: string[];
  visuals: VisualsOutput;
  cad_parameters: CadParametersOutput;
  search_hooks: SearchHooksOutput;
  // Extended metadata for UI
  reaction_name?: string;
  enthalpy_kj_mol?: number;
  kinetics_rate?: string;
  primary_phase?: string;
}

export interface IndustryPreset {
  id: string;
  name: string;
  industry: IndustryType;
  description: string;
  reactants: ChemicalReactant[];
  modifiers: ReactionModifiers;
  expectedOutput: SimulationResponsePayload;
}

export interface ExperimentHistoryItem {
  id: string;
  timestamp: string;
  relativeTime: string;
  title: string;
  industry: IndustryType;
  reactants: ChemicalReactant[];
  modifiers: ReactionModifiers;
  simulationData: SimulationResponsePayload;
}

