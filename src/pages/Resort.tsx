import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Float, 
  MeshDistortMaterial, 
  MeshWobbleMaterial, 
  GradientTexture,
  Text,
  Environment,
  ContactShadows,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palmtree, 
  MapPin, 
  Star, 
  ArrowRight, 
  Waves, 
  Phone, 
  Mail, 
  Instagram, 
  Wind, 
  Sun, 
  Play, 
  Compass,
  ArrowDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

// --- 3D Components ---

const WaterMesh = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
      meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[100, 100, 50, 50]} />
      <MeshDistortMaterial
        color="#0a1a1f"
        speed={1}
        distort={0.4}
        radius={1}
        metalness={0.8}
        roughness={0.2}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
};

const AbstractPalm = ({ position, scale = 1 }: { position: [number, number, number], scale?: number }) => {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.05, 0.1, 4, 8]} />
        <meshStandardMaterial color="#1a0f00" />
      </mesh>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[0, 4, 0]} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[0.8, 0.02, 16, 3]} />
          <meshStandardMaterial color="#c7c42a" emissive="#c7c42a" emissiveIntensity={0.5} />
        </mesh>
      </Float>
    </group>
  );
};

const Scene = () => {
  const { camera } = useThree();
  const sceneRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    gsap.to(camera.position, {
      z: 15,
      y: 5,
      scrollTrigger: {
        trigger: ".resort-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      }
    });

    gsap.to(sceneRef.current.rotation, {
      y: Math.PI * 0.5,
      scrollTrigger: {
        trigger: ".resort-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 2,
      }
    });
  }, [camera]);

  return (
    <group ref={sceneRef}>
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#c7c42a" />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#00f2ff" />
      
      <WaterMesh />
      
      <AbstractPalm position={[-5, -2, -5]} scale={1.5} />
      <AbstractPalm position={[8, -2, -8]} scale={2} />
      <AbstractPalm position={[-12, -2, 2]} scale={1.2} />
      
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[0, 2, -10]}>
          <sphereGeometry args={[2, 64, 64]} />
          <MeshWobbleMaterial
            color="#c7c42a"
            factor={0.5}
            speed={2}
            emissive="#000000"
          />
        </mesh>
      </Float>

      <ContactShadows 
        opacity={0.4} 
        scale={20} 
        blur={2} 
        far={4.5} 
        resolution={256} 
        color="#000000" 
      />
    </group>
  );
};

// --- Page Components ---

