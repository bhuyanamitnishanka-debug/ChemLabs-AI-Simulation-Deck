import React, { useState } from 'react';
import { Search, ExternalLink, GraduationCap, Image, Database, Copy, CheckCircle } from 'lucide-react';
import { SearchHooksOutput } from '../types/chemlab';

interface SearchHooksPanelProps {
  searchHooks: SearchHooksOutput;
  primaryChemical: string;
}

export const SearchHooksPanel: React.FC<SearchHooksPanelProps> = ({
  searchHooks,
  primaryChemical,
}) => {
  const [copiedScholar, setCopiedScholar] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

  const scholarUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(
    searchHooks.scholar_query
  )}`;
  const imageUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
    searchHooks.image_query
  )}`;
  const pubchemUrl = `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(
    primaryChemical || searchHooks.image_query
  )}`;
  const nistUrl = `https://webbook.nist.gov/cgi/cbook.cgi?Name=${encodeURIComponent(
    primaryChemical || searchHooks.image_query
  )}&Units=SI`;

  const copyText = (text: string, isScholar: boolean) => {
    navigator.clipboard.writeText(text);
    if (isScholar) {
      setCopiedScholar(true);
      setTimeout(() => setCopiedScholar(false), 2000);
    } else {
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Academic & Visual Search Hooks</h3>
        </div>
        <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400">
          Synthesized Keywords
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Google Scholar Hook */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/80 p-4 transition-all hover:border-cyan-500/50">
          <div>
            <div className="flex items-center gap-2 text-cyan-400">
              <GraduationCap className="h-4 w-4" />
              <span className="text-xs font-semibold">Google Scholar</span>
            </div>
            <p className="mt-2 font-mono text-[11px] text-slate-300 leading-snug line-clamp-3">
              "{searchHooks.scholar_query}"
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-900">
            <a
              href={scholarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1 rounded bg-cyan-600/20 px-2 py-1 text-[11px] font-medium text-cyan-300 transition-colors hover:bg-cyan-600/30"
            >
              <span>Search Papers</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <button
              onClick={() => copyText(searchHooks.scholar_query, true)}
              title="Copy Query"
              className="rounded bg-slate-800 p-1 text-slate-400 hover:text-white"
            >
              {copiedScholar ? (
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Visual Reference / Image Hook */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/80 p-4 transition-all hover:border-cyan-500/50">
          <div>
            <div className="flex items-center gap-2 text-blue-400">
              <Image className="h-4 w-4" />
              <span className="text-xs font-semibold">Visual Image Index</span>
            </div>
            <p className="mt-2 font-mono text-[11px] text-slate-300 leading-snug line-clamp-3">
              "{searchHooks.image_query}"
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-900">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1 rounded bg-blue-600/20 px-2 py-1 text-[11px] font-medium text-blue-300 transition-colors hover:bg-blue-600/30"
            >
              <span>Find Visuals</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <button
              onClick={() => copyText(searchHooks.image_query, false)}
              title="Copy Query"
              className="rounded bg-slate-800 p-1 text-slate-400 hover:text-white"
            >
              {copiedImage ? (
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* PubChem Hook */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/80 p-4 transition-all hover:border-cyan-500/50">
          <div>
            <div className="flex items-center gap-2 text-emerald-400">
              <Database className="h-4 w-4" />
              <span className="text-xs font-semibold">NIH PubChem</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400 leading-snug">
              Access molecular structure, CID, CAS registry, and spectroscopy databases.
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-900">
            <a
              href={pubchemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-1 rounded bg-emerald-600/20 px-2 py-1 text-[11px] font-medium text-emerald-300 transition-colors hover:bg-emerald-600/30"
            >
              <span>Explore PubChem</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* NIST Chemistry WebBook */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/80 p-4 transition-all hover:border-cyan-500/50">
          <div>
            <div className="flex items-center gap-2 text-amber-400">
              <Database className="h-4 w-4" />
              <span className="text-xs font-semibold">NIST Chemistry WebBook</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400 leading-snug">
              Standard thermodynamic properties, enthalpy of formation, heat capacity data.
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-900">
            <a
              href={nistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-1 rounded bg-amber-600/20 px-2 py-1 text-[11px] font-medium text-amber-300 transition-colors hover:bg-amber-600/30"
            >
              <span>NIST WebBook</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
