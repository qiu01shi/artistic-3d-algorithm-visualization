import { Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { IslandState, LinkedState, ParenState, TreeState } from '../../lib/algorithms';
import { Arrow, Beam, Crystal, GlowMaterial, Halo, Label, MonoLabel, Pointer, Smooth } from '../primitives';

/* ========================= VALID PARENTHESES (STACK) ================== */
const BRACKET_COLOR: Record<string, string> = {
  '(': '#fde68a',
  ')': '#fde68a',
  '[': '#6ee7b7',
  ']': '#6ee7b7',
  '{': '#f9a8d4',
  '}': '#f9a8d4',
};

export function StackScene({ state }: { state: ParenState }) {
  const { s, i, stack, action, result } = state;
  const gap = 1.15;
  const x0 = -((s.length - 1) * gap) / 2;
  const chars = s.split('');
  const layerH = 0.7;
  // Track which string index sits in each stack slot for the flying animation
  const stackOrigins = useMemo(() => {
    const processed = i === null ? (action === 'done' ? s.length : 0) : action ? i + 1 : i;
    const st: number[] = [];
    for (let k = 0; k < processed; k++) {
      if ('([{'.includes(s[k])) st.push(k);
      else st.pop();
    }
    return st;
  }, [s, i, action]);

  return (
    <group>
      {/* the string as a ribbon of glyphs */}
      {chars.map((ch, k) => {
        const isCur = k === i;
        const consumed = i !== null && k < i;
        const color = BRACKET_COLOR[ch];
        return (
          <group key={k}>
            <Smooth position={[x0 + k * gap, isCur ? 1.4 : 0.8, 4]} scale={isCur ? 1.2 : 1}>
              <mesh>
                <boxGeometry args={[0.8, 0.8, 0.3]} />
                <GlowMaterial color={consumed ? '#2b2a55' : color} intensity={isCur ? 1.8 : consumed ? 0.05 : 0.5} opacity={consumed ? 0.5 : 1} />
              </mesh>
              <MonoLabel text={ch} position={[0, 0, 0.2]} size={0.55} color={consumed ? '#5a5990' : '#ffffff'} />
            </Smooth>
            {isCur && <Halo position={[x0 + k * gap, 0.01, 4]} color={color} radius={0.6} />}
          </group>
        );
      })}
      {i !== null && <Pointer position={[x0 + i * gap, 1.4, 4]} label="ch" color={BRACKET_COLOR[s[i]]} height={1.1} />}

      {/* the stack tower */}
      <group position={[0, 0, -1.5]}>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[1.6, 1.8, 0.12, 48]} />
          <meshStandardMaterial color="#1a1740" emissive="#4b3aa8" emissiveIntensity={0.35} />
        </mesh>
        <Label text="stack" position={[0, -0.02, 2.1]} size={0.36} color="#b7b3ff" />
        {stackOrigins.map((origin, level) => {
          const ch = s[origin];
          const isTop = level === stack.length - 1;
          return (
            <Smooth key={origin} position={[0, 0.12 + layerH / 2 + level * layerH, 0]} speed={6}>
              <mesh castShadow>
                <cylinderGeometry args={[1.1 - level * 0.05, 1.2 - level * 0.05, layerH * 0.9, 6]} />
                <GlowMaterial color={BRACKET_COLOR[ch]} intensity={isTop ? 1.2 : 0.45} roughness={0.3} />
              </mesh>
              <MonoLabel text={ch} position={[0, 0, 1.25]} size={0.5} color="#ffffff" />
            </Smooth>
          );
        })}
        {/* the flying glyph on pop (visualised as a beam from top to the reader) */}
        {i !== null && action === 'pop' && (
          <Beam from={[0, 0.12 + layerH / 2 + stack.length * layerH, 0]} to={[x0 + i * gap, 1.4, 5.5]} color={BRACKET_COLOR[s[i]]} lift={2} radius={0.04} />
        )}
        {i !== null && action === 'push' && (
          <Beam from={[x0 + i * gap, 1.4, 5.5]} to={[0, 0.12 + layerH / 2 + (stack.length - 1) * layerH, 0]} color={BRACKET_COLOR[s[i]]} lift={2} radius={0.04} />
        )}
        {action === 'mismatch' && <Halo position={[0, 0.13, 0]} color="#f87171" radius={1.9} intensity={3} />}
      </group>

      {result !== null && (
        <Float speed={2} floatIntensity={0.6}>
          <Label text={result ? 'valid ✓' : 'invalid ✗'} position={[0, 5.2, -1.5]} size={0.9} color={result ? '#86efac' : '#f87171'} />
        </Float>
      )}
    </group>
  );
}

