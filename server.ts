import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { generateAutoCAD_DXF } from './src/utils/dxfGenerator';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback local chem-matrix calculator for robust continuous simulation
function calculateFallbackChemicalMatrix(
  industry: string,
  reactants: Array<{ name: string; concentration: string; amount_ml: number }>,
  modifiers: { temperature_c: number; pressure_atm: number; catalyst?: string }
) {
  const reactantNames = reactants.map((r) => r.name.toLowerCase()).join(' ');
  const totalVolume = reactants.reduce((sum, r) => sum + (Number(r.amount_ml) || 100), 0);
  const temp = modifiers?.temperature_c ?? 25;
  const press = modifiers?.pressure_atm ?? 1.0;

  // 1. Acid-Base Neutralization
  if (
    (reactantNames.includes('hcl') || reactantNames.includes('hydrochloric') || reactantNames.includes('acid')) &&
    (reactantNames.includes('naoh') || reactantNames.includes('sodium hydroxide') || reactantNames.includes('base'))
  ) {
    return {
      balanced_equation: 'HCl(aq) + NaOH(aq) -> NaCl(aq) + H2O(l)',
      thermo_output: 'Exothermic (-57.3 kJ/mol)',
      safety_warnings: [
        'Corrosive reagents: Wear chemical splash goggles and neoprene gloves',
        'Exothermic heat rise: Add titrant slowly to prevent thermal splashing',
        'Maintain eye-wash station availability and acid/base neutralizer spill kits',
      ],
      visuals: {
        hex_color: '#ff66b2',
        bubbling_speed: 12,
        precipitation_layer: 'none',
      },
      cad_parameters: {
        reactor_vessel_type: 'Batch',
        structural_width_mm: Math.min(180, Math.max(60, Math.round(Math.sqrt(totalVolume) * 5))),
        structural_height_mm: Math.min(350, Math.max(120, Math.round(totalVolume * 0.75))),
      },
      search_hooks: {
        scholar_query: 'enthalpy of neutralization hydrochloric acid sodium hydroxide calorimeter',
        image_query: 'phenolphthalein equivalence point titration beaker pink color',
      },
    };
  }

  // 2. Copper Sulfate + Base (Precipitation)
  if (
    (reactantNames.includes('copper') || reactantNames.includes('cuso4')) &&
    (reactantNames.includes('naoh') || reactantNames.includes('hydroxide'))
  ) {
    return {
      balanced_equation: 'CuSO4(aq) + 2NaOH(aq) -> Cu(OH)2(s) + Na2SO4(aq)',
      thermo_output: 'Exothermic (-48.2 kJ/mol)',
      safety_warnings: [
        'Corrosive caustic alkali: Severe eye damage risk, wear face shield',
        'Prevent inhalation of aerosolized hydroxide mists',
        'Neutralize excess base before waste container isolation',
      ],
      visuals: {
        hex_color: '#1e40af',
        bubbling_speed: 6,
        precipitation_layer: 'suspended',
      },
      cad_parameters: {
        reactor_vessel_type: 'CSTR',
        structural_width_mm: 110.0,
        structural_height_mm: 220.0,
      },
      search_hooks: {
        scholar_query: 'copper hydroxide gelatinous precipitation thermodynamic solubility product',
        image_query: 'copper hydroxide blue precipitate test tube beaker',
      },
    };
  }

  // 3. Lead Iodide / Precipitation
  if (reactantNames.includes('lead') || reactantNames.includes('iodide') || reactantNames.includes('rain')) {
    return {
      balanced_equation: 'Pb(NO3)2(aq) + 2KI(aq) -> PbI2(s) + 2KNO3(aq)',
      thermo_output: 'Exothermic (-61.4 kJ/mol)',
      safety_warnings: [
        'Toxic heavy metal: Lead compounds are neurotoxic and bioaccumulative',
        'Handle in designated fume hood with double nitrile gloves',
        'Collect all effluent into dedicated heavy metal hazardous waste drums',
      ],
      visuals: {
        hex_color: '#ffd700',
        bubbling_speed: 0,
        precipitation_layer: 'bottom',
      },
      cad_parameters: {
        reactor_vessel_type: 'Batch',
        structural_width_mm: 90.0,
        structural_height_mm: 190.0,
      },
      search_hooks: {
        scholar_query: 'lead iodide crystal growth kinetics precipitation golden rain',
        image_query: 'lead iodide golden rain crystal precipitate laboratory beaker',
      },
    };
  }

  // 4. Thermite / Molten Metallurgy
  if (
    reactantNames.includes('thermite') ||
    (reactantNames.includes('iron') && reactantNames.includes('aluminum')) ||
    (reactantNames.includes('fe2o3') && reactantNames.includes('al'))
  ) {
    return {
      balanced_equation: 'Fe2O3(s) + 2Al(s) -> 2Fe(l) + Al2O3(s)',
      thermo_output: 'Exothermic (-851.5 kJ/mol)',
      safety_warnings: [
        'EXTREME THERMAL HAZARD: Reaction temperature exceeds 2500°C; produces liquid molten iron',
        'Intense UV/Infrared radiation: Full aluminized proximity suit with shade 10 welders visor mandatory',
        'NEVER introduce water: Molten iron contact causes catastrophic explosive steam detonations',
      ],
      visuals: {
        hex_color: '#ea580c',
        bubbling_speed: 95,
        precipitation_layer: 'bottom',
      },
      cad_parameters: {
        reactor_vessel_type: 'Batch',
        structural_width_mm: 160.0,
        structural_height_mm: 320.0,
      },
      search_hooks: {
        scholar_query: 'thermite reaction kinetics high temperature molten iron aluminum oxide phase',
        image_query: 'thermite molten iron crucible glow pyrometallurgy sparks',
      },
    };
  }

  // 5. Haber-Bosch or Ammonia
  if (
    (reactantNames.includes('nitrogen') || reactantNames.includes('n2')) &&
    (reactantNames.includes('hydrogen') || reactantNames.includes('h2'))
  ) {
    return {
      balanced_equation: 'N2(g) + 3H2(g) --(Fe-cat, 200atm)--> 2NH3(g)',
      thermo_output: 'Exothermic (-92.4 kJ/mol)',
      safety_warnings: [
        'EXTREME PRESSURE RISK: Vessel requires certified ASME Boiler and Pressure Vessel Code rating',
        'High temperature hydrogen attack (methane embrittlement): Use Cr-Mo stabilized alloy steel',
        'Toxic anhydrous ammonia vapor leak: Respiratory failure hazard above 300 ppm',
      ],
      visuals: {
        hex_color: '#38bdf8',
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
    };
  }

  // 6. Hydrocarbon Cracking / Petrochemical
  if (
    industry === 'Petrochemical' ||
    reactantNames.includes('decane') ||
    reactantNames.includes('cracking') ||
    reactantNames.includes('oil')
  ) {
    return {
      balanced_equation: 'C10H22(g) --(ZSM-5, 520C)--> C5H12(g) + C5H10(g)',
      thermo_output: 'Endothermic (+42.5 kJ/mol)',
      safety_warnings: [
        'High temperature hydrocarbon vapor explosion hazard: LEL 1.1%',
        'Maintain complete nitrogen inert purge before introducing hydrocarbon feed',
        'Catalyst coking deactivation: Provide steam decoking regeneration cycle lines',
      ],
      visuals: {
        hex_color: '#d97706',
        bubbling_speed: 88,
        precipitation_layer: 'none',
      },
      cad_parameters: {
        reactor_vessel_type: 'Tube',
        structural_width_mm: 100.0,
        structural_height_mm: 360.0,
      },
      search_hooks: {
        scholar_query: 'fluid catalytic cracking decane zeolite zsm 5 kinetics product distribution',
        image_query: 'catalytic cracking tubular reactor pilot plant petrochemical',
      },
    };
  }

  // 7. Pharma / Synthesis
  if (industry === 'Pharma' || reactantNames.includes('salicylic') || reactantNames.includes('aspirin')) {
    return {
      balanced_equation: 'C7H6O3(s) + C4H6O3(l) --(H2SO4)--> C9H8O4(s) + C2H4O2(l)',
      thermo_output: 'Exothermic (-28.5 kJ/mol)',
      safety_warnings: [
        'Lachrymator warning: Acetic anhydride vapors severely irritate respiratory tract and eyes',
        'Corrosive concentrated sulfuric acid catalyst requires butyl rubber gloves',
        'Thermal runaway hazard during water quenching step: cool in ice bath',
      ],
      visuals: {
        hex_color: '#f1f5f9',
        bubbling_speed: 15,
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
    };
  }

  // 8. General Dynamic Chemical System
  const isHighTemp = temp > 150;
  const isHighPress = press > 10;
  const rType: 'CSTR' | 'Batch' | 'Tube' = isHighPress || isHighTemp ? 'Tube' : industry === 'Pharma' ? 'Batch' : 'CSTR';
  const widthMm = Math.min(220, Math.max(70, Math.round(50 + Math.sqrt(totalVolume) * 4)));
  const heightMm = Math.min(450, Math.max(140, Math.round(widthMm * 1.8)));

  const firstReactant = reactants[0]?.name || 'Reagent A';
  const secondReactant = reactants[1]?.name || 'Reagent B';

  return {
    balanced_equation: `${firstReactant} + ${secondReactant} -> Complex Product Mixture`,
    thermo_output: temp > 60 ? `Exothermic (-${(30 + Math.round(temp * 0.4)).toFixed(1)} kJ/mol)` : `Endothermic (+${(15 + Math.round(temp * 0.2)).toFixed(1)} kJ/mol)`,
    safety_warnings: [
      `Maintain temperature regulation at ${temp}°C and system pressure at ${press} atm`,
      'Mandatory chemical resistant PPE: Type 4 splash suit, nitrile/viton gloves, face shield',
      'Ensure secondary containment tray under reactor vessel and verified vent scrubbing line',
    ],
    visuals: {
      hex_color: industry === 'Metallurgy' ? '#ea580c' : industry === 'Pharma' ? '#a5b4fc' : industry === 'Petrochemical' ? '#f59e0b' : '#06b6d4',
      bubbling_speed: Math.min(95, Math.max(5, Math.round(temp * 0.3 + (isHighPress ? 20 : 0)))),
      precipitation_layer: industry === 'Metallurgy' ? 'bottom' : industry === 'Pharma' ? 'suspended' : 'none',
    },
    cad_parameters: {
      reactor_vessel_type: rType,
      structural_width_mm: widthMm,
      structural_height_mm: heightMm,
    },
    search_hooks: {
      scholar_query: `${firstReactant} ${secondReactant} ${industry.toLowerCase()} kinetics reaction mechanism`,
      image_query: `${firstReactant} ${industry.toLowerCase()} chemical reactor apparatus`,
    },
  };
}

// Master Orchestration API Route: /api/simulate
app.post('/api/simulate', async (req: Request, res: Response) => {
  try {
    const { industry, reactants, modifiers } = req.body;

    if (!industry || !Array.isArray(reactants)) {
      return res.status(400).json({ error: 'Missing required schema fields: industry, reactants' });
    }

    // If Gemini client is active, process with high-accuracy chemical intelligence
    if (ai) {
      try {
        const systemInstruction = `You are the master orchestration core for the ChemLabs-AI Cross-Industry Chemistry Simulation Deck.
Your objective is to evaluate incoming chemical interactions and output a perfectly formatted JSON payload.

### INPUT SCHEMA EXPECTED:
{
  "industry": "Pharma | Metallurgy | Academic | Petrochemical",
  "reactants": [{"name": "Chemical Name/Formula", "concentration": "e.g., 2M", "amount_ml": 250}],
  "modifiers": {"temperature_c": 25, "pressure_atm": 1.0}
}

### CRITICAL PROCESSING MATRIX:
1. CHEMMATRIX CALCULATIONS: Calculate chemical balancing equations, thermodynamic ΔH values (e.g. Exothermic (-57.3 kJ/mol) or Endothermic (+42.0 kJ/mol)), structural state evolutions, and molecular color changes.
2. ENGINEERING DESIGN MATRIX: Evaluate safety and volumetric profiles to command hardware components. Design architectural dimension scales for structural apparatus containers.
3. SEARCH QUERIES: Provide specific keywords to look up contextual references via academic indexes and image repositories.

### OUTPUT JSON REQUIREMENT:
Return ONLY raw structured JSON mapping this configuration layout precisely. No markdown formatting wrap blocks, no extra words outside the curly braces.

{
  "balanced_equation": "string representation",
  "thermo_output": "Exothermic | Endothermic (Value in kJ/mol)",
  "safety_warnings": ["List of precise protective protocols"],
  "visuals": {
    "hex_color": "#HexValue",
    "bubbling_speed": 0-100,
    "precipitation_layer": "none | bottom | suspended"
  },
  "cad_parameters": {
    "reactor_vessel_type": "CSTR | Batch | Tube",
    "structural_width_mm": 120.0,
    "structural_height_mm": 250.0
  },
  "search_hooks": {
    "scholar_query": "Exact academic syntax string",
    "image_query": "Visual reference string"
  }
}`;

        const prompt = JSON.stringify({ industry, reactants, modifiers });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        });

        let rawText = response.text || '';
        // Strip any markdown code fence if present
        rawText = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

        const parsedOutput = JSON.parse(rawText);

        // Sanity validation on parsed structure
        if (
          parsedOutput.balanced_equation &&
          parsedOutput.thermo_output &&
          Array.isArray(parsedOutput.safety_warnings) &&
          parsedOutput.visuals &&
          parsedOutput.cad_parameters &&
          parsedOutput.search_hooks
        ) {
          return res.json(parsedOutput);
        }
      } catch (geminiErr) {
        console.warn('Gemini API call or parse error, engaging local ChemMatrix calculation:', geminiErr);
      }
    }

    // Robust ChemMatrix calculation fallback
    const result = calculateFallbackChemicalMatrix(industry, reactants, modifiers || { temperature_c: 25, pressure_atm: 1.0 });
    return res.json(result);
  } catch (err: any) {
    console.error('Simulation server error:', err);
    return res.status(500).json({ error: err.message || 'Internal simulation error' });
  }
});

