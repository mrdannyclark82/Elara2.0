import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Line, Text } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

interface ARHologramProps {
  isActive?: boolean;
  onClose?: () => void;
}

// Desk Grid Anchor - Cyberpunk style grid
const DeskGrid: React.FC = () => {
  const gridRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (gridRef.current) {
      const t = state.clock.getElapsedTime();
      // Subtle pulse animation
      gridRef.current.position.y = Math.sin(t * 0.5) * 0.02;
    }
  });

  const gridSize = 10;
  const divisions = 20;
  const gridColor = new THREE.Color('#00ffff');

  return (
    <group ref={gridRef} position={[0, -2, 0]}>
      {/* Main grid plane */}
      <gridHelper args={[gridSize, divisions, gridColor, gridColor]} />
      
      {/* Corner markers */}
      {[-gridSize / 2, gridSize / 2].map((x, i) =>
        [-gridSize / 2, gridSize / 2].map((z, j) => (
          <Box
            key={`marker-${i}-${j}`}
            args={[0.1, 0.3, 0.1]}
            position={[x, 0.15, z]}
          >
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={2}
              transparent
              opacity={0.8}
            />
          </Box>
        ))
      )}

      {/* Center anchor circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={3}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// Holographic Avatar - Wireframe style with glitch effects
const HolographicAvatar: React.FC<{ isSpeaking?: boolean }> = ({ isSpeaking = false }) => {
  const avatarRef = useRef<THREE.Group>(null);
  const [glitchPhase, setGlitchPhase] = useState(0);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (avatarRef.current) {
      // Floating animation
      avatarRef.current.position.y = Math.sin(t * 0.8) * 0.15;
      
      // Slow rotation
      avatarRef.current.rotation.y = t * 0.2;

      // Glitch effect - random position shifts
      if (Math.random() > 0.98) {
        setGlitchPhase(Math.random());
      }
    }
  });

  const glitchOffset = useMemo(() => {
    return {
      x: (Math.random() - 0.5) * 0.05 * glitchPhase,
      y: (Math.random() - 0.5) * 0.05 * glitchPhase,
      z: (Math.random() - 0.5) * 0.05 * glitchPhase,
    };
  }, [glitchPhase]);

  return (
    <group ref={avatarRef} position={[glitchOffset.x, glitchOffset.y, glitchOffset.z]}>
      {/* Main head sphere - wireframe */}
      <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={2}
          wireframe
          transparent
          opacity={0.7}
        />
      </Sphere>

      {/* Inner glow sphere */}
      <Sphere args={[0.9, 16, 16]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={1.5}
          transparent
          opacity={0.3}
        />
      </Sphere>

      {/* Orbiting rings */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={`ring-${i}`}
          rotation={[Math.PI / 2 + (i * Math.PI) / 6, 0, (i * Math.PI) / 3]}
        >
          <torusGeometry args={[1.2 + i * 0.2, 0.02, 16, 100]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* Vertical scan lines effect */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Line
          key={`scanline-${i}`}
          points={[
            [Math.cos((i / 8) * Math.PI * 2) * 1.5, -1.5, Math.sin((i / 8) * Math.PI * 2) * 1.5],
            [Math.cos((i / 8) * Math.PI * 2) * 1.5, 1.5, Math.sin((i / 8) * Math.PI * 2) * 1.5],
          ]}
          color="#00ffff"
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      ))}

      {/* Eyes */}
      <Sphere args={[0.15, 16, 16]} position={[-0.3, 0.2, 0.8]}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#00ffff"
          emissiveIntensity={3}
        />
      </Sphere>
      <Sphere args={[0.15, 16, 16]} position={[0.3, 0.2, 0.8]}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#00ffff"
          emissiveIntensity={3}
        />
      </Sphere>

      {/* Dynamic lighting */}
      <pointLight position={[0, 0, 2]} intensity={2} color="#00ffff" distance={5} />
      <pointLight position={[0, 2, 0]} intensity={1.5} color="#ff00ff" distance={5} />
    </group>
  );
};

