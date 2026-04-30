import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  PerspectiveCamera, 
  Environment, 
  Float, 
  MeshDistortMaterial, 
  ContactShadows,
  MeshWobbleMaterial
} from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const Ocean = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.05;
      meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
      <planeGeometry args={[100, 100, 128, 128]} />
      <MeshDistortMaterial
        color="#001524"
        speed={1.5}
        distort={0.4}
        radius={1}
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

const AbstractStructure = () => {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[-4, 1, -5]}>
          <boxGeometry args={[2, 6, 2]} />
          <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.1} />
        </mesh>
      </Float>
      <Float speed={2.5} rotationIntensity={1} floatIntensity={1.5}>
        <mesh position={[5, 2, -8]}>
          <cylinderGeometry args={[1.5, 1.5, 8, 32]} />
          <meshStandardMaterial color="#F5F5DC" metalness={0.5} roughness={0.3} />
        </mesh>
      </Float>
    </group>
  );
};

const CinematicCamera = () => {
  useFrame((state) => {
    state.camera.position.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 2;
    state.camera.position.z = 15 + Math.cos(state.clock.getElapsedTime() * 0.2) * 2;
    state.camera.lookAt(0, 0, 0);
  });
  return <PerspectiveCamera makeDefault fov={40} />;
};

export const Hero3D = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas shadows dpr={[1, 2]}>
        <CinematicCamera />
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#D4AF37" castShadow />
        <pointLight position={[-10, 5, -10]} intensity={1} color="#002147" />
        
        <Ocean />
        <AbstractStructure />
        
        <Environment preset="sunset" />
        <ContactShadows opacity={0.4} scale={20} blur={2} far={4.5} resolution={256} color="#000000" />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 pointer-events-none" />
    </div>
  );
};
