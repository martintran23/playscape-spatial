import { Grid } from '@react-three/drei';

/**
 * Metric ground reference: X–Z plane at Y = 0.
 * Major grid cells are exactly 1.0 world unit (= 1.0 meter).
 */
export function Ground() {
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

      {/* Invisible horizontal plane for future raycasting / drop targeting */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        visible={false}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  );
}
