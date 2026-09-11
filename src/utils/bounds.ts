import * as THREE from 'three';

/** Axis-aligned model extents in meters (1 Three.js unit = 1 m). */
export interface ModelDimensions {
  width: number; // X span
  height: number; // Y span
  depth: number; // Z span
}

/**
 * Compute world-space AABB size for a loaded Object3D hierarchy.
 * Call after matrices are up to date (e.g. post-layout / after transforms).
 */
export function computeModelBounds(object: THREE.Object3D): ModelDimensions {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);

  return {
    width: size.x,
    height: size.y,
    depth: size.z,
  };
}
