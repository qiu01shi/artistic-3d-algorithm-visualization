import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';

/* ---------------- Text label rendered to a canvas sprite --------------- */
const texCache = new Map<string, { tex: THREE.CanvasTexture; aspect: number }>();

function makeTexture(text: string, color: string, font: string, weight: string) {
  const key = `${text}|${color}|${font}|${weight}`;
  const cached = texCache.get(key);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const fontSpec = `${weight} 96px ${font}`;
  ctx.font = fontSpec;
  const w = Math.ceil(ctx.measureText(text).width) + 48;
  const h = 128;
  canvas.width = w;
  canvas.height = h;
  ctx.font = fontSpec;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.fillStyle = color;
  ctx.fillText(text, w / 2, h / 2 + 4);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  const entry = { tex, aspect: w / h };
  texCache.set(key, entry);
  return entry;
}

export function Label({
  text,
  position = [0, 0, 0],
  size = 0.5,
  color = '#ffffff',
  font = 'Georgia, "Times New Roman", serif',
  weight = 'normal',
  opacity = 1,
}: {
  text: string;
  position?: [number, number, number];
  size?: number;
  color?: string;
  font?: string;
  weight?: string;
  opacity?: number;
}) {
  const { tex, aspect } = useMemo(() => makeTexture(text, color, font, weight), [text, color, font, weight]);
  return (
    <sprite position={position} scale={[size * aspect, size, 1]}>
      <spriteMaterial map={tex} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </sprite>
  );
}

export function MonoLabel(props: Parameters<typeof Label>[0]) {
  return <Label font='"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace' weight="bold" {...props} />;
}

/* ---------------- Smoothly interpolated transform group ---------------- */
export function Smooth({
  position = [0, 0, 0],
  scale = 1,
  rotation,
  speed = 6,
  children,
  visible = true,
}: {
  position?: [number, number, number];
  scale?: number | [number, number, number];
  rotation?: [number, number, number];
  speed?: number;
  children: ReactNode;
  visible?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const target = useMemo(() => new THREE.Vector3(), []);
  const tScale = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const k = 1 - Math.exp(-speed * dt);
    target.set(...position);
    g.position.lerp(target, k);
    const s = typeof scale === 'number' ? [scale, scale, scale] : scale;
    tScale.set(s[0], visible ? s[1] : 0.0001, s[2]);
    if (!visible) tScale.set(0.0001, 0.0001, 0.0001);
    g.scale.lerp(tScale, k);
    if (rotation) {
      g.rotation.x += (rotation[0] - g.rotation.x) * k;
      g.rotation.y += (rotation[1] - g.rotation.y) * k;
      g.rotation.z += (rotation[2] - g.rotation.z) * k;
    }
  });
  return <group ref={ref}>{children}</group>;
}

/* ---------------- Glowing material that eases between colours ---------- */
export function GlowMaterial({
  color,
  emissive = color,
  intensity = 0.2,
  opacity = 1,
  roughness = 0.25,
  metalness = 0.1,
  speed = 6,
}: {
  color: string;
  emissive?: string;
  intensity?: number;
  opacity?: number;
  roughness?: number;
  metalness?: number;
  speed?: number;
}) {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  const c = useMemo(() => new THREE.Color(), []);
  const e = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    const k = 1 - Math.exp(-speed * dt);
    c.set(color);
    e.set(emissive);
    m.color.lerp(c, k);
    m.emissive.lerp(e, k);
    m.emissiveIntensity += (intensity - m.emissiveIntensity) * k;
    m.opacity += (opacity - m.opacity) * k;
  });
  return (
    <meshStandardMaterial
      ref={ref}
      color={color}
      emissive={emissive}
      emissiveIntensity={intensity}
      transparent
      opacity={opacity}
      roughness={roughness}
      metalness={metalness}
    />
  );
}

/* ---------------- Crystal: a bevelled glowing block --------------------- */
export function Crystal({
  size = [1, 1, 1],
  color,
  intensity = 0.15,
  opacity = 1,
  shape = 'box',
}: {
  size?: [number, number, number];
  color: string;
  intensity?: number;
  opacity?: number;
  shape?: 'box' | 'octa' | 'ico' | 'sphere' | 'cylinder';
}) {
  return (
    <mesh castShadow>
      {shape === 'box' && <boxGeometry args={size} />}
      {shape === 'octa' && <octahedronGeometry args={[size[0], 0]} />}
      {shape === 'ico' && <icosahedronGeometry args={[size[0], 0]} />}
      {shape === 'sphere' && <sphereGeometry args={[size[0], 32, 32]} />}
      {shape === 'cylinder' && <cylinderGeometry args={[size[0], size[0], size[1], 32]} />}
      <GlowMaterial color={color} intensity={intensity} opacity={opacity} />
    </mesh>
  );
}

/* ---------------- Curved beam between two points ------------------------ */
export function Beam({
  from,
  to,
  color,
  lift = 1.2,
  radius = 0.035,
  intensity = 2.5,
  opacity = 1,
}: {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
  lift?: number;
  radius?: number;
  intensity?: number;
  opacity?: number;
}) {
  const geo = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mid.y += lift;
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    return new THREE.TubeGeometry(curve, 32, radius, 8, false);
  }, [from[0], from[1], from[2], to[0], to[1], to[2], lift, radius]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} transparent opacity={opacity} toneMapped={false} />
    </mesh>
  );
}

/* ---------------- Arrow (straight, with cone head) ---------------------- */
export function Arrow({
  from,
  to,
  color,
  intensity = 1.5,
  radius = 0.04,
}: {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
  intensity?: number;
  radius?: number;
}) {
  const { pos, quat, len } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    const pos = a.clone().add(b).multiplyScalar(0.5);
    return { pos, quat, len };
  }, [from[0], from[1], from[2], to[0], to[1], to[2]]);
  const headLen = 0.28;
  return (
    <group position={pos} quaternion={quat}>
      <mesh position={[0, -headLen / 2, 0]}>
        <cylinderGeometry args={[radius, radius, Math.max(len - headLen, 0.01), 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} />
      </mesh>
      <mesh position={[0, len / 2 - headLen / 2, 0]}>
        <coneGeometry args={[radius * 3, headLen, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ---------------- Floating marker (pointer above an element) ----------- */
export function Pointer({
  position,
  label,
  color,
  visible = true,
  height = 1.6,
}: {
  position: [number, number, number];
  label: string;
  color: string;
  visible?: boolean;
  height?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * 3) * 0.08;
  });
  return (
    <Smooth position={[position[0], position[1] + height, position[2]]} visible={visible} speed={8}>
      <group ref={ref}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.18, 0.4, 4]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.2} toneMapped={false} />
        </mesh>
        <MonoLabel text={label} position={[0, 0.55, 0]} size={0.42} color={color} />
      </group>
    </Smooth>
  );
}

/* ---------------- Ring of light on the floor ---------------------------- */
export function Halo({ position, color, radius = 0.8, intensity = 2 }: { position: [number, number, number]; color: string; radius?: number; intensity?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 2.5) * 0.08;
      ref.current.scale.set(s, s, s);
    }
  });
  return (
    <mesh ref={ref} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 0.8, radius, 48]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} transparent opacity={0.85} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  );
}
