import { Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import type { BinarySearchState, SortState, StairsState, TwoSumState } from '../../lib/algorithms';
import { Beam, Crystal, GlowMaterial, Halo, Label, MonoLabel, Pointer, Smooth } from '../primitives';

const DIM = '#2b2a55';

/* ============================== TWO SUM ============================== */
export function TwoSumScene({ state }: { state: TwoSumState }) {
  const { nums, target, i, need, seen, hit, found } = state;
  const gap = 1.7;
  const x0 = -((nums.length - 1) * gap) / 2;
  const xOf = (k: number) => x0 + k * gap;
  const accent = '#f9a8d4';

  return (
    <group>
      {/* array crystals */}
      {nums.map((v, k) => {
        const isCur = k === i;
        const isFound = found && (found[0] === k || found[1] === k);
        const isHit = hit === k;
        const inMem = seen.some((s) => s.idx === k);
        const color = isFound ? '#fef08a' : isHit ? '#fda4af' : isCur ? accent : inMem ? '#7c6cf0' : DIM;
        const glow = isFound ? 2.2 : isHit ? 1.8 : isCur ? 1.4 : inMem ? 0.5 : 0.1;
        const y = isFound ? 1.6 : isCur ? 1.15 : 0.7;
        return (
          <group key={k}>
            <Smooth position={[xOf(k), y, 0]} scale={isFound ? 1.25 : 1}>
              <Crystal size={[1.15, 1.15, 1.15]} color={color} intensity={glow} shape={isFound ? 'octa' : 'box'} />
              <MonoLabel text={String(v)} position={[0, 0, 0.62]} size={0.6} color="#ffffff" />
            </Smooth>
            <Label text={`i=${k}`} position={[xOf(k), 0.08, 0.9]} size={0.3} color="#8f8fc9" />
            {(isCur || isFound) && <Halo position={[xOf(k), 0.01, 0]} color={isFound ? '#fef08a' : accent} radius={0.85} />}
          </group>
        );
      })}

      {/* memory shelf (hash map) */}
      <group position={[0, 0, -4.2]}>
        <Label text="seen  { value → index }" position={[0, 2.6, 0]} size={0.42} color="#b7b3ff" />
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[nums.length * gap, 2.4]} />
          <meshStandardMaterial color="#1a1740" emissive="#3a2a80" emissiveIntensity={0.25} transparent opacity={0.6} />
        </mesh>
        {nums.map((v, k) => {
          const entry = seen.find((s) => s.idx === k);
          const on = !!entry;
          const isHit = hit === k;
          return (
            <Smooth key={k} position={[xOf(k), on ? 0.6 : -1, 0]} visible={on} speed={5}>
              <Float speed={2} floatIntensity={0.3} rotationIntensity={0.4}>
                <Crystal size={[0.55, 0.55, 0.55]} color={isHit ? '#fda4af' : '#7c6cf0'} intensity={isHit ? 2 : 0.7} shape="ico" />
              </Float>
              <MonoLabel text={`${v}→${k}`} position={[0, 1.1, 0]} size={0.36} color={isHit ? '#fda4af' : '#c4bfff'} />
            </Smooth>
          );
        })}
      </group>

      {/* need bubble & pointer */}
      {i !== null && <Pointer position={[xOf(i), 1.15, 0]} label="i" color={accent} height={1.5} />}
      {need !== null && i !== null && (
        <Smooth position={[xOf(i), 3.6, 0]}>
          <Label text={`need ${need}`} size={0.55} color="#fde68a" />
        </Smooth>
      )}
      {hit !== null && i !== null && <Beam from={[xOf(i), 1.2, 0]} to={[xOf(hit), 0.6, -4.2]} color="#fda4af" lift={2.2} />}
      {found && <Beam from={[xOf(found[0]), 1.6, 0]} to={[xOf(found[1]), 1.6, 0]} color="#fef08a" lift={1.8} radius={0.05} />}

      {/* target monolith */}
      <group position={[x0 - 2.8, 0, 0]}>
        <Float speed={1.5} floatIntensity={0.5} rotationIntensity={0.2}>
          <mesh position={[0, 1.8, 0]}>
            <octahedronGeometry args={[0.7, 0]} />
            <GlowMaterial color="#fde68a" intensity={found ? 2.5 : 0.9} />
          </mesh>
        </Float>
        <Label text="target" position={[0, 3.2, 0]} size={0.35} color="#fde68a" />
        <MonoLabel text={String(target)} position={[0, 0.6, 0]} size={0.6} color="#fde68a" />
      </group>
    </group>
  );
}