/* ========================= REVERSE LINKED LIST ======================== */
export function LinkedListScene({ state }: { state: LinkedState }) {
  const { vals, next, prev, curr, nxt, head, done } = state;
  const gap = 2.6;
  const x0 = -((vals.length - 1) * gap) / 2;
  const xOf = (k: number) => x0 + k * gap;
  const accent = '#c4b5fd';
  const nullX = xOf(vals.length); // ghost node
  return (
    <group>
      {vals.map((v, k) => {
        const isCurr = curr === k;
        const isPrev = prev === k;
        const isHead = done && head === k;
        const color = isHead ? '#fef08a' : isCurr ? accent : isPrev ? '#f9a8d4' : '#4b4bb8';
        const glow = isHead ? 2 : isCurr ? 1.6 : isPrev ? 1.1 : 0.4;
        return (
          <group key={k}>
            <Smooth position={[xOf(k), isCurr ? 1.6 : 1.3, 0]} scale={isCurr ? 1.15 : 1}>
              <Float speed={1.6} floatIntensity={0.2} rotationIntensity={0.15}>
                <Crystal size={[0.8, 0.8, 0.8]} color={color} intensity={glow} shape="sphere" />
              </Float>
              <MonoLabel text={String(v)} position={[0, 0, 0.85]} size={0.6} color="#ffffff" />
            </Smooth>
            {(isCurr || isHead) && <Halo position={[xOf(k), 0.01, 0]} color={isHead ? '#fef08a' : accent} radius={0.9} />}
          </group>
        );
      })}
      {/* null terminals */}
      <Label text="None" position={[nullX, 1.3, 0]} size={0.4} color="#5e5d95" />
      <Label text="None" position={[xOf(-1), 1.3, 0]} size={0.4} color="#5e5d95" />

      {/* arrows */}
      {next.map((to, k) => {
        const fromX = xOf(k);
        // null next: node 0 only becomes null after its arrow is flipped; the tail is null until flipped
        const reversed = to === null ? k === 0 : to < k;
        const color = reversed ? '#f9a8d4' : '#7c7cff';
        const target: [number, number, number] =
          to === null ? (reversed ? [xOf(-1) + 0.6, 1.3, 0] : [nullX - 0.6, 1.3, 0]) : [xOf(to) + (to > k ? -0.95 : 0.95), 1.3, 0];
        const start: [number, number, number] = [fromX + (target[0] > fromX ? 0.95 : -0.95), 1.3, 0];
        return <Arrow key={k} from={start} to={target} color={color} intensity={reversed ? 2 : 1.2} />;
      })}

      {/* pointers */}
      <Pointer position={[prev === null ? xOf(-1) : xOf(prev), 1.5, 0]} label="prev" color="#f9a8d4" height={1.4} />
      <Pointer position={[curr === null ? nullX : xOf(curr), 1.5, 0]} label="curr" color={accent} height={2.2} visible={!done} />
      <Pointer position={[nxt === null ? nullX : xOf(nxt), 1.5, 0]} label="nxt" color="#fde68a" height={3} visible={curr !== null && !done} />
      {done && <Label text="new head" position={[xOf(head!), 3.6, 0]} size={0.5} color="#fef08a" />}
    </group>
  );
}

