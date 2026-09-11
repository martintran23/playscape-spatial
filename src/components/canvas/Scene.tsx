import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useSceneStore } from '../../store/useSceneStore';
import { Ground } from './Ground';
import { Manipulator } from './Manipulator';
import { PlacedObject } from './PlacedObject';

/**
 * Root WebGL viewport for the playground staging sandbox.
 * Fills its parent; coordinate system is metric (1 unit = 1 m, +Y up).
 * Placed instances are driven by the Zustand scene store.
 */
export function Scene() {
  const items = useSceneStore((state) => state.items);
  const selectItem = useSceneStore((state) => state.selectItem);

  return (
    <Canvas
      shadows
      className="h-full w-full"
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true }}
      // Clicks that miss all meshes (e.g. sky) clear selection.
      onPointerMissed={() => selectItem(null)}
    >
      {/* Dark slate clear color matches the HTML shell */}
      <color attach="background" args={['#0f172a']} />

      <PerspectiveCamera makeDefault position={[0, 8, 16]} fov={45} />

      {/* makeDefault exposes this instance to useThree().controls for Manipulator */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        // Keep the camera above the ground plane
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={2}
        maxDistance={80}
      />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      <Ground />

      {/* Suspense keeps the WebGL context alive while GLBs stream in */}
      <Suspense fallback={null}>
        {items.map((item) => (
          <PlacedObject key={item.instanceId} item={item} />
        ))}
      </Suspense>

      {/* Gizmo attaches to the selected instance after objects are mounted */}
      <Manipulator />
    </Canvas>
  );
}
