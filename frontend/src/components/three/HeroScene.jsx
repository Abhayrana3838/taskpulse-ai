import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Animated floating particles with trails
function ParticleField({ count = 1500 }) {
  const mesh = useRef();
  const mouseRef = useRef({ x: 0, y: 0 });
  
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Create spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 5;
      
      pos[i3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = r * Math.cos(phi);
      
      vel[i3] = (Math.random() - 0.5) * 0.01;
      vel[i3 + 1] = (Math.random() - 0.5) * 0.01;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    return [pos, vel];
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.elapsedTime;
    const positionAttribute = mesh.current.geometry.attributes.position;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Orbital motion
      const x = positionAttribute.array[i3];
      const y = positionAttribute.array[i3 + 1];
      const z = positionAttribute.array[i3 + 2];
      
      // Rotate around center
      const rotSpeed = 0.0005 + (i % 10) * 0.0001;
      const cos = Math.cos(rotSpeed);
      const sin = Math.sin(rotSpeed);
      
      positionAttribute.array[i3] = x * cos - z * sin;
      positionAttribute.array[i3 + 2] = x * sin + z * cos;
      
      // Floating motion
      positionAttribute.array[i3 + 1] += Math.sin(time * 0.5 + i * 0.1) * 0.002;
    }
    
    positionAttribute.needsUpdate = true;
    mesh.current.rotation.y = time * 0.02;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        size={0.04} 
        color="#00d4ff" 
        transparent 
        opacity={0.8} 
        sizeAttenuation 
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Glowing core sphere with pulse effect
function CoreSphere() {
  const meshRef = useRef();
  const lightRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (meshRef.current) {
      // Breathing animation
      const scale = 1 + Math.sin(time * 1.5) * 0.15;
      meshRef.current.scale.setScalar(scale);
    }
    if (lightRef.current) {
      // Pulsing light intensity
      lightRef.current.intensity = 2 + Math.sin(time * 2) * 0.5;
    }
  });

  return (
    <group>
      {/* Core glow */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshBasicMaterial 
          color="#0070f3" 
          transparent 
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Wireframe overlay */}
      <mesh>
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshBasicMaterial 
          color="#00d4ff" 
          transparent 
          opacity={0.3}
          wireframe
        />
      </mesh>
      
      {/* Point light for glow effect */}
      <pointLight ref={lightRef} color="#0070f3" intensity={2} distance={10} />
    </group>
  );
}

// Rotating orbital rings
function OrbitalRings() {
  const ring1 = useRef();
  const ring2 = useRef();
  const ring3 = useRef();

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (ring1.current) {
      ring1.current.rotation.x = time * 0.3;
      ring1.current.rotation.y = time * 0.2;
    }
    if (ring2.current) {
      ring2.current.rotation.x = -time * 0.25;
      ring2.current.rotation.z = time * 0.15;
    }
    if (ring3.current) {
      ring3.current.rotation.y = -time * 0.35;
      ring3.current.rotation.z = -time * 0.1;
    }
  });

  return (
    <group>
      {/* Ring 1 */}
      <mesh ref={ring1}>
        <torusGeometry args={[3.5, 0.02, 16, 100]} />
        <meshBasicMaterial color="#0070f3" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </mesh>
      
      {/* Ring 2 */}
      <mesh ref={ring2}>
        <torusGeometry args={[4.2, 0.015, 16, 100]} />
        <meshBasicMaterial color="#6807ba" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
      </mesh>
      
      {/* Ring 3 */}
      <mesh ref={ring3}>
        <torusGeometry args={[5, 0.01, 16, 100]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

// Floating geometric shapes
function FloatingShapes() {
  const shapes = useRef([]);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    shapes.current.forEach((shape, i) => {
      if (shape) {
        shape.rotation.x = time * (0.2 + i * 0.1);
        shape.rotation.y = time * (0.3 + i * 0.05);
        shape.position.y = Math.sin(time * 0.8 + i * 2) * 0.5;
      }
    });
  });

  return (
    <group>
      {/* Floating cube */}
      <mesh ref={el => shapes.current[0] = el} position={[4, 1, -2]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.6} wireframe />
      </mesh>
      
      {/* Floating octahedron */}
      <mesh ref={el => shapes.current[1] = el} position={[-4, -1, 1]}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshBasicMaterial color="#0070f3" transparent opacity={0.5} />
      </mesh>
      
      {/* Floating tetrahedron */}
      <mesh ref={el => shapes.current[2] = el} position={[3, -2, 2]}>
        <tetrahedronGeometry args={[0.25, 0]} />
        <meshBasicMaterial color="#6807ba" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// Mouse interaction camera
function InteractiveCamera() {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });
  
  useState(() => {
    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  });
  
  useFrame(() => {
    // Smooth camera follow
    camera.position.x += (mouseRef.current.x * 0.5 - camera.position.x) * 0.02;
    camera.position.y += (mouseRef.current.y * 0.3 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });
  
  return null;
}

export default function HeroScene() {
  return (
    <div style={{ 
      position: 'absolute', 
      inset: 0, 
      zIndex: 0, 
      pointerEvents: 'none',
      background: 'radial-gradient(ellipse at center, rgba(0,112,243,0.1) 0%, transparent 70%)'
    }}>
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 60 }} 
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        {/* Ambient lighting */}
        <ambientLight intensity={0.3} color="#0070f3" />
        
        {/* Directional lights for drama */}
        <directionalLight position={[5, 5, 5]} intensity={0.5} color="#00d4ff" />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} color="#6807ba" />
        
        {/* Interactive camera */}
        <InteractiveCamera />
        
        {/* Particle field */}
        <ParticleField count={1500} />
        
        {/* Core glowing sphere */}
        <CoreSphere />
        
        {/* Orbital rings */}
        <OrbitalRings />
        
        {/* Floating geometric shapes */}
        <FloatingShapes />
      </Canvas>
    </div>
  );
}

