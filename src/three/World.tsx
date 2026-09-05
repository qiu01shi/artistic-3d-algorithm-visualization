import { Sparkles, Stars, OrbitControls, MeshReflectorMaterial } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export interface View {
  position: [number, number, number];
  target: [number, number, number];
}

export function CameraRig({ view, autoRotate = false }: { view: View; autoRotate?: boolean }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const pos = useMemo(() => new THREE.Vector3(), []);
  const tgt = useMemo(() => new THREE.Vector3(), []);
  const last = useRef<string>('');
  const anim = useRef(0); // remaining animation seconds

  useFrame((_, dt) => {
    const key = view.position.join(',') + view.target.join(',');
    if (key !== last.current) {
      last.current = key;
      anim.current = 2.2;
    }
    if (anim.current > 0 && controls.current) {
      anim.current -= dt;
      const k = 1 - Math.exp(-3 * dt);
      pos.set(...view.position);
      tgt.set(...view.target);
      camera.position.lerp(pos, k);
      controls.current.target.lerp(tgt, k);
      controls.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controls}
      enableDamping
      dampingFactor={0.06}
      autoRotate={autoRotate}
      autoRotateSpeed={0.5}
      maxPolarAngle={Math.PI / 2.05}
      minDistance={4}
      maxDistance={45}
      enablePan={false}
    />
  );
}

function Floor({ accent }: { accent: string }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[40, 96]} />
        <MeshReflectorMaterial
          blur={[400, 120]}
          resolution={768}
          mixBlur={1}
          mixStrength={14}
          roughness={0.9}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0b0a1c"
          metalness={0.6}
          mirror={0.35}
        />
      </mesh>
      {/* soft accent rings on the ground */}
      {[6, 10, 14].map((r, i) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <ringGeometry args={[r - 0.02, r, 128]} />
          <meshBasicMaterial color={accent} transparent opacity={0.18 - i * 0.05} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function DriftingMotes({ color }: { color: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.02;
  });
  return (
    <group ref={ref}>
      <Sparkles count={160} scale={[36, 14, 36]} position={[0, 6, 0]} size={3} speed={0.25} color={color} opacity={0.6} />
      <Sparkles count={60} scale={[14, 6, 14]} position={[0, 3, 0]} size={6} speed={0.4} color="#ffffff" opacity={0.35} />
    </group>
  );
}

export function World({ accent, children }: { accent: string; children: ReactNode }) {
  return (
    <>
      <color attach="background" args={['#07061a']} />
      <fog attach="fog" args={['#07061a', 22, 60]} />
      <ambientLight intensity={0.35} />
      <hemisphereLight args={['#8aa4ff', '#2a1040', 0.5]} />
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
      />
      <pointLight position={[-10, 6, -8]} intensity={40} color={accent} distance={40} />
      <pointLight position={[10, 4, 8]} intensity={20} color="#7c5cff" distance={40} />
      <Stars radius={80} depth={40} count={2500} factor={3} saturation={0.6} fade speed={0.6} />
      <DriftingMotes color={accent} />
      <Floor accent={accent} />
      {children}
      <EffectComposer multisampling={4}>
        <Bloom luminanceThreshold={0.85} mipmapBlur intensity={1.1} radius={0.6} />
        <Vignette eskil={false} offset={0.2} darkness={0.85} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </>
  );
}
