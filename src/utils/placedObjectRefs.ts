import type { Object3D } from 'three';

/** Runtime map from SceneItem.instanceId → outer Object3D group. */
const placedObjectRefs = new Map<string, Object3D>();

export function registerPlacedObject(
  instanceId: string,
  object: Object3D | null,
): void {
  if (object) {
    placedObjectRefs.set(instanceId, object);
  } else {
    placedObjectRefs.delete(instanceId);
  }
}

export function getPlacedObject(instanceId: string): Object3D | undefined {
  return placedObjectRefs.get(instanceId);
}
