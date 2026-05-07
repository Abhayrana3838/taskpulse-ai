import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Orb() {
  const ref = useRef();
  const mat = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.y = t * 0.15;
      ref.current.rotation.z = Math.sin(t * 0.2) * 0.1;
      ref.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.06);
    }
    if (mat.current) {
      mat.current.emissiveIntensity = 0.3 + Math.sin(t * 0.8) * 0.15;
    }
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[2.2, 4]} />
      <meshStandardMaterial ref={mat} color="#0070f3" emissive="#6807ba" emissiveIntensity={0.3} wireframe transparent opacity={0.25} />
    </mesh>
  );
}

function FloatingRings() {
  const ref1 = useRef(), ref2 = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref1.current) { ref1.current.rotation.x = t * 0.2; ref1.current.rotation.y = t * 0.1; }
    if (ref2.current) { ref2.current.rotation.x = -t * 0.15; ref2.current.rotation.z = t * 0.12; }
  });
  return (
    <>
      <mesh ref={ref1}>
        <torusGeometry args={[3, 0.015, 16, 100]} />
        <meshBasicMaterial color="#aec6ff" transparent opacity={0.15} />
      </mesh>
      <mesh ref={ref2}>
        <torusGeometry args={[3.5, 0.01, 16, 100]} />
        <meshBasicMaterial color="#dbb8ff" transparent opacity={0.1} />
      </mesh>
    </>
  );
}

export default function LoginOrb() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.15} />
        <pointLight position={[5, 5, 5]} color="#0070f3" intensity={0.5} />
        <pointLight position={[-5, -5, 3]} color="#6807ba" intensity={0.3} />
        <Orb />
        <FloatingRings />
      </Canvas>
    </div>
  );
}
