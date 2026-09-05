import { Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import type { AlgorithmMeta } from '../lib/types';
import { GlowMaterial, Label, MonoLabel } from './primitives';

const SHAPES = ['octa', 'ico', 'box', 'sphere', 'octa', 'ico', 'box', 'sphere'] as const;

function Monolith({
  meta,
  index,
  total,
  onSelect,
}: {
  meta: AlgorithmMeta;
  index: number;
  total: number;
  onSelect: (id: string) => void;
}) {
  const [hover, setHover] = useState(false);
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const radius = 8.5;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * (hover ? 1.4 : 0.35);
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.6 + index) * 0.15;
  });
  const shape = SHAPES[index % SHAPES.length];
  return (
    <group position={[x, 0, z]}>
      {/* pedestal */}
      <mesh position={[0, 0.25, 0]} receiveShadow>
        <cylinderGeometry args={[1.3, 1.6, 0.5, 6]} />
        <meshStandardMaterial color="#14122f" emissive={meta.color} emissiveIntensity={hover ? 0.5 : 0.12} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.2, 6]} />
        <meshBasicMaterial color={meta.color} transparent opacity={hover ? 0.9 : 0.4} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <Float speed={2} floatIntensity={0.6} rotationIntensity={0}>
        <mesh
          ref={ref}
          position={[0, 2.4, 0]}
          castShadow
          onPointerOver={(e) => {
            e.stopPropagation();
            setHover(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHover(false);
            document.body.style.cursor = 'auto';
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(meta.id);
          }}
        >
          {shape === 'octa' && <octahedronGeometry args={[1, 0]} />}
          {shape === 'ico' && <icosahedronGeometry args={[0.95, 0]} />}
          {shape === 'box' && <boxGeometry args={[1.3, 1.3, 1.3]} />}
          {shape === 'sphere' && <sphereGeometry args={[0.95, 32, 32]} />}
          <GlowMaterial color={meta.color} intensity={hover ? 2.2 : 0.7} roughness={0.15} metalness={0.2} />
        </mesh>
      </Float>
      {hover && <pointLight position={[0, 2.4, 0]} intensity={20} distance={6} color={meta.color} />}
      <Label text={meta.title} position={[0, 4.4, 0]} size={hover ? 0.6 : 0.5} color={hover ? '#ffffff' : meta.color} />
      <MonoLabel text={`#${meta.number}`} position={[0, 5.1, 0]} size={0.32} color="#8f8fc9" />
    </group>
  );
}

function CoreOrb() {
  const ref = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.2;
      const s = 1 + Math.sin(clock.elapsedTime * 1.3) * 0.05;
      ref.current.scale.setScalar(s);
    }
    if (ring.current) {
      ring.current.rotation.z += dt * 0.25;
      ring.current.rotation.x = Math.PI / 2.4 + Math.sin(clock.elapsedTime * 0.4) * 0.2;
    }
  });
  return (
    <group position={[0, 3.2, 0]}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshStandardMaterial color="#c7d2fe" emissive="#7c5cff" emissiveIntensity={1.4} wireframe toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.5} toneMapped={false} />
      </mesh>
      <mesh ref={ring}>
        <torusGeometry args={[2.6, 0.03, 8, 96]} />
        <meshStandardMaterial color="#f9a8d4" emissive="#f9a8d4" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <pointLight intensity={60} distance={16} color="#a78bfa" />
    </group>
  );
}

export function Hub({ items, onSelect }: { items: AlgorithmMeta[]; onSelect: (id: string) => void }) {
  return (
    <group>
      <CoreOrb />
      {items.map((m, i) => (
        <Monolith key={m.id} meta={m} index={i} total={items.length} onSelect={onSelect} />
      ))}
    </group>
  );
}
