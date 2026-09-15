import { create } from 'zustand';
import type {
  CatalogAsset,
  SceneItem,
  UnitSystem,
  Vector3Tuple,
} from '../types/scene';

/** Verified AABB from Milestone 2 for the Superior rectangle shade. */
const SHADE_RECTANGLE: CatalogAsset = {
  id: 'shade_rectangle_20x26',
  name: "Superior 20'x26' Rectangle Shade",
  modelPath: '/assets/models/shade_rectangle_20x26.glb',
  category: 'shade',
  defaultDimensions: {
    width: 6.26,
    height: 3.66,
    depth: 8.09,
  },
};

export type TransformMode = 'translate' | 'rotate';

interface SceneStore {
  catalog: CatalogAsset[];
  items: SceneItem[];
  selectedId: string | null;
  transformMode: TransformMode;
  /** Display preference only — store coordinates stay metric meters. */
  unitSystem: UnitSystem;
  /** True while TransformControls is actively dragging (pauses store→object pose sync). */
  isDragging: boolean;
  addItem: (assetId: string) => void;
  removeItem: (instanceId: string) => void;
  clearScene: () => void;
  selectItem: (instanceId: string | null) => void;
  setTransformMode: (mode: TransformMode) => void;
  setDragging: (dragging: boolean) => void;
  setUnitSystem: (unit: UnitSystem) => void;
  toggleUnitSystem: () => void;
  deleteSelectedItem: () => void;
  updateItemTransform: (
    instanceId: string,
    position: Partial<Vector3Tuple>,
    rotation?: Partial<Vector3Tuple>,
  ) => void;
}

/**
 * Central scene graph state: catalog, instances, selection, and transform tooling.
 * All spatial values remain metric (1 unit = 1 meter).
 */
export const useSceneStore = create<SceneStore>((set, get) => ({
  catalog: [SHADE_RECTANGLE],
  items: [],
  selectedId: null,
  transformMode: 'translate',
  // Default imperial for US commercial playground sales workflows.
  unitSystem: 'imperial',
  isDragging: false,

  addItem: (assetId) => {
    const asset = get().catalog.find((entry) => entry.id === assetId);
    if (!asset) return;

    const index = get().items.length;
    // Stagger by asset width + 1 m clearance so footprints do not overlap.
    const staggerX = index * (asset.defaultDimensions.width + 1);

    const item: SceneItem = {
      instanceId: crypto.randomUUID(),
      assetId: asset.id,
      name: asset.name,
      modelPath: asset.modelPath,
      position: { x: staggerX, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    };

    set({ items: [...get().items, item] });
  },

  removeItem: (instanceId) => {
    const { items, selectedId } = get();
    set({
      items: items.filter((item) => item.instanceId !== instanceId),
      selectedId: selectedId === instanceId ? null : selectedId,
      isDragging: false,
    });
  },

  clearScene: () => {
    set({ items: [], selectedId: null, isDragging: false });
  },

  selectItem: (instanceId) => {
    set({ selectedId: instanceId, isDragging: false });
  },

  setTransformMode: (mode) => {
    set({ transformMode: mode });
  },

  setDragging: (dragging) => {
    set({ isDragging: dragging });
  },

  setUnitSystem: (unit) => {
    set({ unitSystem: unit });
  },

  toggleUnitSystem: () => {
    set({
      unitSystem: get().unitSystem === 'imperial' ? 'metric' : 'imperial',
    });
  },

  deleteSelectedItem: () => {
    const { selectedId, removeItem } = get();
    if (selectedId === null) return;
    removeItem(selectedId);
  },

  updateItemTransform: (instanceId, position, rotation) => {
    set({
      items: get().items.map((item) => {
        if (item.instanceId !== instanceId) return item;

        return {
          ...item,
          position: {
            x: position.x ?? item.position.x,
            // Always keep instances flush on the ground plane.
            y: 0,
            z: position.z ?? item.position.z,
          },
          rotation: {
            // Only yaw is editable — keep structures upright.
            x: 0,
            y: rotation?.y ?? item.rotation.y,
            z: 0,
          },
        };
      }),
    });
  },
}));
