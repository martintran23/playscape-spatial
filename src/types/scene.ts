/** Global unit convention for the playground staging sandbox. */
export type UnitSystem = 'metric' | 'imperial';

/** Plain XYZ tuple used by scene graph / persistence layers (1 unit = 1 meter in metric). */
export interface Vector3Tuple {
  x: number;
  y: number;
  z: number;
}

/** Catalog entry describing a spawnable playground asset. */
export interface CatalogAsset {
  id: string; // e.g. 'shade_rectangle_20x26'
  name: string; // e.g. "Superior 20'x26' Rectangle Shade"
  modelPath: string; // e.g. '/assets/models/shade_rectangle_20x26.glb'
  category: 'shade' | 'play_structure' | 'swing' | 'amenity';
  defaultDimensions: {
    width: number;
    height: number;
    depth: number;
  };
}

/** A concrete instance placed in the staging scene. */
export interface SceneItem {
  instanceId: string; // crypto.randomUUID()
  assetId: string;
  name: string;
  modelPath: string;
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  scale: Vector3Tuple;
}
