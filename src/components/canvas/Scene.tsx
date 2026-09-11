import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Ground } from './Ground';

/**
 * Root WebGL viewport for the playground staging sandbox.
 * Fills its parent; coordinate system is metric (1 unit = 1 m, +Y up).
 */
export function Scene() {
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
      />

      <Ground />
    </Canvas>
  );
}
