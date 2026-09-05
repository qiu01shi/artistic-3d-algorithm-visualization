import { cn } from '../utils/cn';
import type { AlgorithmMeta } from '../lib/types';

/* -------------------------------- Sidebar ------------------------------- */
export function Sidebar({
  items,
  activeId,
  onSelect,
  onHome,
  open,
  onToggle,
}: {
  items: AlgorithmMeta[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onHome: () => void;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      className={cn(
        'pointer-events-auto absolute left-5 top-24 z-20 flex max-h-[calc(100vh-14rem)] w-72 flex-col rounded-2xl border border-white/10 bg-[#0d0c24]/70 shadow-2xl shadow-black/40 backdrop-blur-xl transition-all duration-500',
        !open && '-translate-x-[calc(100%+2rem)] opacity-0',
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <p className="font-serif text-[11px] uppercase tracking-[0.3em] text-indigo-300/70">Atlas</p>
          <h2 className="font-serif text-lg text-white">Chambers of thought</h2>
        </div>
        <button onClick={onToggle} className="rounded-full p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white" aria-label="Close list">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <button
          onClick={onHome}
          className={cn(
            'mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
            activeId === null ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white',
          )}
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-400 to-fuchsia-400 text-[#0d0c24]">✦</span>
          <span className="font-serif">The Overworld</span>
        </button>
        {items.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={cn(
              'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
              activeId === m.id ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white',
            )}
          >
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg font-mono text-[11px] font-bold text-[#0d0c24]"
              style={{ background: m.color, boxShadow: activeId === m.id ? `0 0 18px ${m.color}88` : undefined }}
            >
              {m.number}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-serif text-[15px]">{m.title}</span>
              <span className="block truncate text-[11px] text-white/40">{m.tags.join(' · ')}</span>
            </span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-medium',
                m.difficulty === 'Easy' && 'bg-emerald-400/15 text-emerald-300',
                m.difficulty === 'Medium' && 'bg-amber-400/15 text-amber-300',
                m.difficulty === 'Hard' && 'bg-rose-400/15 text-rose-300',
              )}
            >
              {m.difficulty}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

/* -------------------------------- Code panel ---------------------------- */
export function CodePanel({ code, line, accent }: { code: string[]; line: number; accent: string }) {
  return (
    <pre className="m-0 overflow-x-auto font-mono text-[12.5px] leading-6 text-white/55">
      {code.map((ln, k) => (
        <div
          key={k}
          className={cn('flex rounded-md px-2 transition-colors duration-300', k === line && 'text-white')}
          style={k === line ? { background: `${accent}22`, boxShadow: `inset 3px 0 0 ${accent}` } : undefined}
        >
          <span className="mr-4 w-5 select-none text-right text-white/25">{k + 1}</span>
          <span className="whitespace-pre">{ln}</span>
        </div>
      ))}
    </pre>
  );
}

/* -------------------------------- Transport ----------------------------- */
export function Transport({
  index,
  total,
  playing,
  speed,
  onToggle,
  onNext,
  onPrev,
  onRestart,
  onSeek,
  onSpeed,
  accent,
}: {
  index: number;
  total: number;
  playing: boolean;
  speed: number;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRestart: () => void;
  onSeek: (i: number) => void;
  onSpeed: (s: number) => void;
  accent: string;
}) {
  const btn = 'grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/15 hover:text-white active:scale-95';
  return (
    <div className="flex flex-col gap-3">
      <input
        type="range"
        min={0}
        max={Math.max(total - 1, 0)}
        value={index}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-white"
        style={{ background: `linear-gradient(to right, ${accent} ${(index / Math.max(total - 1, 1)) * 100}%, rgba(255,255,255,0.1) 0)` }}
      />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button className={btn} onClick={onRestart} title="Restart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
          <button className={btn} onClick={onPrev} title="Previous step">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 5h2v14H6zM18 5 9 12l9 7z" />
            </svg>
          </button>
          <button
            className="grid h-12 w-12 place-items-center rounded-full text-[#0d0c24] shadow-lg transition hover:scale-105 active:scale-95"
            style={{ background: accent, boxShadow: `0 0 28px ${accent}66` }}
            onClick={onToggle}
            title={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 4v16l14-8z" />
              </svg>
            )}
          </button>
          <button className={btn} onClick={onNext} title="Next step">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 5h2v14h-2zM6 5l9 7-9 7z" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-white/40">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <div className="flex overflow-hidden rounded-full border border-white/10 bg-white/5 text-[11px]">
            {[0.5, 1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => onSpeed(s)}
                className={cn('px-2.5 py-1.5 transition', speed === s ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white')}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
