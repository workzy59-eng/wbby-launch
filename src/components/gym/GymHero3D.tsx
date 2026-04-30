import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  PerspectiveCamera, 
  Environment, 
  Float, 
  ContactShadows,
  MeshWobbleMaterial
} from '@react-three/drei';
import * as THREE from 'three';

const GymWeights = () => {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.15;
      group.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  return (
    <group ref={group}>
      {/* Kettlebell / Industrial Shape 1 */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[-4, 1, -5]}>
          <torusGeometry args={[1.5, 0.4, 32, 64]} />
          <meshStandardMaterial 
            color="#ff3e3e" 
            metalness={0.9} 
            roughness={0.1} 
            emissive="#ff3e3e"
            emissiveIntensity={0.2}
          />
        </mesh>
      </Float>

      {/* Industrial Shape 2 */}
      <Float speed={2.5} rotationIntensity={1} floatIntensity={1.5}>
        <mesh position={[5, 2, -8]}>
          <octahedronGeometry args={[2, 0]} />
          <meshStandardMaterial 
            color="#00f2ff" 
            metalness={1} 
            roughness={0} 
            emissive="#00f2ff"
            emissiveIntensity={0.1}
          />
        </mesh>
      </Float>

      {/* Central Floating Plate */}
      <mesh position={[0, -1, -2]}>
        <cylinderGeometry args={[2.5, 2.5, 0.5, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

const CinematicCamera = () => {
  useFrame((state) => {
    state.camera.position.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 3;
    state.camera.position.z = 12 + Math.cos(state.clock.getElapsedTime() * 0.1) * 3;
    state.camera.lookAt(0, 0, 0);
  });
  return <PerspectiveCamera makeDefault fov={45} />;
};

export const GymHero3D = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas shadows dpr={[1, 2]}>
        <CinematicCamera />
        <ambientLight intensity={0.2} />
        
        {/* Neon Spotlights */}
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={3} color="#ff3e3e" castShadow />
        <spotLight position={[-10, 10, -5]} angle={0.2} penumbra={1} intensity={2} color="#00f2ff" />
        
        <GymWeights />
        
        <Environment preset="night" />
        <ContactShadows opacity={0.6} scale={20} blur={2.5} far={4.5} resolution={256} color="#000000" />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none" />
    </div>
  );
};
