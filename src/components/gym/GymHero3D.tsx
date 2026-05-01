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
      group.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group ref={group}>
      {/* Diamonds and Circles rotating around center */}
      {[...Array(6)].map((_, i) => {
        const radius = 8;
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const isOctahedron = i % 2 === 0;

        return (
          <Float 
            key={i} 
            speed={1.5 + i * 0.2} 
            rotationIntensity={1} 
            floatIntensity={2}
            position={[x, Math.sin(i * 1.5) * 2, z]}
          >
            <mesh>
              {isOctahedron ? (
                <octahedronGeometry args={[1, 0]} />
              ) : (
                <torusGeometry args={[0.8, 0.2, 16, 32]} />
              )}
              <meshStandardMaterial 
                color={isOctahedron ? "#ff3e3e" : "#00f2ff"} 
                metalness={0.9} 
                roughness={0.1} 
                emissive={isOctahedron ? "#ff3e3e" : "#00f2ff"}
                emissiveIntensity={0.3}
              />
            </mesh>
          </Float>
        );
      })}

      {/* Central Floating Elements */}
      <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[0, -2, -5]}>
          <cylinderGeometry args={[4, 4, 0.5, 32]} />
          <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
        </mesh>
      </Float>
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
