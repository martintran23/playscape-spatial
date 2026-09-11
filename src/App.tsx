import { useState } from 'react';
import { Scene } from './components/canvas/Scene';
import type { ModelDimensions } from './utils/bounds';

/**
 * Application shell: full-screen 3D viewport + lightweight HTML HUD overlays.
 * Properties panel shows live metric bounds for the Milestone 2 shade asset.
 */
function App() {
  const [dimensions, setDimensions] = useState<ModelDimensions | null>(null);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900">
      {/* Full-screen R3F canvas */}
      <div className="absolute inset-0">
        <Scene onModelDimensions={setDimensions} />
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

          {/* Right: live model properties for the placed shade structure */}
          <aside className="pointer-events-auto w-64 border border-slate-700/70 bg-slate-800/80 p-3 backdrop-blur-sm">
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-300">
              Properties
            </h2>
            <dl className="space-y-2 text-xs text-slate-200">
              <div>
                <dt className="text-slate-500">Model Name</dt>
                <dd className="text-slate-100">
                  Superior 20&apos;x26&apos; Rectangle Shade
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Asset Path</dt>
                <dd className="break-all font-mono text-[10px] text-slate-300">
                  /assets/models/shade_rectangle_20x26.glb
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Width (X)</dt>
                <dd>
                  {dimensions
                    ? `${dimensions.width.toFixed(2)} m`
                    : 'Loading…'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Height (Y)</dt>
                <dd>
                  {dimensions
                    ? `${dimensions.height.toFixed(2)} m`
                    : 'Loading…'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Depth (Z)</dt>
                <dd>
                  {dimensions
                    ? `${dimensions.depth.toFixed(2)} m`
                    : 'Loading…'}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;