/* ============================ BINARY SEARCH ========================== */
export function BinarySearchScene({ state }: { state: BinarySearchState }) {
  const { nums, target, lo, hi, mid, found, dead } = state;
  const gap = 1.35;
  const x0 = -((nums.length - 1) * gap) / 2;
  const xOf = (k: number) => x0 + k * gap;
  const accent = '#67e8f9';
  return (
    <group>
      {nums.map((v, k) => {
        const h = 0.6 + (v / nums[nums.length - 1]) * 3.2;
        const isMid = mid === k;
        const isFound = found === k;
        const alive = !dead[k];
        const color = isFound ? '#fef08a' : isMid ? accent : alive ? '#4f7bd9' : '#1c1b3a';
        const glow = isFound ? 2.4 : isMid ? 1.6 : alive ? 0.45 : 0;
        return (
          <group key={k}>
            <Smooth position={[xOf(k), alive ? h / 2 : 0.15, 0]} scale={[1, alive ? 1 : 0.3 / h, 1]} speed={4}>
              <mesh castShadow>
                <boxGeometry args={[0.9, h, 0.9]} />
                <GlowMaterial color={color} intensity={glow} opacity={alive ? 1 : 0.35} />
              </mesh>
            </Smooth>
            <Smooth position={[xOf(k), alive ? h + 0.5 : 0.7, 0]} speed={4}>
              <MonoLabel text={String(v)} size={0.45} color={alive ? '#ffffff' : '#4a4880'} />
            </Smooth>
            <Label text={String(k)} position={[xOf(k), 0.08, 0.8]} size={0.26} color="#6f6fa8" />
          </group>
        );
      })}
      {/* range markers */}
      {found === null && (
        <>
          <Pointer position={[xOf(lo), 4.3, 0]} label="lo" color="#a7f3d0" height={0.4} visible={lo <= hi} />
          <Pointer position={[xOf(hi), 4.3, 0]} label="hi" color="#fda4af" height={0.4} visible={lo <= hi} />
        </>
      )}
      {mid !== null && <Pointer position={[xOf(mid), 5.4, 0]} label={found !== null ? 'found' : 'mid'} color={found !== null ? '#fef08a' : accent} height={0.4} />}
      {found !== null && <Halo position={[xOf(found), 0.01, 0]} color="#fef08a" radius={0.9} />}
      {/* active window glow on floor */}
      {lo <= hi && found === null && (
        <Smooth position={[(xOf(lo) + xOf(hi)) / 2, 0.01, 0]} scale={[Math.max(hi - lo, 0) * gap + 1.2, 1, 1]} speed={4}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1, 1.6]} />
            <meshBasicMaterial color={accent} transparent opacity={0.12} toneMapped={false} />
          </mesh>
        </Smooth>
      )}
      <group position={[0, 0, 3.2]}>
        <Label text={`target  ${target}`} position={[0, 0.7, 0]} size={0.55} color="#fef08a" />
      </group>
    </group>
  );
}

