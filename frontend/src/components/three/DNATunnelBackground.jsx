import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// DNA Double Helix Tunnel Shader
const dnaTunnelShader = {
  uniforms: {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uScroll;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    varying vec2 vUv;
    
    #define PI 3.14159265359
    
    // Random function
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    // Noise function
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    // Fractal Brownian Motion
    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      for(int i = 0; i < 5; i++) {
        value += amplitude * noise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
      }
      return value;
    }
    
    void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      uv.x *= uResolution.x / uResolution.y;
      
      float t = uTime * 0.5;
      float scroll = uScroll;
      
      // Convert to polar coordinates
      float r = length(uv);
      float angle = atan(uv.y, uv.x);
      
      vec3 color = vec3(0.0);
      
      // === SCENE 1: DNA Double Helix Tunnel (0-15% scroll) ===
      float scene1 = smoothstep(0.0, 0.15, scroll) * smoothstep(0.25, 0.15, scroll);
      if(scene1 > 0.0) {
        float depth = 1.0 / (r + 0.1);
        
        // DNA Double Helix - Two intertwined sine waves offset by PI
        float helix1 = sin(angle * 3.0 + depth * 30.0 - t * 4.0);
        float helix2 = sin(angle * 3.0 + depth * 30.0 - t * 4.0 + PI);
        
        // Exponential glow for neon effect
        float helixGlow = exp(-abs(helix1) * 8.0) + exp(-abs(helix2) * 8.0);
        
        // Rotating Tunnel Rings
        float ring = sin(depth * 20.0 - t * 3.0) * 0.5 + 0.5;
        
        // FBM Warp Distortion
        vec2 p = uv * 2.0;
        vec2 warp = vec2(fbm(p + t * 0.1), fbm(p + vec2(1.7, 9.2) + t * 0.12));
        float distort = fbm(p + 2.0 * warp + t * 0.05) * 0.15;
        
        // Combine effects
        vec3 helixColor = vec3(0.0, 0.82, 1.0) * helixGlow * depth;
        vec3 ringColor = vec3(0.0, 0.44, 0.95) * ring * 0.5;
        
        color += (helixColor + ringColor) * scene1;
      }
      
      // === SCENE 2: Neural Network Lattice (15-35% scroll) ===
      float scene2 = smoothstep(0.15, 0.25, scroll) * smoothstep(0.45, 0.35, scroll);
      if(scene2 > 0.0) {
        // Animated grid nodes
        vec2 grid = fract(uv * 4.0 - t * 0.2);
        float nodes = 1.0 - smoothstep(0.0, 0.1, length(grid - 0.5));
        
        // Connection lines with data pulses
        float connections = 0.0;
        for(float i = 0.0; i < 4.0; i++) {
          vec2 offset = vec2(sin(t + i), cos(t + i * 0.7)) * 0.5;
          float line = 1.0 - smoothstep(0.0, 0.02, abs(uv.y - uv.x + offset.y - offset.x));
          connections += line * 0.3;
        }
        
        // Node glow effects
        float glow = exp(-length(uv) * 2.0) * 0.5;
        
        vec3 neuralColor = vec3(0.27, 0.94, 0.52) * (nodes + connections + glow);
        color += neuralColor * scene2;
      }
      
      // === SCENE 3: Black Hole Singularity (35-55% scroll) ===
      float scene3 = smoothstep(0.35, 0.45, scroll) * smoothstep(0.65, 0.55, scroll);
      if(scene3 > 0.0) {
        float dist = length(uv);
        
        // Gravitational lensing
        float lens = 1.0 / (dist * 10.0 + 0.1);
        
        // Accretion disk with rotation
        float disk = sin(atan(uv.y, uv.x) * 2.0 - t * 2.0) * exp(-dist * 3.0);
        
        // Photon ring
        float photonRing = exp(-pow(dist - 0.5, 2.0) * 100.0);
        
        // Relativistic beaming
        float beaming = smoothstep(0.3, 0.0, dist) * 0.8;
        
        vec3 blackHoleColor = vec3(1.0, 0.3, 0.1) * disk;
        blackHoleColor += vec3(1.0, 0.8, 0.4) * photonRing;
        blackHoleColor += vec3(0.8, 0.2, 0.0) * beaming;
        
        color += blackHoleColor * scene3;
      }
      
      // === SCENE 4: Data Ocean Waves (55-75% scroll) ===
      float scene4 = smoothstep(0.55, 0.65, scroll) * smoothstep(0.85, 0.75, scroll);
      if(scene4 > 0.0) {
        // Layered wave FBM
        float wave1 = sin(uv.x * 5.0 + t * 2.0) * 0.3;
        float wave2 = sin(uv.x * 8.0 - t * 3.0 + uv.y * 2.0) * 0.2;
        float wave3 = fbm(uv * 3.0 + t * 0.5) * 0.4;
        
        float waves = wave1 + wave2 + wave3;
        
        // Surface normal lighting
        float lighting = smoothstep(-0.5, 0.5, waves) * 0.5 + 0.5;
        
        // Specular highlights
        float spec = pow(max(0.0, waves), 3.0) * 0.8;
        
        vec3 oceanColor = vec3(0.0, 0.5, 1.0) * lighting;
        oceanColor += vec3(0.5, 0.8, 1.0) * spec;
        
        color += oceanColor * scene4;
      }
      
      // === SCENE 5: Quantum Field (75-100% scroll) ===
      float scene5 = smoothstep(0.75, 0.85, scroll);
      if(scene5 > 0.0) {
        // Probability wave interference
        float interference = sin(length(uv) * 10.0 - t * 3.0) * 
                            sin(length(uv + vec2(0.5)) * 8.0 + t * 2.0);
        
        // Particle probability clouds
        float particles = fbm(uv * 5.0 + t * 0.3);
        
        // Entanglement connections
        float entanglement = sin(uv.x * 20.0 + t) * sin(uv.y * 20.0 + t) * 0.5 + 0.5;
        
        vec3 quantumColor = vec3(0.6, 0.0, 1.0) * interference * 0.5;
        quantumColor += vec3(1.0, 0.0, 0.8) * particles * 0.3;
        quantumColor += vec3(0.4, 0.0, 0.6) * entanglement * 0.2;
        
        color += quantumColor * scene5;
      }
      
      // Vignette
      float vignette = 1.0 - smoothstep(0.5, 1.5, r);
      color *= vignette;
      
      // Tone mapping
      color = color / (1.0 + color);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
};

// Full screen shader plane
function ShaderPlane() {
  const meshRef = useRef();
  const scrollRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) }
  }), []);
  
  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = window.scrollY / maxScroll;
    };
    
    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = 1.0 - e.clientY / window.innerHeight;
    };
    
    const handleResize = () => {
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [uniforms]);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
      meshRef.current.material.uniforms.uScroll.value = scrollRef.current;
      meshRef.current.material.uniforms.uMouse.value.set(
        mouseRef.current.x,
        mouseRef.current.y
      );
    }
  });
  
  return (
    <mesh ref={meshRef} scale={[2, 2, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={dnaTunnelShader.vertexShader}
        fragmentShader={dnaTunnelShader.fragmentShader}
        transparent={true}
      />
    </mesh>
  );
}

export default function DNATunnelBackground() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      pointerEvents: 'none'
    }}>
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <ShaderPlane />
      </Canvas>
    </div>
  );
}
