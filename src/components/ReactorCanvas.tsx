import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Gauge, Thermometer, Wind, Zap } from 'lucide-react';
import { SimulationResponsePayload, ReactionModifiers } from '../types/chemlab';
import { labAudio } from '../utils/audioSynth';

interface ReactorCanvasProps {
  simulationData: SimulationResponsePayload;
  modifiers: ReactionModifiers;
  totalVolumeMl: number;
}

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  drift: number;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  opacity: number;
}

export const ReactorCanvas: React.FC<ReactorCanvasProps> = ({
  simulationData,
  modifiers,
  totalVolumeMl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [stirrerActive, setStirrerActive] = useState<boolean>(true);
  const [stirrerRpm, setStirrerRpm] = useState<number>(320);

  const { visuals, cad_parameters, thermo_output } = simulationData;
  const isExothermic = thermo_output.toLowerCase().includes('exothermic');

  // Maintain particles in refs for 60fps canvas loop
  const bubblesRef = useRef<Bubble[]>([]);
  const sedimentRef = useRef<Particle[]>([]);
  const vaporRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const impellerAngleRef = useRef<number>(0);

  // Sync Web Audio bubbling sound
  useEffect(() => {
    if (isPlaying) {
      labAudio.updateBubblingLoop(visuals.bubbling_speed);
    } else {
      labAudio.stopAll();
    }
    return () => {
      labAudio.stopAll();
    };
  }, [visuals.bubbling_speed, isPlaying]);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = 420);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = 420;
      }
    };
    window.addEventListener('resize', handleResize);

    // Initialize particles
    const bubbleCount = Math.round((visuals.bubbling_speed / 100) * 45);
    bubblesRef.current = Array.from({ length: bubbleCount }, () => ({
      x: 0,
      y: 0,
      radius: 1.5 + Math.random() * 3.5,
      speed: 1 + Math.random() * 2.5 + (visuals.bubbling_speed / 100) * 3,
      opacity: 0.3 + Math.random() * 0.6,
      drift: (Math.random() - 0.5) * 0.8,
    }));

    // Sediment particles for precipitation
    const sedimentCount = visuals.precipitation_layer === 'none' ? 0 : 70;
    sedimentRef.current = Array.from({ length: sedimentCount }, () => ({
      x: 0,
      y: 0,
      radius: 1.2 + Math.random() * 2.2,
      speedY: 0.2 + Math.random() * 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: 0.5 + Math.random() * 0.4,
    }));

    // Vapor particles
    const vaporCount = visuals.bubbling_speed > 25 ? 25 : 0;
    vaporRef.current = Array.from({ length: vaporCount }, () => ({
      x: 0,
      y: 0,
      radius: 3 + Math.random() * 6,
      speedY: 0.8 + Math.random() * 1.5,
      speedX: (Math.random() - 0.5) * 0.6,
      opacity: 0.2 + Math.random() * 0.3,
    }));

    let startTime = performance.now();

    const render = (time: number) => {
      const dt = (time - startTime) / 1000;
      startTime = time;

      ctx.clearRect(0, 0, width, height);

      // 1. Vessel coordinates & layout
      const vesselW = Math.min(width * 0.55, Math.max(160, cad_parameters.structural_width_mm * 1.3));
      const vesselH = Math.min(height * 0.72, Math.max(220, cad_parameters.structural_height_mm * 0.8));
      const vesselX = width / 2 - vesselW / 2;
      const vesselY = height / 2 - vesselH / 2 + 15;

      // Dynamic vessel capacity scale
      const vesselCapacityMl =
        totalVolumeMl <= 200
          ? 250
          : totalVolumeMl <= 450
          ? 500
          : totalVolumeMl <= 900
          ? 1000
          : Math.ceil(totalVolumeMl / 500) * 500;

      const fillRatio = Math.max(0.12, Math.min(0.92, totalVolumeMl / vesselCapacityMl));
      const fillPercent = fillRatio * 0.84; // Leave 16% safety headspace
      const liquidH = vesselH * fillPercent;
      const liquidY = vesselY + vesselH - liquidH;

      // 2. Thermodynamic aura (heat glow or cryo frost)
      if (isExothermic) {
        const glowPulse = 0.5 + 0.2 * Math.sin(time * 0.004);
        const gradGlow = ctx.createRadialGradient(
          width / 2,
          vesselY + vesselH / 2,
          vesselW * 0.3,
          width / 2,
          vesselY + vesselH / 2,
          vesselW * 0.95
        );
        gradGlow.addColorStop(0, `rgba(239, 68, 68, ${0.12 * glowPulse})`);
        gradGlow.addColorStop(0.6, `rgba(249, 115, 22, ${0.06 * glowPulse})`);
        gradGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradGlow;
        ctx.fillRect(vesselX - 50, vesselY - 40, vesselW + 100, vesselH + 80);
      } else {
        const cryoPulse = 0.5 + 0.15 * Math.sin(time * 0.003);
        const gradCryo = ctx.createRadialGradient(
          width / 2,
          vesselY + vesselH / 2,
          vesselW * 0.3,
          width / 2,
          vesselY + vesselH / 2,
          vesselW * 0.95
        );
        gradCryo.addColorStop(0, `rgba(56, 189, 248, ${0.12 * cryoPulse})`);
        gradCryo.addColorStop(0.7, `rgba(14, 165, 233, ${0.05 * cryoPulse})`);
        gradCryo.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradCryo;
        ctx.fillRect(vesselX - 50, vesselY - 40, vesselW + 100, vesselH + 80);
      }

      // 3. Draw Reactor External Shell / Vessel Outer Body
      ctx.save();

      // Outer jacket wall (for Batch & CSTR)
      if (cad_parameters.reactor_vessel_type !== 'Tube') {
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.45)';
        ctx.lineWidth = 8;
        ctx.lineJoin = 'round';
        ctx.strokeRect(vesselX - 6, vesselY + 20, vesselW + 12, vesselH - 22);

        // Jacketed fluid indicator
        ctx.fillStyle = isExothermic ? 'rgba(239, 68, 68, 0.08)' : 'rgba(56, 189, 248, 0.08)';
        ctx.fillRect(vesselX - 8, vesselY + 20, 6, vesselH - 25);
        ctx.fillRect(vesselX + vesselW + 2, vesselY + 20, 6, vesselH - 25);
      }

      // Main Glass/Alloy Vessel Shape
      ctx.beginPath();
      ctx.roundRect(vesselX, vesselY, vesselW, vesselH, [6, 6, 24, 24]);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Top Flange / Vessel Mouth
      ctx.fillStyle = 'rgba(51, 65, 85, 0.9)';
      ctx.fillRect(vesselX - 10, vesselY - 6, vesselW + 20, 10);
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(vesselX - 10, vesselY - 6, vesselW + 20, 10);

      // Clip inside the vessel for the liquid contents
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(vesselX + 3, vesselY + 3, vesselW - 6, vesselH - 6, [4, 4, 20, 20]);
      ctx.clip();

      // 4. Liquid Body
      const liquidColor = visuals.hex_color || '#06b6d4';
      const liqGrad = ctx.createLinearGradient(0, liquidY, 0, vesselY + vesselH);
      liqGrad.addColorStop(0, `${liquidColor}cc`);
      liqGrad.addColorStop(0.7, `${liquidColor}ee`);
      liqGrad.addColorStop(1, `${liquidColor}ff`);

      ctx.fillStyle = liqGrad;
      ctx.beginPath();
      ctx.moveTo(vesselX, vesselY + vesselH);
      ctx.lineTo(vesselX, liquidY);

      // Meniscus / surface wave
      const waveFreq = 0.03;
      const waveAmp = isPlaying && stirrerActive ? 3.5 : 1.2;
      for (let x = vesselX; x <= vesselX + vesselW; x += 4) {
        const offset = x - vesselX;
        const wave = Math.sin(offset * waveFreq + time * 0.005) * waveAmp;
        ctx.lineTo(x, liquidY + wave);
      }
      ctx.lineTo(vesselX + vesselW, vesselY + vesselH);
      ctx.closePath();
      ctx.fill();

      // Surface highlight sheen
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 5. Precipitation Layer Rendering
      if (visuals.precipitation_layer === 'bottom') {
        // Bottom sediment bed
        const sedH = Math.min(30, liquidH * 0.22);
        const sedGrad = ctx.createLinearGradient(0, vesselY + vesselH - sedH, 0, vesselY + vesselH);
        sedGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        sedGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
        sedGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        ctx.fillStyle = sedGrad;
        ctx.fillRect(vesselX, vesselY + vesselH - sedH, vesselW, sedH);

        // Render settling crystals
        sedimentRef.current.forEach((p, idx) => {
          if (!p.x || p.x < vesselX + 10 || p.x > vesselX + vesselW - 10) {
            p.x = vesselX + 10 + Math.random() * (vesselW - 20);
            p.y = liquidY + Math.random() * (liquidH - 5);
          }
          if (isPlaying) {
            p.y += p.speedY;
            p.x += p.speedX;
            if (p.y > vesselY + vesselH - 4) {
              p.y = vesselY + vesselH - 4 - Math.random() * 8;
            }
          }
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (visuals.precipitation_layer === 'suspended') {
        // Suspended swirling flocculent
        sedimentRef.current.forEach((p) => {
          if (!p.x || p.x < vesselX + 10 || p.x > vesselX + vesselW - 10) {
            p.x = vesselX + 10 + Math.random() * (vesselW - 20);
            p.y = liquidY + 5 + Math.random() * (liquidH - 10);
          }
          if (isPlaying) {
            const angle = time * 0.002 + p.x * 0.05;
            p.x += Math.cos(angle) * 0.6;
            p.y += Math.sin(angle) * 0.4;
            if (p.x < vesselX + 10) p.x = vesselX + 15;
            if (p.x > vesselX + vesselW - 10) p.x = vesselX + vesselW - 15;
            if (p.y < liquidY + 4) p.y = liquidY + 8;
            if (p.y > vesselY + vesselH - 6) p.y = vesselY + vesselH - 12;
          }
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.7})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 1.3, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 6. Bubbles Simulation (Gas Evolution)
      bubblesRef.current.forEach((b) => {
        if (!b.x || b.x < vesselX + 8 || b.x > vesselX + vesselW - 8 || b.y < liquidY) {
          b.x = vesselX + 12 + Math.random() * (vesselW - 24);
          b.y = vesselY + vesselH - 8 - Math.random() * (liquidH * 0.7);
        }
        if (isPlaying) {
          b.y -= b.speed;
          b.x += b.drift;
          if (b.y <= liquidY) {
            b.y = vesselY + vesselH - 8;
            b.x = vesselX + 12 + Math.random() * (vesselW - 24);
          }
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Bubble highlight reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
      });

      // 7. Mechanical Stirrer / Impeller (For CSTR or active batch)
      if (cad_parameters.reactor_vessel_type === 'CSTR' || stirrerActive) {
        const shaftX = width / 2;
        const shaftTopY = vesselY - 20;
        const shaftBottomY = vesselY + vesselH - 24;

        if (isPlaying && stirrerActive) {
          impellerAngleRef.current += (stirrerRpm / 60) * dt * Math.PI * 2;
        }

        // Central steel shaft
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(shaftX, shaftTopY);
        ctx.lineTo(shaftX, shaftBottomY);
        ctx.stroke();

        // Rotating Rushton turbine blades
        const bladeSpan = (vesselW * 0.45) / 2;
        const bladeCos = Math.cos(impellerAngleRef.current);
        const bladeW = bladeSpan * bladeCos;

        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(shaftX - bladeW, shaftBottomY - 8, bladeW * 2, 12);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.strokeRect(shaftX - bladeW, shaftBottomY - 8, bladeW * 2, 12);

        // Upper tier blade if vessel is tall
        if (vesselH > 240) {
          const midY = vesselY + vesselH * 0.55;
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(shaftX - bladeW * 0.8, midY - 6, bladeW * 1.6, 10);
        }
      }

      ctx.restore(); // Restore vessel clip

      // 8. Rising Vapor / Mist above liquid surface
      if (vaporRef.current.length > 0) {
        vaporRef.current.forEach((v) => {
          if (!v.x || v.y < vesselY - 40) {
            v.x = vesselX + 15 + Math.random() * (vesselW - 30);
            v.y = liquidY - 2;
            v.opacity = 0.35;
          }
          if (isPlaying) {
            v.y -= v.speedY;
            v.x += v.speedX;
            v.opacity -= 0.006;
          }

          ctx.fillStyle = `rgba(241, 245, 249, ${Math.max(0, v.opacity)})`;
          ctx.beginPath();
          ctx.arc(v.x, v.y, v.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 9. Volumetric Graduation Marks on Vessel Wall
      const markSteps = 5;
      ctx.fillStyle = 'rgba(203, 213, 225, 0.7)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';

      for (let i = 1; i <= markSteps; i++) {
        const markY = vesselY + vesselH - (vesselH * 0.84 * (i / markSteps));
        const markVol = Math.round(vesselCapacityMl * (i / markSteps));

        // Tick mark
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(vesselX + 3, markY);
        ctx.lineTo(vesselX + 14, markY);
        ctx.stroke();

        ctx.fillText(`${markVol}ml`, vesselX - 6, markY + 3);
      }

      // 10. Vessel Spec Tag & Dynamic Readouts
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        `${cad_parameters.reactor_vessel_type} VESSEL (${vesselCapacityMl}mL Scale)`,
        vesselX + 12,
        vesselY + 22
      );

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [simulationData, modifiers, totalVolumeMl, isPlaying, stirrerActive, stirrerRpm]);

  return (
    <div className="relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl backdrop-blur-sm">
      {/* Reactor Header & Live Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Dynamic Live Reaction Vessel
            </h3>
            <p className="text-xs text-slate-400">
              {cad_parameters.reactor_vessel_type} Profile • {totalVolumeMl} mL Active Volume
            </p>
          </div>
        </div>

        {/* Real-time telemetry badges */}
        <div className="flex items-center gap-2">
          {/* Temperature Badge */}
          <div className="flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-xs">
            <Thermometer className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-mono font-medium text-slate-200">
              {modifiers.temperature_c}°C
            </span>
            <span className="text-[10px] text-slate-500">
              ({(modifiers.temperature_c + 273.15).toFixed(1)} K)
            </span>
          </div>

          {/* Pressure Badge */}
          <div className="flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-xs">
            <Gauge className="h-3.5 w-3.5 text-blue-400" />
            <span className="font-mono font-medium text-slate-200">
              {modifiers.pressure_atm} atm
            </span>
          </div>

          {/* Bubbling & Gas Badge */}
          <div className="flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-xs">
            <Wind className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-mono font-medium text-slate-200">
              {visuals.bubbling_speed}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Reactor Canvas */}
      <div className="relative my-2 flex h-[380px] w-full items-center justify-center overflow-hidden rounded-xl bg-slate-950/80 border border-slate-800/60">
        <canvas ref={canvasRef} className="h-full w-full" />

        {/* Chemical Equation & Thermo Overlay Bar */}
        <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800/90 bg-slate-900/85 px-3 py-2 text-xs backdrop-blur-md">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
              Reaction
            </span>
            <span className="truncate font-mono font-medium text-slate-200">
              {simulationData.balanced_equation}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                isExothermic
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              {simulationData.thermo_output}
            </span>
          </div>
        </div>

        {/* Precipitation Status Indicator */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md border border-slate-800/80 bg-slate-900/90 px-2.5 py-1 text-[11px] text-slate-300 backdrop-blur-md">
          <span className="text-slate-500">Precipitation:</span>
          <span
            className={`font-semibold capitalize ${
              visuals.precipitation_layer === 'none'
                ? 'text-emerald-400'
                : visuals.precipitation_layer === 'bottom'
                ? 'text-amber-400'
                : 'text-blue-400'
            }`}
          >
            {visuals.precipitation_layer}
          </span>
        </div>

        {/* Color Palette Chip */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-md border border-slate-800/80 bg-slate-900/90 px-2.5 py-1 text-[11px] text-slate-300 backdrop-blur-md">
          <span
            className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-sm"
            style={{ backgroundColor: visuals.hex_color }}
          />
          <span className="font-mono text-slate-400 uppercase">{visuals.hex_color}</span>
        </div>
      </div>

      {/* Playback & Hardware Agitation Controls */}
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
            }`}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isPlaying ? 'Pause Simulation' : 'Resume Simulation'}</span>
          </button>

          {/* Agitator / Stirrer Toggle */}
          <button
            onClick={() => setStirrerActive(!stirrerActive)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              stirrerActive
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCcw className={`h-3.5 w-3.5 ${stirrerActive ? 'animate-spin' : ''}`} />
            <span>Agitator {stirrerActive ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Agitator RPM Selector */}
        {stirrerActive && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>RPM:</span>
            {[180, 320, 550].map((rpm) => (
              <button
                key={rpm}
                onClick={() => setStirrerRpm(rpm)}
                className={`rounded px-2 py-0.5 font-mono text-[11px] transition-colors ${
                  stirrerRpm === rpm
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {rpm}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
