import { useLayoutEffect, useState } from 'react';
import { TransformControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import type { Object3D } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useSceneStore } from '../../store/useSceneStore';
import { getPlacedObject } from '../../utils/placedObjectRefs';

/**
 * Attaches a TransformControls gizmo to the selected SceneItem.
 * - Translate: X/Z only, Y forced to 0
 * - Rotate: Y-axis yaw only
 * Disables OrbitControls while dragging and commits pose to the store.
 */
export function Manipulator() {
  const selectedId = useSceneStore((state) => state.selectedId);
  const transformMode = useSceneStore((state) => state.transformMode);
  const items = useSceneStore((state) => state.items);
  const updateItemTransform = useSceneStore((state) => state.updateItemTransform);
  const setDragging = useSceneStore((state) => state.setDragging);

  const orbitControls = useThree(
    (state) => state.controls,
  ) as OrbitControlsImpl | null;

  const [target, setTarget] = useState<Object3D | null>(null);

  const selectedItem =
    items.find((item) => item.instanceId === selectedId) ?? null;

  const posX = selectedItem?.position.x;
  const posZ = selectedItem?.position.z;
  const rotY = selectedItem?.rotation.y;

  useLayoutEffect(() => {
    if (!selectedId || !selectedItem) {
      setTarget(null);
      return;
    }

    const object = getPlacedObject(selectedId);
    if (!object) {
      setTarget(null);
      return;
    }

    setTarget(object);

    // Do not fight TransformControls while the user is dragging.
    if (useSceneStore.getState().isDragging) return;

    object.position.set(selectedItem.position.x, 0, selectedItem.position.z);
    object.rotation.set(0, selectedItem.rotation.y, 0);
  }, [selectedId, selectedItem, posX, posZ, rotY, transformMode]);

  // Re-enable orbit if this manipulator unmounts mid-drag (e.g. deselect).
  useLayoutEffect(() => {
    return () => {
      if (orbitControls) orbitControls.enabled = true;
      setDragging(false);
    };
  }, [orbitControls, setDragging, selectedId]);

  const commitTransform = (object: Object3D) => {
    if (!selectedId) return;

    object.position.y = 0;
    object.rotation.x = 0;
    object.rotation.z = 0;

    updateItemTransform(
      selectedId,
      { x: object.position.x, y: 0, z: object.position.z },
      { y: object.rotation.y },
    );
  };

  if (!selectedItem || !target) return null;

  const isTranslate = transformMode === 'translate';

  return (
    <TransformControls
      key={`${selectedItem.instanceId}-${transformMode}`}
      object={target}
      mode={transformMode}
      space="world"
      showX={isTranslate}
      showY={!isTranslate}
      showZ={isTranslate}
      onMouseDown={() => {
        setDragging(true);
        if (orbitControls) orbitControls.enabled = false;
      }}
      onMouseUp={() => {
        setDragging(false);
        if (orbitControls) orbitControls.enabled = true;
        commitTransform(target);
      }}
      onObjectChange={() => {
        // Live HUD updates only during an active drag — avoid overwriting
        // numeric edits when the gizmo remounts on mode changes.
        if (!useSceneStore.getState().isDragging) return;
        commitTransform(target);
      }}
    />
  );
}
