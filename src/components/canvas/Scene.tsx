import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { ModelDimensions } from '../../utils/bounds';
import { Ground } from './Ground';
import { PlacedObject } from './PlacedObject';

export interface SceneProps {
  onModelDimensions?: (dimensions: ModelDimensions) => void;
}

/**
 * Root WebGL viewport for the playground staging sandbox.
 * Fills its parent; coordinate system is metric (1 unit = 1 m, +Y up).
 */
export function Scene({ onModelDimensions }: SceneProps) {
  return (
    <Canvas
      shadows
      className="h-full w-full"
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true }}
    >
      {/* Dark slate clear color matches the HTML shell */}
      <color attach="background" args={['#0f172a']} />

      <PerspectiveCamera makeDefault position={[0, 6, 10]} fov={45} />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        // Keep the camera above the ground plane
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={2}
        maxDistance={50}
      />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />

      <Ground />

      {/* Suspense keeps the WebGL context alive while the GLB streams in */}
      <Suspense fallback={null}>
        <PlacedObject onDimensions={onModelDimensions} />
      </Suspense>
    </Canvas>
  );
}