export default function Resort() {
  const [activeRoom, setActiveRoom] = useState(0);
  const rooms = [
    {
      title: "The Crystal Villa",
      type: "Overwater Sanctuary",
      features: ["Private Infinity Pool", "Glass Floor Panel", "24/7 Personal Butler"],
      image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1200"
    },
    {
      title: "Azure Cliff Suite",
      type: "Panoramic Ocean View",
      features: ["Outdoor Rainfall Shower", "Smart Climate Control", "Private Beach Access"],
      image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=1200"
    },
    {
      title: "Zen Garden Loft",
      type: "Tropical Immersion",
      features: ["Meditation Pavilion", "Zero-Gravity Bed", "Botanical Bathing"],
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200"
    }
  ];

  return (
    <div className="resort-container min-h-[500vh] bg-[#050505] text-white selection:bg-[#c7c42a] selection:text-black overflow-x-hidden relative font-sans">
      
      {/* Three.js Background */}
      <div className="fixed inset-0 z-0">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 2, 25]} fov={45} />
          <Scene />
          <Environment preset="night" />
        </Canvas>
      </div>

      {/* Extreme Overlay Overlay */}
      <div className="fixed inset-0 pointer-events-none z-1 bg-gradient-to-b from-black/60 via-transparent to-black/90" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-8 flex justify-between items-center transition-all duration-500 backdrop-blur-sm border-b border-white/5">
        <Link to="/" className="text-2xl font-black italic tracking-tighter uppercase group">
          AZURE<span className="text-[#c7c42a] group-hover:animate-pulse">.</span>HAVEN
        </Link>
        <div className="hidden md:flex gap-12 items-center">
          {['Villas', 'Retreat', 'Dining'].map((item) => (
            <button key={item} className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-[#c7c42a] transition-all">
              {item}
            </button>
          ))}
          <button className="bg-[#c7c42a] text-black px-8 py-3 rounded-full font-black uppercase italic text-[10px] tracking-widest hover:scale-105 transition-all">
            Reserve
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className="relative z-10"
        >
          <span className="text-[10px] font-black uppercase tracking-[1em] text-[#c7c42a] mb-6 block">
            A New Standard of Being
          </span>
          <h1 className="text-[12vw] md:text-[15vw] font-black uppercase italic tracking-tighter leading-[0.7] text-white drop-shadow-2xl">
            FLUID <br />
            <span className="text-transparent font-outline-2 text-white/10 italic">RESTORE.</span>
          </h1>
          <p className="mt-12 text-lg md:text-xl font-medium italic text-white/40 max-w-2xl mx-auto leading-relaxed tracking-wide">
            Where the boundaries between architecture and nature dissipate. Experience the definitive atmospheric luxury.
          </p>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40"
        >
          <span className="text-[8px] font-black uppercase tracking-[0.6em] rotate-90 origin-left whitespace-nowrap">Begin Descent</span>
          <ArrowDown size={16} />
        </motion.div>
      </section>

      {/* Room Showcase (Vertical Scroll Content) */}
      <section className="relative z-10 py-60 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <div className="space-y-12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-7xl font-black italic tracking-tighter uppercase leading-[0.85]">
                THE <br /> LIVING <br /><span className="text-[#c7c42a]">GALLERY.</span>
              </h2>
              <p className="text-xl text-white/40 font-medium italic leading-relaxed max-w-md">
                Every residence is a bespoke masterpiece designed to synchronize with your biological rhythm.
              </p>
            </motion.div>

            <div className="space-y-8">
              {rooms.map((room, i) => (
                <button 
                  key={i}
                  onMouseEnter={() => setActiveRoom(i)}
                  className={`group flex items-start gap-8 w-full transition-all pb-8 border-b ${activeRoom === i ? 'border-[#c7c42a] opacity-100' : 'border-white/5 opacity-30 hover:opacity-100'}`}
                >
                  <span className="text-4xl font-black italic italic-bold tracking-tighter text-[#c7c42a]">0{i + 1}</span>
                  <div className="text-left">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter group-hover:translate-x-2 transition-transform">{room.title}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a] mt-1">{room.type}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative group perspective-2000">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeRoom}
                initial={{ opacity: 0, rotateY: 45, scale: 0.9 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, rotateY: -45, scale: 1.1 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl border border-white/10 relative"
              >
                <img 
                  src={rooms[activeRoom].image} 
                  alt={rooms[activeRoom].title} 
                  className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-12 left-12 right-12 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {rooms[activeRoom].features.map((f, i) => (
                      <span key={i} className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase tracking-widest">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Visual Artifacts */}
            <div className="absolute -top-10 -right-10 w-40 h-40 border-2 border-dashed border-[#c7c42a]/20 rounded-full animate-spin-slow pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Cinematic Quote Section */}
      <section className="relative h-screen flex items-center justify-center">
         <div className="max-w-4xl mx-auto text-center space-y-16 px-6">
            <motion.div 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               className="w-px h-32 bg-gradient-to-b from-[#c7c42a] to-transparent mx-auto" 
            />
            <h2 className="text-4xl md:text-6xl font-light italic text-white/80 leading-tight tracking-[0.05em]">
              "Azure Haven is not a destination; it's the frequency where your soul and the horizon become one."
            </h2>
            <div className="flex flex-col items-center gap-4">
               <span className="text-[10px] font-black uppercase tracking-[0.8em] text-[#c7c42a]">The Philosophy</span>
               <div className="w-16 h-px bg-white/20" />
            </div>
         </div>
      </section>

      {/* Signature Experiences (Interactive Grid) */}
      <section className="py-60 relative z-10 px-6">
         <div className="max-w-7xl mx-auto">
            <div className="mb-32 flex flex-col md:flex-row justify-between items-end gap-12">
               <div className="space-y-6">
                  <span className="text-[#c7c42a] font-black uppercase tracking-[1em] text-[10px]">Pure immersion</span>
                  <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">SIGNATURE <br /><span className="text-white/10">RITUALS.</span></h2>
               </div>
               <p className="text-xl text-white/30 font-medium italic max-w-sm">
                  Beyond service, we provide orchestration. Each moment is calibrated to evoke a specific emotional state.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               {[
                 { title: 'The Sky Dining', type: 'Sensory', img: 'https://images.unsplash.com/photo-1510626396912-1647a6125000?q=80&w=1200' },
                 { title: 'Oceanic Spa', type: 'Vitality', img: 'https://images.unsplash.com/photo-1544161515-4ae6b91827d1?q=80&w=1200' },
                 { title: 'Moonlight Yoga', type: 'Spirit', img: 'https://images.unsplash.com/photo-1545208393-596371BA33C9?q=80&w=1200' },
                 { title: 'Coral Safari', type: 'Discovery', img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200' }
               ].map((exp, i) => (
                 <motion.div 
                   key={i}
                   whileHover={{ y: -10 }}
                   className="relative h-[600px] rounded-[3rem] overflow-hidden group cursor-pointer border border-white/5"
                 >
                    <img src={exp.img} alt={exp.title} className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                    <div className="absolute inset-0 p-12 flex flex-col justify-end">
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c7c42a] mb-2">{exp.type}</span>
                       <h3 className="text-4xl font-black uppercase italic tracking-tighter">{exp.title}</h3>
                       <div className="h-px w-0 bg-white group-hover:w-full transition-all duration-700 mt-6" />
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Extreme Footer */}
      <footer className="py-40 px-8 bg-black relative border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-24">
          <div className="lg:col-span-6 space-y-12">
            <h4 className="text-5xl font-black italic tracking-tighter uppercase">AZURE<span className="text-[#c7c42a]">.</span>HAVEN</h4>
            <p className="text-xl font-medium italic leading-relaxed text-white/30 max-w-md">
              A limited-access retreat designed for world-builders. Part of the Webby Premium Portfolio.
            </p>
            <div className="flex gap-8">
              {[Instagram, Phone, Mail].map((Icon, i) => (
                <button key={i} className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[#c7c42a] hover:border-[#c7c42a] transition-all">
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-3 space-y-8">
             <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c7c42a]">Locations</h5>
             <ul className="space-y-4 text-lg font-black uppercase italic tracking-tighter text-white/20">
                <li className="hover:text-white transition-colors cursor-pointer">Maldives</li>
                <li className="hover:text-white transition-colors cursor-pointer">Mauritius</li>
                <li className="hover:text-white transition-colors cursor-pointer">Seychelles</li>
             </ul>
          </div>

          <div className="lg:col-span-3 space-y-8 text-right">
             <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c7c42a]">The Pulse</h5>
             <p className="text-xs font-medium italic text-white/20">Receive exclusive invites to seasonal solstices.</p>
             <input type="email" placeholder="YOUR@EMAIL.COM" className="w-full bg-transparent border-b border-white/10 py-4 text-right italic font-black uppercase tracking-tighter focus:outline-none focus:border-[#c7c42a] transition-all" />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-40 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
           <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/10 italic">
             © 2026 WebbyLaunch Protocol. All Atmospheres Secured.
           </p>
           <div className="flex gap-8">
              <Link to="/" className="text-[8px] font-black uppercase tracking-[0.4em] text-white/10 hover:text-white transition-all">Portfolio</Link>
              <Link to="/auth" className="text-[8px] font-black uppercase tracking-[0.4em] text-white/10 hover:text-white transition-all">Protocol</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
