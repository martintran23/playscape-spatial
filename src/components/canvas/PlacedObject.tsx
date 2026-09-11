import { useLayoutEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import {
  computeModelBounds,
  type ModelDimensions,
} from '../../utils/bounds';

const MODEL_PATH = '/assets/models/shade_rectangle_20x26.glb';

export interface PlacedObjectProps {
  /** Fires once dimensions are measured after ground-clamping. */
  onDimensions?: (dimensions: ModelDimensions) => void;
}

/**
 * Loads the Milestone 2 shade structure at the origin, enables shadows,
 * clamps the mesh bottom to Y = 0, and reports metric AABB dimensions.
 */
export function PlacedObject({ onDimensions }: PlacedObjectProps) {
  const { scene } = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);

  // Clone so we never mutate the GLTF cache (StrictMode / HMR safe).
  const model = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    const group = groupRef.current;
    if (!group) return;

    // Measure at Y = 0, then lift so the lowest point sits flush on the ground.
    group.position.set(0, 0, 0);
    group.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(group);
    group.position.y = -box.min.y;
    group.updateMatrixWorld(true);

    onDimensions?.(computeModelBounds(group));
  }, [model, onDimensions]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
