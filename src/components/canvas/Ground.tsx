import { Grid } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useSceneStore } from '../../store/useSceneStore';

/**
 * Metric ground reference: X–Z plane at Y = 0.
 * Major grid cells are exactly 1.0 world unit (= 1.0 meter).
 * Clicking the ground clears the active selection.
 */
export function Ground() {
  const selectItem = useSceneStore((state) => state.selectItem);

  const handleGroundClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    selectItem(null);
  };

  return (
    <group>
      {/* Infinite metric reference grid — sectionSize 1.0 = 1 meter major cells */}
      <Grid
        position={[0, 0, 0]}
        infiniteGrid
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#334155"
        sectionSize={1}
        sectionThickness={1.25}
        sectionColor="#64748b"
        fadeDistance={40}
        fadeStrength={1}
        followCamera={false}
      />

      {/* Shadow catcher + raycast target for deselect-on-ground-click */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        onClick={handleGroundClick}
      >
        <planeGeometry args={[200, 200]} />
        <shadowMaterial opacity={0.35} />
      </mesh>
    </group>
  );
}
