import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { CodePanel, Sidebar, Transport } from './components/Panels';
import { usePlayer } from './hooks/usePlayer';
import { ALGORITHMS } from './lib/algorithms';
import { Hub } from './three/Hub';
import { CameraRig, World, type View } from './three/World';
import { BinarySearchScene, SortScene, StairsScene, TwoSumScene } from './three/scenes/ArrayScenes';
import { IslandsScene, LinkedListScene, StackScene, TreeScene } from './three/scenes/StructureScenes';
import { cn } from './utils/cn';

const VIEWS: Record<string, View> = {
  hub: { position: [0, 9, 21], target: [0, 2.6, 0] },
  'two-sum': { position: [0, 6.5, 13.5], target: [0, 1.4, -1] },
  'binary-search': { position: [0, 6.5, 14.5], target: [0, 2, 0] },
  'valid-parentheses': { position: [7, 6, 12], target: [0, 1.8, 1] },
  'reverse-linked-list': { position: [0, 5.5, 12.5], target: [0, 1.6, 0] },
  'number-of-islands': { position: [0, 11.5, 11], target: [0, 0, 0] },
  'level-order': { position: [0, 5.5, 17], target: [0, 3.4, 0] },
  'climbing-stairs': { position: [3, 7.5, 14.5], target: [0, 3, 0] },
  'bubble-sort': { position: [0, 6.5, 13.5], target: [0, 2.2, 0] },
};

const SCENES: Record<string, React.ComponentType<{ state: any }>> = {
  'two-sum': TwoSumScene,
  'binary-search': BinarySearchScene,
  'valid-parentheses': StackScene,
  'reverse-linked-list': LinkedListScene,
  'number-of-islands': IslandsScene,
  'level-order': TreeScene,
  'climbing-stairs': StairsScene,
  'bubble-sort': SortScene,
};

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [codeOpen, setCodeOpen] = useState(true);

  const algorithm = useMemo(() => ALGORITHMS.find((a) => a.id === activeId) ?? null, [activeId]);
  const steps = useMemo(() => (algorithm ? algorithm.generate() : []), [algorithm]);
  const player = usePlayer(steps.length, activeId ?? 'hub');
  const step = steps[Math.min(player.index, steps.length - 1)];
  const accent = algorithm?.color ?? '#a78bfa';
  const view = VIEWS[activeId ?? 'hub'];
  const Scene = activeId ? SCENES[activeId] : null;

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!algorithm) return;
      if (e.code === 'Space') {
        e.preventDefault();
        player.toggle();
      } else if (e.code === 'ArrowRight') player.next();
      else if (e.code === 'ArrowLeft') player.prev();
      else if (e.code === 'Escape') setActiveId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [algorithm, player]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#07061a] text-white">
      {/* 3D world */}
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 9, 21], fov: 45, near: 0.1, far: 200 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        className="absolute inset-0"
      >
        <Suspense fallback={null}>
          <World accent={accent}>
            <CameraRig view={view} autoRotate={!activeId} />
            {Scene && step ? (
              <group key={activeId!}>
                <Scene state={step.state} />
              </group>
            ) : (
              <Hub items={ALGORITHMS} onSelect={setActiveId} />
            )}
          </World>
        </Suspense>
      </Canvas>

      {/* vignette gradient for legibility */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#07061a] via-[#07061a]/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#07061a]/80 to-transparent" />

      {/* Header */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-6 py-5">
        <button onClick={() => setActiveId(null)} className="pointer-events-auto group text-left">
          <p className="font-serif text-[11px] uppercase tracking-[0.35em] text-indigo-300/70">A 3D world of</p>
          <h1 className="font-serif text-3xl italic leading-none tracking-tight text-white transition group-hover:text-indigo-200">
            Algorithmica
          </h1>
        </button>
        <div className="pointer-events-auto flex items-center gap-2">
          <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-white/50 backdrop-blur md:inline">
            drag to orbit · scroll to zoom · space to play · ←/→ to step
          </span>
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur transition hover:bg-white/15 hover:text-white"
            aria-label="Toggle atlas"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <Sidebar items={ALGORITHMS} activeId={activeId} onSelect={setActiveId} onHome={() => setActiveId(null)} open={sidebarOpen} onToggle={() => setSidebarOpen(false)} />

      {/* Hub intro */}
      {!algorithm && (
        <div className="pointer-events-none absolute inset-x-0 bottom-10 z-20 flex justify-center px-6">
          <div className="max-w-2xl text-center">
            <p className="font-serif text-2xl italic text-white/90 md:text-3xl">
              Eight chambers. Eight classic interview puzzles.
            </p>
            <p className="mt-3 text-sm text-white/50">
              Click a floating monolith — or choose from the atlas — to step inside an algorithm and watch it think, one luminous step at a time.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {ALGORITHMS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveId(m.id)}
                  className="pointer-events-auto rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur transition hover:border-white/30 hover:text-white"
                  style={{ boxShadow: `inset 0 0 0 0 ${m.color}` }}
                >
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
                  {m.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Algorithm console */}
      {algorithm && step && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-4 md:px-6 md:pb-6">
          <div className="pointer-events-auto mx-auto grid max-w-7xl gap-3 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            {/* narration + transport */}
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-[#0d0c24]/70 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] font-bold" style={{ color: accent }}>
                    LeetCode #{algorithm.number}
                  </span>
                  <h2 className="font-serif text-2xl leading-none text-white">{algorithm.title}</h2>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-medium',
                      algorithm.difficulty === 'Easy' && 'bg-emerald-400/15 text-emerald-300',
                      algorithm.difficulty === 'Medium' && 'bg-amber-400/15 text-amber-300',
                      algorithm.difficulty === 'Hard' && 'bg-rose-400/15 text-rose-300',
                    )}
                  >
                    {algorithm.difficulty}
                  </span>
                  <span className="ml-auto hidden font-serif text-sm italic text-white/40 md:inline">“{algorithm.tagline}”</span>
                </div>
                <p key={player.index} className="animate-[fadeUp_0.5s_ease] font-serif text-lg leading-snug text-white/90 md:text-[21px]">
                  {step.note}
                </p>
              </div>
              <Transport
                index={player.index}
                total={steps.length}
                playing={player.playing}
                speed={player.speed}
                onToggle={player.toggle}
                onNext={player.next}
                onPrev={player.prev}
                onRestart={player.restart}
                onSeek={player.seek}
                onSpeed={player.setSpeed}
                accent={accent}
              />
            </div>
            {/* code */}
            <div className={cn('rounded-2xl border border-white/10 bg-[#0d0c24]/70 shadow-2xl shadow-black/40 backdrop-blur-xl', !codeOpen && 'self-end')}>
              <button onClick={() => setCodeOpen((o) => !o)} className="flex w-full items-center justify-between px-5 py-3 text-left">
                <span className="flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-rose-400/70" />
                    <span className="h-2 w-2 rounded-full bg-amber-400/70" />
                    <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
                  </span>
                  <span className="font-mono text-[11px] text-white/50">solution.py</span>
                </span>
                <span className="text-[11px] text-white/40">{algorithm.tags.join(' · ')} {codeOpen ? '▾' : '▸'}</span>
              </button>
              {codeOpen && (
                <div className="border-t border-white/10 px-3 py-3">
                  <CodePanel code={algorithm.code} line={step.line} accent={accent} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