/* ============================ NUMBER OF ISLANDS ======================= */
const ISLAND_PALETTE = ['#6ee7b7', '#fde68a', '#f9a8d4', '#93c5fd', '#fdba74', '#c4b5fd', '#fca5a5', '#a7f3d0'];

function Water() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const m = ref.current?.material as THREE.MeshStandardMaterial | undefined;
    if (m) m.emissiveIntensity = 0.25 + Math.sin(clock.elapsedTime * 1.2) * 0.08;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
      <planeGeometry args={[14, 11]} />
      <meshStandardMaterial color="#0f2b5c" emissive="#1e40af" emissiveIntensity={0.3} transparent opacity={0.85} roughness={0.15} metalness={0.4} />
    </mesh>
  );
}

export function IslandsScene({ state }: { state: IslandState }) {
  const { grid, owner, current, frontier, count, scan } = state;
  const R = grid.length;
  const C = grid[0].length;
  const cell = 1.4;
  const px = (c: number) => (c - (C - 1) / 2) * cell;
  const pz = (r: number) => (r - (R - 1) / 2) * cell;
  const inFrontier = (r: number, c: number) => frontier.some(([a, b]) => a === r && b === c);
  return (
    <group>
      <Water />
      {grid.map((row, r) =>
        row.map((v, c) => {
          const isLand = v === 1;
          const id = owner[r][c];
          const isCur = current && current[0] === r && current[1] === c;
          const isScan = scan && scan[0] === r && scan[1] === c;
          const inQ = inFrontier(r, c);
          const claimed = id > 0;
          const color = isCur ? '#ffffff' : claimed ? ISLAND_PALETTE[(id - 1) % ISLAND_PALETTE.length] : isLand ? '#3b3a6e' : '#0b1a3a';
          const glow = isCur ? 2.2 : inQ ? 1.4 : claimed ? 0.75 : isLand ? 0.05 : 0;
          const h = isCur ? 1.4 : inQ ? 1.1 : claimed ? 0.9 : isLand ? 0.45 : 0.08;
          if (!isLand) {
            return (
              <mesh key={`${r}-${c}`} position={[px(c), 0.02, pz(r)]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[cell * 0.9, cell * 0.9]} />
                <meshBasicMaterial color={isScan ? '#3b82f6' : '#0b1a3a'} transparent opacity={isScan ? 0.6 : 0.25} toneMapped={false} />
              </mesh>
            );
          }
          return (
            <Smooth key={`${r}-${c}`} position={[px(c), h / 2, pz(r)]} scale={[1, h, 1]} speed={5}>
              <mesh castShadow>
                <boxGeometry args={[cell * 0.86, 1, cell * 0.86]} />
                <GlowMaterial color={color} intensity={glow} roughness={0.6} />
              </mesh>
            </Smooth>
          );
        }),
      )}
      {/* frontier beams from current cell */}
      {current &&
        frontier.map(([r, c]) => (
          <Beam key={`${r}-${c}`} from={[px(current[1]), 1.5, pz(current[0])]} to={[px(c), 1.2, pz(r)]} color="#ffffff" lift={0.8} radius={0.025} intensity={2} />
        ))}
      {current && <pointLight position={[px(current[1]), 3, pz(current[0])]} intensity={30} distance={6} color="#ffffff" />}
      {/* island labels */}
      {Array.from({ length: count }, (_, k) => {
        const cells: [number, number][] = [];
        owner.forEach((row, r) => row.forEach((id, c) => id === k + 1 && cells.push([r, c])));
        if (!cells.length) return null;
        const cx = cells.reduce((s, [, c]) => s + px(c), 0) / cells.length;
        const cz = cells.reduce((s, [r]) => s + pz(r), 0) / cells.length;
        return (
          <Float key={k} speed={2} floatIntensity={0.3}>
            <MonoLabel text={`#${k + 1}`} position={[cx, 2.4, cz]} size={0.5} color={ISLAND_PALETTE[k % ISLAND_PALETTE.length]} />
          </Float>
        );
      })}
      <Label text={`islands  ${count}`} position={[0, 4.6, -pz(0) + 1]} size={0.7} color="#6ee7b7" />
    </group>
  );
}

