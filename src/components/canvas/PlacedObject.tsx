import { useLayoutEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { SceneItem } from '../../types/scene';

export interface PlacedObjectProps {
  item: SceneItem;
}

/**
 * Renders one catalog instance: applies scene transforms on the outer group,
 * ground-clamps the cloned GLB so its base sits flush on local Y = 0.
 */
export function PlacedObject({ item }: PlacedObjectProps) {
  const { scene } = useGLTF(item.modelPath);
  const clampRef = useRef<THREE.Group>(null);

  // Clone so concurrent instances never share the same Object3D graph.
  const model = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    const clamp = clampRef.current;
    if (!clamp) return;

    // Local ground clamp — independent of the outer world position.
    clamp.position.set(0, 0, 0);
    clamp.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clamp);
    clamp.position.y = -box.min.y;
  }, [model]);

  return (
    <group
      position={[item.position.x, item.position.y, item.position.z]}
      rotation={[item.rotation.x, item.rotation.y, item.rotation.z]}
      scale={[item.scale.x, item.scale.y, item.scale.z]}
    >
      <group ref={clampRef}>
        <primitive object={model} />
      </group>
    </group>
  );
}

// Warm the GLTF cache for the Milestone 3 catalog shade.
useGLTF.preload('/assets/models/shade_rectangle_20x26.glb');