/* ============================== BUBBLE SORT ========================== */
export function SortScene({ state }: { state: SortState }) {
  const { arr, a, b, swapping, sortedFrom, done } = state;
  const gap = 1.5;
  const x0 = -((arr.length - 1) * gap) / 2;
  const xOf = (k: number) => x0 + k * gap;
  const maxV = Math.max(...arr);
  return (
    <group>
      {arr.map((v, k) => {
        const h = 0.5 + (v / maxV) * 3.4;
        const active = k === a || k === b;
        const sorted = k >= sortedFrom || done;
        const color = done ? '#86efac' : sorted ? '#6ee7b7' : swapping && active ? '#fef08a' : active ? '#fca5a5' : '#5b5bd6';
        const glow = done ? 1.2 : sorted ? 0.9 : swapping && active ? 2 : active ? 1.4 : 0.35;
        const lift = active && swapping ? 0.8 : active ? 0.3 : 0;
        return (
          <group key={`${k}`}>
            <Smooth position={[xOf(k), h / 2 + lift, 0]} speed={7}>
              <mesh castShadow>
                <cylinderGeometry args={[0.45, 0.55, h, 6]} />
                <GlowMaterial color={color} intensity={glow} roughness={0.2} metalness={0.3} />
              </mesh>
              <MonoLabel text={String(v)} position={[0, h / 2 + 0.5, 0]} size={0.45} color="#ffffff" />
            </Smooth>
            {active && <Halo position={[xOf(k), 0.01, 0]} color={swapping ? '#fef08a' : '#fca5a5'} radius={0.8} />}
          </group>
        );
      })}
      {a !== null && b !== null && (
        <Beam from={[xOf(a), 4.6, 0]} to={[xOf(b), 4.6, 0]} color={swapping ? '#fef08a' : '#fca5a5'} lift={swapping ? 1.2 : 0.5} radius={0.04} />
      )}
      {a !== null && b !== null && (
        <Smooth position={[(xOf(a) + xOf(b)) / 2, swapping ? 6.2 : 5.5, 0]}>
          <Label text={swapping ? 'swap ⇄' : 'compare'} size={0.5} color={swapping ? '#fef08a' : '#fca5a5'} />
        </Smooth>
      )}
      {done && <Label text="sorted" position={[0, 5.6, 0]} size={0.7} color="#86efac" />}
    </group>
  );
}

/* ============================ CLIMBING STAIRS ======================== */
function Walker({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = 0.55 + Math.sin(clock.elapsedTime * 4) * 0.08;
  });
  return (
    <Smooth position={position} speed={5}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
      <pointLight color={color} intensity={6} distance={5} position={[0, 0.8, 0]} />
    </Smooth>
  );
}

export function StairsScene({ state }: { state: StairsState }) {
  const { n, dp, i, from } = state;
  const stepW = 1.4;
  const stepH = 0.55;
  const x0 = -((n) * stepW) / 2;
  const pos = (k: number): [number, number, number] => [x0 + k * stepW, k * stepH, 0];
  const accent = '#a5b4fc';
  return (
    <group>
      {Array.from({ length: n + 1 }, (_, k) => {
        const [x, y] = pos(k);
        const known = dp[k] !== null;
        const isCur = i === k;
        const isFrom = from.includes(k);
        const color = isCur ? '#fef08a' : isFrom ? '#f9a8d4' : known ? accent : '#26254e';
        const glow = isCur ? 1.8 : isFrom ? 1.3 : known ? 0.5 : 0.05;
        const h = y + stepH;
        return (
          <group key={k}>
            <mesh position={[x, h / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[stepW * 0.96, h, 3]} />
              <GlowMaterial color={color} intensity={glow} roughness={0.5} />
            </mesh>
            <Label text={k === 0 ? 'ground' : `step ${k}`} position={[x, 0.15, 1.75]} size={0.26} color="#7d7cb8" />
            <Smooth position={[x, h + 0.9, 0]} visible={known} speed={5}>
              <Float speed={2} floatIntensity={0.25} rotationIntensity={0}>
                <MonoLabel text={known ? String(dp[k]) : ''} size={0.62} color={isCur ? '#fef08a' : '#ffffff'} />
              </Float>
            </Smooth>
          </group>
        );
      })}
      {/* beams from the two previous steps */}
      {i !== null &&
        from.map((f) => {
          const [fx, fy] = pos(f);
          const [tx, ty] = pos(i);
          return <Beam key={f} from={[fx, fy + stepH + 0.9, 0]} to={[tx, ty + stepH + 0.9, 0]} color={f === i - 1 ? '#f9a8d4' : '#fda4af'} lift={f === i - 1 ? 0.9 : 1.8} radius={0.045} />;
        })}
      <Walker position={i !== null ? [pos(i)[0], pos(i)[1] + stepH, -0.9] : [pos(0)[0], stepH, -0.9]} color="#fef08a" />
      <Label text={`n = ${n}`} position={[x0 - 1.2, 1.2, 0]} size={0.5} color={accent} />
      {i === n && dp[n] !== null && from.length === 0 && (
        <Label text={`${dp[n]} ways`} position={[pos(n)[0], pos(n)[1] + 3.2, 0]} size={0.8} color="#fef08a" />
      )}
    </group>
  );
}