/* ====================== BINARY TREE LEVEL ORDER ======================= */
export function TreeScene({ state }: { state: TreeState }) {
  const { nodes, queue, visited, current, levels, activeLevel } = state;
  const levelH = 2.1;
  const top = 6.6;
  const pos = (id: number): [number, number, number] => [nodes[id].x, top - nodes[id].depth * levelH, 0];
  const accent = '#fdba74';
  const maxDepth = Math.max(...nodes.map((n) => n.depth));
  return (
    <group>
      {/* level rings */}
      {Array.from({ length: maxDepth + 1 }, (_, d) => (
        <group key={d}>
          <mesh position={[0, top - d * levelH, -0.6]}>
            <planeGeometry args={[14, 1.4]} />
            <meshBasicMaterial color={accent} transparent opacity={activeLevel === d ? 0.1 : 0.02} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          <Label text={`level ${d}`} position={[-7.6, top - d * levelH, 0]} size={0.34} color={activeLevel === d ? accent : '#5e5d95'} />
          {levels[d] && <MonoLabel text={`[${levels[d].join(', ')}]`} position={[7.9, top - d * levelH, 0]} size={0.4} color={activeLevel === d ? '#ffffff' : '#8f8fc9'} />}
        </group>
      ))}
      {/* branches */}
      {nodes.map((n) =>
        [n.left, n.right].map(
          (child) =>
            child !== null && (
              <Beam
                key={`${n.id}-${child}`}
                from={pos(n.id)}
                to={pos(child)}
                color={visited.includes(child) ? accent : '#3d3c7a'}
                lift={-0.3}
                radius={0.03}
                intensity={visited.includes(child) ? 1.2 : 0.2}
              />
            ),
        ),
      )}
      {/* nodes */}
      {nodes.map((n) => {
        const isCur = current === n.id;
        const done = visited.includes(n.id);
        const queued = queue.includes(n.id);
        const color = isCur ? '#ffffff' : done ? accent : queued ? '#fde68a' : '#3d3c7a';
        const glow = isCur ? 2.4 : done ? 1 : queued ? 1.2 : 0.15;
        const [x, y] = pos(n.id);
        return (
          <group key={n.id}>
            <Smooth position={[x, y, 0]} scale={isCur ? 1.3 : queued ? 1.1 : 1}>
              <mesh castShadow>
                <sphereGeometry args={[0.5, 32, 32]} />
                <GlowMaterial color={color} intensity={glow} />
              </mesh>
              <MonoLabel text={String(n.val)} position={[0, 0, 0.55]} size={0.5} color={isCur ? '#1a1a2e' : '#ffffff'} />
            </Smooth>
            {isCur && <pointLight position={[x, y, 1.5]} intensity={15} distance={5} color="#ffffff" />}
          </group>
        );
      })}
      {/* queue */}
      <group position={[0, 0, 4]}>
        <Label text="queue" position={[-6.2, 0.8, 0]} size={0.4} color="#fde68a" />
        {queue.map((id, k) => (
          <Smooth key={id} position={[-4.8 + k * 1.1, 0.6, 0]} speed={6}>
            <mesh>
              <boxGeometry args={[0.85, 0.85, 0.5]} />
              <GlowMaterial color="#fde68a" intensity={k === 0 ? 1.2 : 0.5} />
            </mesh>
            <MonoLabel text={String(nodes[id].val)} position={[0, 0, 0.3]} size={0.45} color="#1a1a2e" />
          </Smooth>
        ))}
        {queue.length === 0 && <Label text="empty" position={[-4.4, 0.6, 0]} size={0.34} color="#5e5d95" />}
      </group>
    </group>
  );
}
