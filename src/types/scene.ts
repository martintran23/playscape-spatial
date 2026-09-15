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

/** Project-level metadata persisted with a layout JSON export. */
export interface SceneMetadata {
  projectName: string;
  createdAt: string;
  lastModified: string;
  defaultUnits: UnitSystem;
}

/**
 * Versioned playground layout document (client-side JSON persistence).
 * Spatial values inside `items` are always metric meters.
 */
export interface PlaygroundSceneSchema {
  version: '1.0.0';
  metadata: SceneMetadata;
  environment: {
    type: 'default_grid' | 'custom_mesh';
    assetPath?: string;
  };
  items: SceneItem[];
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isVector3Tuple(value: unknown): value is Vector3Tuple {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return isFiniteNumber(v.x) && isFiniteNumber(v.y) && isFiniteNumber(v.z);
}

function isSceneItem(value: unknown): value is SceneItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.instanceId === 'string' &&
    typeof item.assetId === 'string' &&
    typeof item.name === 'string' &&
    typeof item.modelPath === 'string' &&
    isVector3Tuple(item.position) &&
    isVector3Tuple(item.rotation) &&
    isVector3Tuple(item.scale)
  );
}

/** Lightweight runtime guard for imported layout JSON (no external schema libs). */
export function isPlaygroundSceneSchema(
  value: unknown,
): value is PlaygroundSceneSchema {
  if (!value || typeof value !== 'object') return false;
  const doc = value as Record<string, unknown>;

  if (doc.version !== '1.0.0') return false;
  if (!Array.isArray(doc.items)) return false;
  if (!doc.items.every(isSceneItem)) return false;

  const metadata = doc.metadata as Record<string, unknown> | undefined;
  if (!metadata || typeof metadata !== 'object') return false;
  if (typeof metadata.projectName !== 'string') return false;
  if (typeof metadata.createdAt !== 'string') return false;
  if (typeof metadata.lastModified !== 'string') return false;
  if (metadata.defaultUnits !== 'metric' && metadata.defaultUnits !== 'imperial') {
    return false;
  }

  const environment = doc.environment as Record<string, unknown> | undefined;
  if (!environment || typeof environment !== 'object') return false;
  if (
    environment.type !== 'default_grid' &&
    environment.type !== 'custom_mesh'
  ) {
    return false;
  }

  return true;
}
