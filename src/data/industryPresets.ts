import { IndustryPreset } from '../types/chemlab';

export const INDUSTRY_PRESETS: IndustryPreset[] = [
  // --- ACADEMIC ---
  {
    id: 'academic-titration',
    name: 'Acid-Base Neutralization Titration',
    industry: 'Academic',
    description: 'Hydrochloric acid titration with Sodium hydroxide and phenolphthalein indicator reaching equivalence point.',
    reactants: [
      { name: 'Hydrochloric Acid (HCl)', concentration: '1.0M', amount_ml: 150 },
      { name: 'Sodium Hydroxide (NaOH)', concentration: '1.0M', amount_ml: 150 },
    ],
    modifiers: { temperature_c: 25, pressure_atm: 1.0 },
    expectedOutput: {
      balanced_equation: 'HCl(aq) + NaOH(aq) -> NaCl(aq) + H2O(l)',
      thermo_output: 'Exothermic (-57.3 kJ/mol)',
      safety_warnings: [
        'Corrosive reagents: Wear chemical splash goggles and neoprene gloves',
        'Exothermic heat rise: Add titrant slowly to prevent thermal splashing',
        'Maintain eye-wash station availability and acid/base neutralizer spill kits',
      ],
      visuals: {
        hex_color: '#ff66b2', // Vivid indicator pink
        bubbling_speed: 12,
        precipitation_layer: 'none',
      },
      cad_parameters: {
        reactor_vessel_type: 'Batch',
        structural_width_mm: 90.0,
        structural_height_mm: 180.0,
      },
      search_hooks: {
        scholar_query: 'enthalpy of neutralization hydrochloric acid sodium hydroxide calorimeter',
        image_query: 'phenolphthalein equivalence point titration beaker pink color',
      },
    },
  },
  {
    id: 'academic-golden-rain',
    name: 'Golden Rain (Lead Iodide Precipitation)',
    industry: 'Academic',
    description: 'Double replacement reaction producing shimmering golden crystalline lead(II) iodide crystals.',
    reactants: [
      { name: 'Lead(II) Nitrate [Pb(NO3)2]', concentration: '0.1M', amount_ml: 125 },
      { name: 'Potassium Iodide [KI]', concentration: '0.2M', amount_ml: 125 },
    ],
    modifiers: { temperature_c: 65, pressure_atm: 1.0 },
    expectedOutput: {
      balanced_equation: 'Pb(NO3)2(aq) + 2KI(aq) -> PbI2(s) + 2KNO3(aq)',
      thermo_output: 'Exothermic (-61.4 kJ/mol)',
      safety_warnings: [
        'Toxic heavy metal: Lead compounds are neurotoxic and bioaccumulative',
        'Handle in designated fume hood with double nitrile gloves',
        'Collect all effluent into dedicated heavy metal hazardous waste drums',
      ],
      visuals: {
        hex_color: '#ffd700', // Shimmering gold
        bubbling_speed: 0,
        precipitation_layer: 'bottom',
      },
      cad_parameters: {
        reactor_vessel_type: 'Batch',
        structural_width_mm: 85.0,
        structural_height_mm: 170.0,
      },
      search_hooks: {
        scholar_query: 'lead iodide crystal growth kinetics precipitation golden rain',
        image_query: 'lead iodide golden rain crystal precipitate laboratory beaker',
      },
    },
  },
  {
    id: 'academic-copper-complex',
    name: 'Copper Hydroxide Complex Precipitation',
    industry: 'Academic',
    description: 'Rapid precipitation of intense royal blue copper(II) hydroxide gel precipitate.',
    reactants: [
      { name: 'Copper(II) Sulfate [CuSO4]', concentration: '0.5M', amount_ml: 100 },
      { name: 'Sodium Hydroxide [NaOH]', concentration: '2.0M', amount_ml: 50 },
    ],
    modifiers: { temperature_c: 22, pressure_atm: 1.0 },
    expectedOutput: {
      balanced_equation: 'CuSO4(aq) + 2NaOH(aq) -> Cu(OH)2(s) + Na2SO4(aq)',
      thermo_output: 'Exothermic (-48.2 kJ/mol)',
      safety_warnings: [
        'Corrosive caustic alkali: Severe eye damage risk, wear face shield',
        'Prevent inhalation of aerosolized hydroxide mists',
        'Neutralize excess base before waste container isolation',
      ],
      visuals: {
        hex_color: '#1e40af', // Intense cobalt royal blue
        bubbling_speed: 5,
        precipitation_layer: 'suspended',
      },
      cad_parameters: {
        reactor_vessel_type: 'CSTR',
        structural_width_mm: 100.0,
        structural_height_mm: 200.0,
      },
      search_hooks: {
        scholar_query: 'copper hydroxide gelatinous precipitation thermodynamic solubility product',
        image_query: 'copper hydroxide blue precipitate test tube beaker',
      },
    },
  },
  {
    id: 'academic-zinc-effervescence',
    name: 'Zinc Metal Acid Displacement (H2 Evolution)',
    industry: 'Academic',
    description: 'Rapid single replacement reaction releasing highly flammable hydrogen gas microbubbles.',
    reactants: [
      { name: 'Zinc Granules [Zn]', concentration: 'Pure Granular', amount_ml: 30 },
      { name: 'Hydrochloric Acid [HCl]', concentration: '3.0M', amount_ml: 180 },
    ],
    modifiers: { temperature_c: 28, pressure_atm: 1.0 },
    expectedOutput: {
      balanced_equation: 'Zn(s) + 2HCl(aq) -> ZnCl2(aq) + H2(g)',
      thermo_output: 'Exothermic (-153.9 kJ/mol)',
      safety_warnings: [
        'Flammable gas evolution: Hydrogen gas forms explosive atmospheric mixtures (LEL 4%)',
        'Strict ignition source elimination: No open flames or sparking electronic apparatus',
        'Operate inside spark-proof certified fume evacuation hood',
      ],
      visuals: {
        hex_color: '#93c5fd', // Translucent light bubbly blue/gray
        bubbling_speed: 85,
        precipitation_layer: 'bottom',
      },
      cad_parameters: {
        reactor_vessel_type: 'Tube',
        structural_width_mm: 80.0,
        structural_height_mm: 260.0,
      },
      search_hooks: {
        scholar_query: 'zinc acid hydrogen gas evolution kinetics mass transfer',
        image_query: 'zinc hydrochloric acid hydrogen bubbles effervescence flask',
      },
    },
  },

  // --- PHARMA ---
  {
    id: 'pharma-aspirin',
    name: 'Aspirin (Acetylsalicylic Acid) Synthesis',
    industry: 'Pharma',
    description: 'Esterification of salicylic acid with acetic anhydride using sulfuric acid acid catalyst.',
    reactants: [
      { name: 'Salicylic Acid [C7H6O3]', concentration: 'USP Grade Powder', amount_ml: 65 },
      { name: 'Acetic Anhydride [C4H6O3]', concentration: '99%', amount_ml: 120 },
      { name: 'Sulfuric Acid [H2SO4]', concentration: '18M Cat.', amount_ml: 10 },
    ],
    modifiers: { temperature_c: 85, pressure_atm: 1.0, catalyst: 'H2SO4' },
    expectedOutput: {
      balanced_equation: 'C7H6O3(s) + C4H6O3(l) --(H2SO4)--> C9H8O4(s) + C2H4O2(l)',
      thermo_output: 'Exothermic (-28.5 kJ/mol)',
      safety_warnings: [
        'Lachrymator warning: Acetic anhydride vapors severely irritate respiratory tract and eyes',
        'Corrosive concentrated sulfuric acid catalyst requires butyl rubber gloves',
        'Thermal runaway hazard during water quenching step: cool in ice bath',
      ],
      visuals: {
        hex_color: '#f8fafc', // Pearlescent white slurry
        bubbling_speed: 18,
        precipitation_layer: 'suspended',
      },
      cad_parameters: {
        reactor_vessel_type: 'Batch',
        structural_width_mm: 130.0,
        structural_height_mm: 220.0,
      },
      search_hooks: {
        scholar_query: 'acetylsalicylic acid crystallization kinetics batch reactor salicylic acid',
        image_query: 'aspirin crystallization synthesis laboratory round bottom flask white crystals',
      },
    },
  },
  {
    id: 'pharma-paracetamol',
    name: 'Paracetamol (Acetaminophen) Synthesis',
    industry: 'Pharma',
    description: 'Nucleophilic acyl substitution of p-aminophenol with acetic anhydride in aqueous suspension.',
    reactants: [
      { name: '4-Aminophenol [C6H7NO]', concentration: 'Reagent Grade', amount_ml: 80 },
      { name: 'Acetic Anhydride [C4H6O3]', concentration: '98%', amount_ml: 110 },
    ],
    modifiers: { temperature_c: 75, pressure_atm: 1.0 },
    expectedOutput: {
      balanced_equation: 'C6H7NO + C4H6O3 -> C8H9NO2 + CH3COOH',
      thermo_output: 'Exothermic (-35.1 kJ/mol)',
      safety_warnings: [
        'Toxic if swallowed or absorbed through skin; mutagenic precursor handling',
        'Vapor respirator recommended when charging dry 4-aminophenol',
        'Maintain vessel nitrogen inerting blanket to avoid oxidative discoloration',
      ],
      visuals: {
        hex_color: '#e2e8f0', // Translucent amber changing to crystalline white
        bubbling_speed: 14,
        precipitation_layer: 'suspended',
      },
      cad_parameters: {
        reactor_vessel_type: 'CSTR',
        structural_width_mm: 140.0,
        structural_height_mm: 260.0,
      },
      search_hooks: {
        scholar_query: 'paracetamol acetaminophen synthesis reaction engineering crystallization kinetics',
        image_query: 'paracetamol reaction crystallization batch reactor pharma',
      },
    },
  },
  {
    id: 'pharma-diclofenac',
    name: 'Diclofenac Sodium Salt Formulation',
    industry: 'Pharma',
    description: 'Salification of diclofenac free acid with caustic soda for enhanced aqueous bioavailability.',
    reactants: [
      { name: 'Diclofenac Free Acid [C14H11Cl2NO2]', concentration: 'Pharmaceutical Grade', amount_ml: 70 },
      { name: 'Sodium Hydroxide [NaOH]', concentration: '1.5M', amount_ml: 120 },
    ],
    modifiers: { temperature_c: 40, pressure_atm: 1.0 },
    expectedOutput: {
      balanced_equation: 'C14H11Cl2NO2 + NaOH -> C14H10Cl2NNaO2 + H2O',
      thermo_output: 'Exothermic (-42.0 kJ/mol)',
      safety_warnings: [
        'Potent API allergen: Avoid any skin contact or aerosolization',
        'Ensure continuous agitation to prevent localized precipitation encrustation',
        'Monitor pH strictly between 7.4 and 8.2 to ensure complete salification',
      ],
      visuals: {
        hex_color: '#fef08a', // Pale crystalline champagne/yellow
        bubbling_speed: 8,
        precipitation_layer: 'none',
      },
      cad_parameters: {
        reactor_vessel_type: 'Batch',
        structural_width_mm: 110.0,
        structural_height_mm: 210.0,
      },
      search_hooks: {
        scholar_query: 'diclofenac sodium salt crystallization solubility optimization formulation',
        image_query: 'pharmaceutical crystallization reactor vessel slurry',
      },
    },
  },

  // --- METALLURGY ---
  {
    id: 'metallurgy-thermite',
    name: 'Pyrometallurgical Thermite Reduction',
    industry: 'Metallurgy',
    description: 'Extreme pyrotechnic reduction of iron(III) oxide by aluminum powder creating molten elemental iron.',
    reactants: [
      { name: 'Iron(III) Oxide [Fe2O3]', concentration: 'Fine Anhydrous', amount_ml: 100 },
      { name: 'Aluminum Powder [Al]', concentration: '200 Mesh', amount_ml: 50 },
    ],
    modifiers: { temperature_c: 980, pressure_atm: 1.0 },
    expectedOutput: {
      balanced_equation: 'Fe2O3(s) + 2Al(s) -> 2Fe(l) + Al2O3(s)',
      thermo_output: 'Exothermic (-851.5 kJ/mol)',
      safety_warnings: [
        'EXTREME THERMAL HAZARD: Reaction temperature exceeds 2500°C; produces liquid molten iron',
        'Intense UV/Infrared radiation: Full aluminized proximity suit with shade 10 welders visor mandatory',
        'NEVER introduce water: Molten iron contact causes catastrophic explosive steam detonations',
      ],
      visuals: {
        hex_color: '#ea580c', // Blinding incandescent orange-red lava
        bubbling_speed: 98,
        precipitation_layer: 'bottom',
      },
      cad_parameters: {
        reactor_vessel_type: 'Batch',
        structural_width_mm: 150.0,
        structural_height_mm: 320.0,
      },
      search_hooks: {
        scholar_query: 'thermite reaction kinetics high temperature molten iron aluminum oxide phase',
        image_query: 'thermite molten iron crucible glow pyrometallurgy sparks',
      },
    },
  },
  {
    id: 'metallurgy-copper-cementation',
    name: 'Hydrometallurgical Copper Cementation',
    industry: 'Metallurgy',
    description: 'Electrochemical displacement of cupric ions from pregnant leach solution using scrap iron metal.',
    reactants: [
      { name: 'Copper Sulfate Leach Soln [CuSO4]', concentration: '1.2M Cu2+', amount_ml: 220 },
      { name: 'Metallic Iron Scrap [Fe]', concentration: 'Granulated Scrap', amount_ml: 50 },
    ],
    modifiers: { temperature_c: 45, pressure_atm: 1.0 },
    expectedOutput: {
      balanced_equation: 'CuSO4(aq) + Fe(s) -> Cu(s) + FeSO4(aq)',
      thermo_output: 'Exothermic (-152.0 kJ/mol)',
      safety_warnings: [
        'Acidic pregnant leach solution contains residual free H2SO4; corrosive to dermal tissue',
        'Copper sponge precipitate can self-heat upon ambient drying; maintain submerged slurry',
        'Continuous mechanical stirring required to dislodge passivating copper dendrites from iron substrate',
      ],
      visuals: {
        hex_color: '#b45309', // Deep reddish-brown copper precipitate sludge
        bubbling_speed: 24,
        precipitation_layer: 'bottom',
      },
      cad_parameters: {
        reactor_vessel_type: 'CSTR',
        structural_width_mm: 160.0,
        structural_height_mm: 280.0,
      },
      search_hooks: {
        scholar_query: 'copper cementation kinetics scrap iron pregnant leach solution hydrometallurgy',
        image_query: 'copper cementation precipitate sponge iron reaction beaker',
      },
    },
  },
  {
    id: 'metallurgy-gold-cyanidation',
    name: 'Gold Ore Hydrometallurgical Cyanidation',
    industry: 'Metallurgy',
    description: 'Elsner equation dissolution of elemental gold in alkaline cyanide solution with oxygen aeration.',
    reactants: [
      { name: 'Gold Slurry [Au]', concentration: 'Refractory Flotation', amount_ml: 90 },
      { name: 'Sodium Cyanide [NaCN]', concentration: '0.05M (pH 10.5)', amount_ml: 180 },
    ],
    modifiers: { temperature_c: 30, pressure_atm: 1.2 },
    expectedOutput: {
      balanced_equation: '4Au + 8NaCN + O2 + 2H2O -> 4Na[Au(CN)2] + 4NaOH',
      thermo_output: 'Exothermic (-435.0 kJ/mol)',
      safety_warnings: [
        'LETHAL POISON HAZARD: Sodium cyanide solutions release deadly HCN gas if pH drops below 9.5',
        'Continuous lime dosing to strictly enforce alkaline buffer (pH > 10.5)',
        'Wear positive-pressure SCBA respirator and carry cyanide antidote kit (Amyl nitrite / Hydroxocobalamin)',
      ],
      visuals: {
        hex_color: '#ca8a04', // Ochre golden-tan clarified liquor
        bubbling_speed: 35,
        precipitation_layer: 'suspended',
      },
      cad_parameters: {
        reactor_vessel_type: 'CSTR',
        structural_width_mm: 180.0,
        structural_height_mm: 360.0,
      },
      search_hooks: {
        scholar_query: 'gold cyanidation elsner equation leaching kinetics carbon in pulp',
        image_query: 'gold cyanidation leaching agitator tank industrial hydrometallurgy',
      },
    },
  },

  // --- PETROCHEMICAL ---
  {
    id: 'petro-cracking',
    name: 'Catalytic Hydrocarbon Cracking',
    industry: 'Petrochemical',
    description: 'Zeolite-catalyzed scission of heavy aliphatic decane into high-octane gasoline fractions and alkenes.',
    reactants: [
      { name: 'Heavy Gas Oil / Decane [C10H22]', concentration: 'Pure Hydrocarbon', amount_ml: 200 },
      { name: 'Zeolite Catalyst [ZSM-5]', concentration: 'Silica-Alumina Bed', amount_ml: 40 },
    ],
    modifiers: { temperature_c: 520, pressure_atm: 2.5, catalyst: 'ZSM-5' },
    expectedOutput: {
      balanced_equation: 'C10H22(g) --(ZSM-5, 520C)--> C5H12(g) + C5H10(g)',
      thermo_output: 'Endothermic (+42.5 kJ/mol)',
      safety_warnings: [
        'High temperature hydrocarbon vapor explosion hazard: LEL 1.1%',
        'Maintain complete nitrogen inert purge before introducing hydrocarbon feed',
        'Catalyst coking deactivation: Provide steam decoking regeneration cycle lines',
      ],
      visuals: {
        hex_color: '#d97706', // Warm amber hydrocarbon vapor shimmer
        bubbling_speed: 92,
        precipitation_layer: 'none',
      },
      cad_parameters: {
        reactor_vessel_type: 'Tube',
        structural_width_mm: 100.0,
        structural_height_mm: 380.0,
      },
      search_hooks: {
        scholar_query: 'fluid catalytic cracking decane zeolite zsm 5 kinetics product distribution',
        image_query: 'catalytic cracking tubular reactor pilot plant petrochemical',
      },
    },
  },
  {
    id: 'petro-haber-bosch',
    name: 'Haber-Bosch Ammonia Synthesis',
    industry: 'Petrochemical',
    description: 'High-pressure catalytic fixation of atmospheric nitrogen and hydrogen gas into anhydrous ammonia.',
    reactants: [
      { name: 'Nitrogen Gas [N2]', concentration: 'Syngas Feed (99.9%)', amount_ml: 100 },
      { name: 'Hydrogen Gas [H2]', concentration: 'Syngas Feed (99.9%)', amount_ml: 300 },
    ],
    modifiers: { temperature_c: 450, pressure_atm: 200.0, catalyst: 'Promoted Magnetite Fe' },
    expectedOutput: {
      balanced_equation: 'N2(g) + 3H2(g) --(Fe-cat, 200atm)--> 2NH3(g)',
      thermo_output: 'Exothermic (-92.4 kJ/mol)',
      safety_warnings: [
        'EXTREME PRESSURE RISK: 200 atm vessel requires certified ASME Boiler and Pressure Vessel Code rating',
        'High temperature hydrogen attack (methane embrittlement): Use Cr-Mo stabilized alloy steel',
        'Toxic anhydrous ammonia vapor leak: Respiratory failure hazard above 300 ppm',
      ],
      visuals: {
        hex_color: '#38bdf8', // Superheated plasma-like blue vapor glow
        bubbling_speed: 70,
        precipitation_layer: 'none',
      },
      cad_parameters: {
        reactor_vessel_type: 'Tube',
        structural_width_mm: 140.0,
        structural_height_mm: 420.0,
      },
      search_hooks: {
        scholar_query: 'haber bosch ammonia synthesis high pressure reactor kinetics iron catalyst',
        image_query: 'ammonia converter high pressure reactor industrial plant blueprint',
      },
    },
  },
  {
    id: 'petro-alkylation',
    name: 'Sulfuric Acid Isobutane Alkylation',
    industry: 'Petrochemical',
    description: 'Liquid acid-catalyzed emulsion coupling of isobutane with butenes to generate 100-octane isooctane.',
    reactants: [
      { name: 'Isobutane [C4H10]', concentration: 'Liquid Fraction', amount_ml: 150 },
      { name: '1-Butene [C4H8]', concentration: 'Olefin Feed', amount_ml: 50 },
      { name: 'Sulfuric Acid [H2SO4]', concentration: '98% Spent Acid', amount_ml: 100 },
    ],
    modifiers: { temperature_c: 8, pressure_atm: 4.5, catalyst: 'H2SO4' },
    expectedOutput: {
      balanced_equation: 'C4H10(l) + C4H8(l) --(H2SO4, 8C)--> C8H18(l)',
      thermo_output: 'Exothermic (-79.0 kJ/mol)',
      safety_warnings: [
        'Vessel must be refrigerated below 10°C to inhibit acid polymerization runaway (red oil formation)',
        'Extreme acid corrosion: High-nickel Hastelloy C-276 or Monel 400 wet parts required',
        'Hydrocarbon-acid emulsion presents rapid phase separation pressure spikes if refrigeration fails',
      ],
      visuals: {
        hex_color: '#a3e635', // Acidic emulsion chartreuse-lime green
        bubbling_speed: 48,
        precipitation_layer: 'suspended',
      },
      cad_parameters: {
        reactor_vessel_type: 'CSTR',
        structural_width_mm: 150.0,
        structural_height_mm: 270.0,
      },
      search_hooks: {
        scholar_query: 'sulfuric acid alkylation isobutane butene emulsion reaction kinetics CSTR',
        image_query: 'stratco contactor alkylation reactor petrochemical',
      },
    },
  },
];
