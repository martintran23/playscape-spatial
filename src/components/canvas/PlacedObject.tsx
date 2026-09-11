import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import type { SceneItem } from '../../types/scene';
import { useSceneStore } from '../../store/useSceneStore';
import { registerPlacedObject } from '../../utils/placedObjectRefs';

export interface PlacedObjectProps {
  item: SceneItem;
}

interface LocalBounds {
  center: [number, number, number];
  size: [number, number, number];
}

/**
 * Renders one catalog instance: applies scene transforms on the outer group,
 * ground-clamps the cloned GLB so its base sits flush on local Y = 0.
 * Click selects the instance; a sky wireframe AABB marks the selection.
 */
export function PlacedObject({ item }: PlacedObjectProps) {
  const { scene } = useGLTF(item.modelPath);
  const outerRef = useRef<THREE.Group>(null);
  const clampRef = useRef<THREE.Group>(null);
  const [localBounds, setLocalBounds] = useState<LocalBounds | null>(null);

  const selectedId = useSceneStore((state) => state.selectedId);
  const isDragging = useSceneStore((state) => state.isDragging);
  const selectItem = useSceneStore((state) => state.selectItem);
  const isSelected = selectedId === item.instanceId;

  // Clone so concurrent instances never share the same Object3D graph.
  const model = useMemo(() => scene.clone(true), [scene]);

  // Register the outer group so Manipulator can attach TransformControls.
  useLayoutEffect(() => {
    registerPlacedObject(item.instanceId, outerRef.current);
    return () => registerPlacedObject(item.instanceId, null);
  }, [item.instanceId]);

  // Sync pose from the store unless this instance is mid-gizmo-drag.
  useLayoutEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    if (isSelected && isDragging) return;

    outer.position.set(item.position.x, item.position.y, item.position.z);
    outer.rotation.set(item.rotation.x, item.rotation.y, item.rotation.z);
    outer.scale.set(item.scale.x, item.scale.y, item.scale.z);
  }, [item, isSelected, isDragging]);

  useLayoutEffect(() => {
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    const clamp = clampRef.current;
    const outer = outerRef.current;
    if (!clamp || !outer) return;

    // Local ground clamp — independent of the outer world position.
    clamp.position.set(0, 0, 0);
    clamp.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clamp);
    clamp.position.y = -box.min.y;
    clamp.updateMatrixWorld(true);

    // Selection wireframe in outer-group local space.
    const clampedBox = new THREE.Box3().setFromObject(clamp);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    clampedBox.getSize(size);
    clampedBox.getCenter(center);
    outer.worldToLocal(center);

    setLocalBounds({
      center: [center.x, center.y, center.z],
      size: [size.x, size.y, size.z],
    });
  }, [model]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    selectItem(item.instanceId);
  };

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
  };

  return (
    <group
      ref={outerRef}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <group ref={clampRef}>
        <primitive object={model} />
      </group>

      {/* Invisible AABB collider — open shade meshes are sparse; this makes picking reliable. */}
      {localBounds && (
        <mesh position={localBounds.center}>
          <boxGeometry args={localBounds.size} />
          <meshBasicMaterial
            transparent
            opacity={0}
            depthWrite={false}
            colorWrite={false}
          />
        </mesh>
      )}

      {isSelected && localBounds && (
        <mesh
          position={localBounds.center}
          // Wireframe is visual-only — do not steal raycasts from the hit volume.
          raycast={() => null}
        >
          <boxGeometry args={localBounds.size} />
          <meshBasicMaterial color="#38bdf8" wireframe toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

// Warm the GLTF cache for the catalog shade.
useGLTF.preload('/assets/models/shade_rectangle_20x26.glb');
