import { Scene } from './components/canvas/Scene';

/**
 * Application shell: full-screen 3D viewport + lightweight HTML HUD overlays.
 * Catalog / properties panels are placeholders for later milestones.
 */
function App() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900">
      {/* Full-screen R3F canvas */}
      <div className="absolute inset-0">
        <Scene />
      </div>

      {/* HTML HUD — pointer-events-none so orbit controls work through empty space */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
        <header className="px-4 py-3">
          <h1 className="text-sm font-semibold tracking-wide text-slate-100">
            Playscape Spatial v0.1
          </h1>
          <p className="text-xs text-slate-400">Metric Grid: 1 cell = 1.0m</p>
        </header>

        <div className="flex min-h-0 flex-1 justify-between px-3 pb-3">
          {/* Left: future asset catalog */}
          <aside className="pointer-events-auto w-56 border border-slate-700/70 bg-slate-800/80 p-3 backdrop-blur-sm">
            <h2 className="text-xs font-medium uppercase tracking-wider text-slate-300">
              Asset Catalog (Milestone 3)
            </h2>
          </aside>

          {/* Right: future selection / transform properties */}
          <aside className="pointer-events-auto w-56 border border-slate-700/70 bg-slate-800/80 p-3 backdrop-blur-sm">
            <h2 className="text-xs font-medium uppercase tracking-wider text-slate-300">
              Properties (Milestone 6)
            </h2>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;
