import { create } from 'zustand';
import type { CatalogAsset, SceneItem } from '../types/scene';

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

interface SceneStore {
  catalog: CatalogAsset[];
  items: SceneItem[];
  selectedId: string | null;
  addItem: (assetId: string) => void;
  removeItem: (instanceId: string) => void;
  clearScene: () => void;
  selectItem: (instanceId: string | null) => void;
}

/**
 * Central scene graph state: catalog definitions + placed instances + selection.
 * Spawn positions stagger along +X so new instances do not stack.
 */
export const useSceneStore = create<SceneStore>((set, get) => ({
  catalog: [SHADE_RECTANGLE],
  items: [],
  selectedId: null,

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
    });
  },

  clearScene: () => {
    set({ items: [], selectedId: null });
  },

  selectItem: (instanceId) => {
    set({ selectedId: instanceId });
  },
}));
