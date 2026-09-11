import { Scene } from './components/canvas/Scene';
import { useSceneStore } from './store/useSceneStore';

/**
 * Application shell: full-screen 3D viewport + catalog / properties HUD.
 * Catalog buttons spawn SceneItems into the Zustand store.
 */
function App() {
  const catalog = useSceneStore((state) => state.catalog);
  const items = useSceneStore((state) => state.items);
  const addItem = useSceneStore((state) => state.addItem);
  const clearScene = useSceneStore((state) => state.clearScene);

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
          {/* Left: asset catalog */}
          <aside className="pointer-events-auto flex w-64 flex-col gap-3 overflow-y-auto border border-slate-700/70 bg-slate-800/80 p-3 backdrop-blur-sm">
            <h2 className="text-xs font-medium uppercase tracking-wider text-slate-300">
              Asset Catalog
            </h2>
            <ul className="flex flex-col gap-2">
              {catalog.map((asset) => (
                <li
                  key={asset.id}
                  className="border border-slate-700/60 bg-slate-900/50 p-2"
                >
                  <p className="text-xs font-medium text-slate-100">
                    {asset.name}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                    {asset.category.replace('_', ' ')}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-slate-400">
                    {asset.defaultDimensions.width.toFixed(2)} ×{' '}
                    {asset.defaultDimensions.height.toFixed(2)} ×{' '}
                    {asset.defaultDimensions.depth.toFixed(2)} m
                  </p>
                  <button
                    type="button"
                    onClick={() => addItem(asset.id)}
                    className="mt-2 w-full border border-slate-600 bg-slate-700/80 px-2 py-1.5 text-xs text-slate-100 hover:bg-slate-600"
                  >
                    + Add to Scene
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Right: scene instance summary */}
          <aside className="pointer-events-auto flex w-72 flex-col gap-3 overflow-y-auto border border-slate-700/70 bg-slate-800/80 p-3 backdrop-blur-sm">
            <h2 className="text-xs font-medium uppercase tracking-wider text-slate-300">
              Properties
            </h2>

            <p className="text-xs text-slate-200">
              Total Items in Scene:{' '}
              <span className="font-semibold text-slate-50">{items.length}</span>
            </p>

            <button
              type="button"
              onClick={clearScene}
              disabled={items.length === 0}
              className="border border-slate-600 bg-slate-700/80 px-2 py-1.5 text-xs text-slate-100 hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear Scene
            </button>

            <ul className="flex flex-col gap-2">
              {items.length === 0 ? (
                <li className="text-xs text-slate-500">No items placed.</li>
              ) : (
                items.map((item) => (
                  <li
                    key={item.instanceId}
                    className="border border-slate-700/60 bg-slate-900/50 p-2 text-[10px] text-slate-300"
                  >
                    <p className="font-medium text-slate-100">{item.name}</p>
                    <p className="mt-0.5 break-all font-mono text-slate-500">
                      {item.instanceId}
                    </p>
                    <p className="mt-1 font-mono text-slate-400">
                      pos ({item.position.x.toFixed(2)},{' '}
                      {item.position.y.toFixed(2)},{' '}
                      {item.position.z.toFixed(2)})
                    </p>
                  </li>
                ))
              )}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;
