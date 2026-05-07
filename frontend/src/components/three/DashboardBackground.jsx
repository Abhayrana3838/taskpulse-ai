import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Ultra-minimal ambient particles
function AmbientParticles({ count = 40 }) {
  const pointsRef = useRef();
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 30;
      pos[i3 + 1] = (Math.random() - 0.5) * 25;
      pos[i3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, [count]);
  
  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.elapsedTime * 0.08;
    
    pointsRef.current.rotation.y = time * 0.01;
    pointsRef.current.rotation.x = Math.sin(time * 0.02) * 0.01;
  });
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        size={0.025} 
        color="#6b7280" 
        transparent 
        opacity={0.15} 
        sizeAttenuation 
      />
    </points>
  );
}

// Very subtle gradient mesh
function GradientMesh() {
  const meshRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.elapsedTime * 0.03;
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(time) * 0.02;
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, 0, -10]}>
      <planeGeometry args={[40, 30, 1, 1]} />
      <meshBasicMaterial 
        color="#1f2937"
        transparent
        opacity={0.4}
      />
    </mesh>
  );
}

// Soft ambient glow
function AmbientGlow() {
  const glowRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.elapsedTime * 0.05;
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.03 + Math.sin(time) * 0.01;
    }
  });
  
  return (
    <mesh ref={glowRef} position={[8, -5, -8]}>
      <circleGeometry args={[8, 32]} />
      <meshBasicMaterial 
        color="#374151"
        transparent
        opacity={0.03}
      />
    </mesh>
  );
}

// Minimal grid
function MinimalGrid() {
  const gridRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.elapsedTime * 0.02;
    if (gridRef.current) {
      gridRef.current.position.y = Math.sin(time) * 0.5;
    }
  });
  
  return (
    <gridHelper 
      ref={gridRef}
      args={[50, 50, '#252b36', '#1a1f2a']} 
      position={[0, -8, -10]}
    />
  );
}

export default function DashboardBackground() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      pointerEvents: 'none',
    }}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 50 }}
        dpr={[1, 1]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        {/* Minimal gradient */}
        <GradientMesh />
        
        {/* Very subtle particles */}
        <AmbientParticles count={30} />
        
        {/* Ambient glow */}
        <AmbientGlow />
        
        {/* Minimal grid */}
        <MinimalGrid />
      </Canvas>
    </div>
  );
}