// AutoCAD Blueprint Generation & Download Endpoint
app.post('/api/cad/dxf', (req: Request, res: Response) => {
  try {
    const {
      chemicalName = 'Chemical Reaction Mixture',
      reactorType = 'CSTR',
      widthMm = 120,
      heightMm = 250,
      volumeMl = 500,
      industry = 'Chemical Engineering',
      balancedEquation = '',
      temperatureC = 25,
      pressureAtm = 1.0,
    } = req.body;

    const dxfString = generateAutoCAD_DXF({
      chemicalName,
      reactorType,
      widthMm: Number(widthMm) || 120,
      heightMm: Number(heightMm) || 250,
      volumeMl: Number(volumeMl) || 500,
      industry,
      balancedEquation,
      temperatureC: Number(temperatureC) || 25,
      pressureAtm: Number(pressureAtm) || 1.0,
    });

    const safeFilename = `reactor_${chemicalName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30)}.dxf`;

    res.setHeader('Content-Type', 'application/dxf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    return res.send(dxfString);
  } catch (err: any) {
    console.error('DXF generation error:', err);
    return res.status(500).json({ error: 'Failed to generate AutoCAD DXF file' });
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'operational',
    service: 'ChemLabs-AI Cross-Industry Chemistry Simulation Deck',
    engine: apiKey ? 'Gemini-3.8-Flash-Online' : 'ChemMatrix-Local-Engine',
    time: new Date().toISOString(),
  });
});

// Serve frontend with Vite middlewares in dev, or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`🚀 ChemLabs-AI Orchestration Core online at http://localhost:${PORT}`);
  });
}

startServer();
