import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  PerspectiveCamera, 
  Environment, 
  Float, 
  ContactShadows,
  MeshReflectorMaterial,
  PresentationControls
} from '@react-three/drei';
import * as THREE from 'three';

const CarModel = () => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Sleek Abstract Car Silhouette */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[6, 1, 3]} />
        <meshStandardMaterial 
          color="#111" 
          metalness={1} 
          roughness={0.05} 
          envMapIntensity={2}
        />
      </mesh>
      
      {/* Front Hood area */}
      <mesh position={[2, 0.4, 0]} castShadow>
        <boxGeometry args={[2.5, 0.5, 2.8]} />
        <meshStandardMaterial color="#111" metalness={1} roughness={0.05} />
      </mesh>

      {/* Roof area */}
      <mesh position={[-0.5, 0.8, 0]} castShadow>
        <boxGeometry args={[2, 0.8, 2]} />
        <meshStandardMaterial color="#111" metalness={1} roughness={0.05} />
      </mesh>

      {/* Wheels placeholders with glow */}
      {[[-2, -0.4, 1.4], [2, -0.4, 1.4], [-2, -0.4, -1.4], [2, -0.4, -1.4]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
          <meshStandardMaterial color="#050505" metalness={1} roughness={0.1} />
          <mesh position={[0, 0.16, 0]}>
            <ringGeometry args={[0.3, 0.35, 32]} />
            <meshBasicMaterial color="#00f2ff" />
          </mesh>
        </mesh>
      ))}

      {/* Headlights Glow */}
      <pointLight position={[3.1, 0.4, 1.2]} intensity={2} color="#00f2ff" distance={5} />
      <pointLight position={[3.1, 0.4, -1.2]} intensity={2} color="#00f2ff" distance={5} />
    </group>
  );
};

export const CarHero3D = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[10, 5, 12]} fov={35} />
        <ambientLight intensity={0.1} />
        <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1} castShadow color="#ffffff" />
        <spotLight position={[-10, 5, 0]} angle={0.2} penumbra={1} intensity={0.5} color="#00f2ff" />
        
        <PresentationControls
          global
          snap
          rotation={[0, 0.3, 0]}
          polar={[-Math.PI / 6, Math.PI / 6]}
          azimuth={[-Math.PI / 3, Math.PI / 3]}
        >
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <CarModel />
          </Float>
        </PresentationControls>
        
        <Environment preset="city" />
        <ContactShadows 
          position={[0, -0.6, 0]} 
          opacity={0.7} 
          scale={20} 
          blur={2.5} 
          far={4.5} 
        />
        
        {/* Reflective Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.61, 0]}>
          <planeGeometry args={[100, 100]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={1024}
            mixBlur={1}
            mixStrength={80}
            roughness={1}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#050505"
            metalness={0.5}
            mirror={0}
          />
        </mesh>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />
    </div>
  );
};