// Floating UI Widget
const FloatingWidget: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
  label: string;
  value: string;
  color?: string;
}> = ({ position, rotation = [0, 0, 0], label, value, color = '#00ffff' }) => {
  const widgetRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (widgetRef.current) {
      widgetRef.current.position.y = position[1] + Math.sin(t * 0.5 + position[0]) * 0.1;
    }
  });

  return (
    <group ref={widgetRef} position={position} rotation={rotation}>
      {/* Widget background panel */}
      <Box args={[1.5, 0.8, 0.05]}>
        <meshStandardMaterial
          color="#000000"
          emissive={color}
          emissiveIntensity={0.2}
          transparent
          opacity={0.3}
        />
      </Box>

      {/* Border frame */}
      <Line
        points={[
          [-0.75, 0.4, 0.03],
          [0.75, 0.4, 0.03],
          [0.75, -0.4, 0.03],
          [-0.75, -0.4, 0.03],
          [-0.75, 0.4, 0.03],
        ]}
        color={color}
        lineWidth={2}
      />

      {/* Label text */}
      <Text
        position={[0, 0.15, 0.03]}
        fontSize={0.12}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {/* Value text */}
      <Text
        position={[0, -0.15, 0.03]}
        fontSize={0.18}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {value}
      </Text>

      {/* Corner accents */}
      {[
        [-0.75, 0.4],
        [0.75, 0.4],
        [0.75, -0.4],
        [-0.75, -0.4],
      ].map((corner, i) => (
        <Box
          key={`corner-${i}`}
          args={[0.05, 0.05, 0.05]}
          position={[corner[0], corner[1], 0.03]}
        >
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
          />
        </Box>
      ))}
    </group>
  );
};

// Main AR Hologram Scene
const ARHologramScene: React.FC = () => {
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.2} color="#1a1a2e" />

      {/* Main colored lights */}
      <pointLight position={[-5, 5, -5]} intensity={1} color="#00ffff" />
      <pointLight position={[5, 5, 5]} intensity={1} color="#ff00ff" />
      <spotLight position={[0, 10, 0]} intensity={0.5} color="#00ffff" angle={0.3} penumbra={1} />

      {/* Grid anchor */}
      <DeskGrid />

      {/* Holographic avatar */}
      <HolographicAvatar />

      {/* Floating UI widgets */}
      <FloatingWidget
        position={[-3, 0.5, 1]}
        rotation={[0, Math.PI / 6, 0]}
        label="STATUS"
        value="ACTIVE"
        color="#00ffff"
      />
      <FloatingWidget
        position={[3, 1, 0]}
        rotation={[0, -Math.PI / 6, 0]}
        label="NEURAL LINK"
        value="98%"
        color="#ff00ff"
      />
      <FloatingWidget
        position={[0, 2.5, -2]}
        rotation={[Math.PI / 12, 0, 0]}
        label="SYSTEMS"
        value="ONLINE"
        color="#00ff88"
      />
      <FloatingWidget
        position={[-2.5, -0.5, -1]}
        rotation={[0, Math.PI / 4, 0]}
        label="PROTOCOL"
        value="AR-3.0"
        color="#ff0088"
      />

      {/* Orbit controls for interaction */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
};

// Main AR Hologram Component
const ARHologram: React.FC<ARHologramProps> = ({ isActive = true, onClose }) => {
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 rounded-lg border border-cyan-500/50 backdrop-blur-sm transition-all"
        >
          <i className="fas fa-times mr-2"></i>
          Exit AR Mode
        </button>
      )}

      {/* Title overlay */}
      <div className="absolute top-4 left-4 z-50 text-cyan-400 font-mono">
        <div className="text-2xl font-bold tracking-wider mb-1">ELARA AR HOLOGRAM</div>
        <div className="text-xs tracking-widest opacity-70">
          AUGMENTED REALITY INTERFACE v3.0
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-50 text-cyan-400/60 font-mono text-xs">
        <div>LEFT CLICK + DRAG: Rotate</div>
        <div>RIGHT CLICK + DRAG: Pan</div>
        <div>SCROLL: Zoom</div>
      </div>

      {/* Canvas with postprocessing effects */}
      <Canvas
        camera={{
          position: [0, 2, 8],
          fov: 50,
        }}
        gl={{
          antialias: true,
          alpha: false,
        }}
      >
        {/* Scene content */}
        <ARHologramScene />

        {/* Post-processing effects */}
        <EffectComposer>
          {/* Bloom effect for neon glow */}
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            intensity={1.5}
            radius={0.85}
          />
          {/* Noise for holographic grain */}
          <Noise opacity={0.05} />
          {/* Vignette for focus */}
          <Vignette eskil={false} offset={0.1} darkness={0.5} />
        </EffectComposer>
      </Canvas>

      {/* Scanline overlay effect */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)',
        }}
      />
    </div>
  );
};

export default ARHologram;
