import { useEffect } from 'react';
import { Scene } from './components/canvas/Scene';
import { useSceneStore } from './store/useSceneStore';
import {
  formatCoordinate,
  formatDistance,
  oppositeUnit,
} from './utils/units';
import type { UnitSystem } from './types/scene';

function abbreviateId(id: string): string {
  return id.length <= 12 ? id : `${id.slice(0, 8)}…`;
}

function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Primary + faint secondary unit pair for dual readouts. */
function DualDistance({
  meters,
  unit,
}: {
  meters: number;
  unit: UnitSystem;
}) {
  const primary = formatDistance(meters, unit);
  const secondary = formatDistance(meters, oppositeUnit(unit));
  return (
    <span className="font-mono text-slate-100">
      {primary}{' '}
      <span className="text-slate-500">({secondary})</span>
    </span>
  );
}

/**
 * Application shell: full-screen 3D viewport + catalog / properties HUD.
 * Display units are formatted at the HUD boundary; the store stays metric.
 */
function App() {
  const catalog = useSceneStore((state) => state.catalog);
  const items = useSceneStore((state) => state.items);
  const selectedId = useSceneStore((state) => state.selectedId);
  const transformMode = useSceneStore((state) => state.transformMode);
  const unitSystem = useSceneStore((state) => state.unitSystem);
  const addItem = useSceneStore((state) => state.addItem);
  const clearScene = useSceneStore((state) => state.clearScene);
  const selectItem = useSceneStore((state) => state.selectItem);
  const setTransformMode = useSceneStore((state) => state.setTransformMode);
  const setUnitSystem = useSceneStore((state) => state.setUnitSystem);
  const deleteSelectedItem = useSceneStore((state) => state.deleteSelectedItem);
  const updateItemTransform = useSceneStore(
    (state) => state.updateItemTransform,
  );

  const selectedItem =
    items.find((item) => item.instanceId === selectedId) ?? null;
  const selectedAsset = selectedItem
    ? (catalog.find((asset) => asset.id === selectedItem.assetId) ?? null)
    : null;

  // Keyboard delete / backspace — ignore while typing in form fields.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') return;

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (
        tag === 'input' ||
        tag === 'textarea' ||
        target?.isContentEditable
      ) {
        return;
      }

      if (useSceneStore.getState().selectedId === null) return;
      event.preventDefault();
      deleteSelectedItem();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deleteSelectedItem]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900">
      {/* Full-screen R3F canvas */}
      <div className="absolute inset-0">
        <Scene />
      </div>

      {/* HTML HUD — pointer-events-none so orbit controls work through empty space */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
        <header className="pointer-events-auto flex items-start justify-between gap-4 px-4 py-3">
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-slate-100">
              Playscape Spatial v0.1
            </h1>
            <p className="text-xs text-slate-400">
              Scene units: metric store · display{' '}
              {unitSystem === 'imperial' ? 'ft / in' : 'meters'}
            </p>
          </div>

          {/* Metric | Imperial display toggle */}
          <div className="flex items-center gap-1 border border-slate-700/70 bg-slate-800/80 p-0.5 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setUnitSystem('metric')}
              className={`px-2.5 py-1 text-xs ${
                unitSystem === 'metric'
                  ? 'bg-sky-900/80 text-sky-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Metric
            </button>
            <button
              type="button"
              onClick={() => setUnitSystem('imperial')}
              className={`px-2.5 py-1 text-xs ${
                unitSystem === 'imperial'
                  ? 'bg-sky-900/80 text-sky-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Imperial
            </button>
          </div>
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
                    {formatDistance(asset.defaultDimensions.width, unitSystem)}{' '}
                    ×{' '}
                    {formatDistance(asset.defaultDimensions.height, unitSystem)}{' '}
                    ×{' '}
                    {formatDistance(asset.defaultDimensions.depth, unitSystem)}
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

          {/* Right: selection-aware properties + transform editors */}
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

            {selectedItem && selectedAsset ? (
              <div className="border border-sky-500/60 bg-sky-950/40 p-2 text-xs text-slate-200">
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-sky-300">
                  Selected
                </p>
                <dl className="space-y-1.5">
                  <div>
                    <dt className="text-slate-500">Instance ID</dt>
                    <dd className="font-mono text-slate-100">
                      {abbreviateId(selectedItem.instanceId)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Asset Name</dt>
                    <dd className="text-slate-100">{selectedItem.name}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Width</dt>
                    <dd>
                      <DualDistance
                        meters={selectedAsset.defaultDimensions.width}
                        unit={unitSystem}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Height</dt>
                    <dd>
                      <DualDistance
                        meters={selectedAsset.defaultDimensions.height}
                        unit={unitSystem}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Depth</dt>
                    <dd>
                      <DualDistance
                        meters={selectedAsset.defaultDimensions.depth}
                        unit={unitSystem}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Position</dt>
                    <dd className="font-mono text-slate-100">
                      X {formatCoordinate(selectedItem.position.x, unitSystem)}
                      , Y{' '}
                      {formatCoordinate(selectedItem.position.y, unitSystem)}, Z{' '}
                      {formatCoordinate(selectedItem.position.z, unitSystem)}
                    </dd>
                  </div>
                </dl>

                {/* Transform mode toggle */}
                <div className="mt-3">
                  <p className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">
                    Transform Mode
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setTransformMode('translate')}
                      className={`flex-1 px-2 py-1.5 text-xs ${
                        transformMode === 'translate'
                          ? 'border border-sky-400 bg-sky-900/70 text-sky-100'
                          : 'border border-slate-600 bg-slate-700/80 text-slate-200 hover:bg-slate-600'
                      }`}
                    >
                      Move
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransformMode('rotate')}
                      className={`flex-1 px-2 py-1.5 text-xs ${
                        transformMode === 'rotate'
                          ? 'border border-sky-400 bg-sky-900/70 text-sky-100'
                          : 'border border-slate-600 bg-slate-700/80 text-slate-200 hover:bg-slate-600'
                      }`}
                    >
                      Rotate (Y)
                    </button>
                  </div>
                </div>

                {/* Precise numeric editors — always edit store meters */}
                <div className="mt-3 space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Pose (store meters)
                  </p>
                  <label className="flex items-center justify-between gap-2">
                    <span className="text-slate-400">
                      Pos X{' '}
                      <span className="text-slate-500">
                        ({formatCoordinate(selectedItem.position.x, unitSystem)})
                      </span>
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      value={Number(selectedItem.position.x.toFixed(3))}
                      onChange={(event) => {
                        const x = Number.parseFloat(event.target.value);
                        if (!Number.isFinite(x)) return;
                        updateItemTransform(selectedItem.instanceId, { x });
                      }}
                      className="w-24 border border-slate-600 bg-slate-900 px-1.5 py-1 font-mono text-[11px] text-slate-100"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-2">
                    <span className="text-slate-400">Pos Y</span>
                    <input
                      type="number"
                      value={0}
                      disabled
                      className="w-24 cursor-not-allowed border border-slate-700 bg-slate-950 px-1.5 py-1 font-mono text-[11px] text-slate-500"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-2">
                    <span className="text-slate-400">
                      Pos Z{' '}
                      <span className="text-slate-500">
                        ({formatCoordinate(selectedItem.position.z, unitSystem)})
                      </span>
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      value={Number(selectedItem.position.z.toFixed(3))}
                      onChange={(event) => {
                        const z = Number.parseFloat(event.target.value);
                        if (!Number.isFinite(z)) return;
                        updateItemTransform(selectedItem.instanceId, { z });
                      }}
                      className="w-24 border border-slate-600 bg-slate-900 px-1.5 py-1 font-mono text-[11px] text-slate-100"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-2">
                    <span className="text-slate-400">Rot Y (°)</span>
                    <input
                      type="number"
                      step="1"
                      value={Number(
                        radiansToDegrees(selectedItem.rotation.y).toFixed(1),
                      )}
                      onChange={(event) => {
                        const degrees = Number.parseFloat(event.target.value);
                        if (!Number.isFinite(degrees)) return;
                        updateItemTransform(
                          selectedItem.instanceId,
                          {},
                          { y: degreesToRadians(degrees) },
                        );
                      }}
                      className="w-24 border border-slate-600 bg-slate-900 px-1.5 py-1 font-mono text-[11px] text-slate-100"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={deleteSelectedItem}
                  className="mt-3 w-full border border-red-700/80 bg-red-950/70 px-2 py-1.5 text-xs text-red-100 hover:bg-red-900/80"
                >
                  Delete Selected
                </button>

                <button
                  type="button"
                  onClick={() => selectItem(null)}
                  className="mt-2 w-full border border-slate-600 bg-slate-700/80 px-2 py-1.5 text-xs text-slate-100 hover:bg-slate-600"
                >
                  Deselect
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No object selected. Click an item in the scene to inspect.
              </p>
            )}

            <ul className="flex flex-col gap-2">
              {items.length === 0 ? (
                <li className="text-xs text-slate-500">No items placed.</li>
              ) : (
                items.map((item) => {
                  const isActive = item.instanceId === selectedId;
                  return (
                    <li key={item.instanceId}>
                      <button
                        type="button"
                        onClick={() => selectItem(item.instanceId)}
                        className={`w-full border p-2 text-left text-[10px] transition-colors ${
                          isActive
                            ? 'border-sky-400/80 bg-sky-950/50 text-sky-100'
                            : 'border-slate-700/60 bg-slate-900/50 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <p className="font-medium text-slate-100">{item.name}</p>
                        <p className="mt-0.5 break-all font-mono text-slate-500">
                          {abbreviateId(item.instanceId)}
                        </p>
                        <p className="mt-1 font-mono text-slate-400">
                          pos (
                          {formatCoordinate(item.position.x, unitSystem)},{' '}
                          {formatCoordinate(item.position.y, unitSystem)},{' '}
                          {formatCoordinate(item.position.z, unitSystem)})
                        </p>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;
