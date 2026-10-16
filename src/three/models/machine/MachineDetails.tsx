import { useFrame } from '@react-three/fiber/native';
import { MutableRefObject, useRef } from 'react';
import type { Group, MeshStandardMaterial } from 'three';
import { chuteGlow } from '../../animation/machineAnimation';
import { PullFrame } from '../../animation/PullPhase';
import { PALETTE } from '../../config/palette';
import { SCENE_CONFIG } from '../../config/sceneConfig';

const { frontZ, trayTopY, trayEndZ, holeRadius } = SCENE_CONFIG.machine;
const MAX_RIM_EMISSIVE = 1.5;
const HALF_PI = Math.PI / 2;

const flat = (color: string) => <meshStandardMaterial color={color} roughness={0.5} />;

/** Poké Ball emblem on the red upper half of the machine. */
export function Emblem() {
  return (
    <group position={[0, -0.12, frontZ + 0.003]}>
      <mesh>
        <circleGeometry args={[0.3, 32]} />
        {flat(PALETTE.black)}
      </mesh>
      <mesh position={[0, 0, 0.002]}>
        <circleGeometry args={[0.26, 32, 0, Math.PI]} />
        {flat(PALETTE.red)}
      </mesh>
      <mesh position={[0, 0, 0.002]}>
        <circleGeometry args={[0.26, 32, Math.PI, Math.PI]} />
        {flat(PALETTE.white)}
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <planeGeometry args={[0.52, 0.05]} />
        {flat(PALETTE.black)}
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <circleGeometry args={[0.11, 24]} />
        {flat(PALETTE.black)}
      </mesh>
      <mesh position={[0, 0, 0.007]}>
        <circleGeometry args={[0.075, 24]} />
        {flat(PALETTE.white)}
      </mesh>
    </group>
  );
}

/** Silver panel with the coin slot. */
interface CoinPanelProps {
  canInsertCoin: boolean;
  isInsertingCoin: boolean;
  onInsertCoin: () => void;
}

export function CoinPanel({ canInsertCoin, isInsertingCoin, onInsertCoin }: CoinPanelProps) {
  const coinRef = useRef<Group>(null);
  const startedAt = useRef(0);
  const wasInserting = useRef(false);

  useFrame(({ clock }) => {
    const coin = coinRef.current;
    if (!coin) return;

    if (isInsertingCoin && !wasInserting.current) startedAt.current = clock.elapsedTime;
    wasInserting.current = isInsertingCoin;
    coin.visible = isInsertingCoin;

    if (isInsertingCoin) {
      const progress = Math.min((clock.elapsedTime - startedAt.current) / 0.65, 1);
      coin.position.z = 0.22 - progress * 0.15;
      coin.scale.setScalar(1 - progress * 0.9);
      coin.rotation.y = progress * Math.PI * 5;
    }
  });

  return (
    <group position={[-0.62, -0.5, frontZ + 0.04]}>
      <mesh>
        <boxGeometry args={[0.5, 0.62, 0.06]} />
        <meshStandardMaterial color={PALETTE.silver} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.12, 0.035]}>
        <boxGeometry args={[0.26, 0.045, 0.02]} />
        {flat(PALETTE.black)}
      </mesh>
      <mesh
        position={[0, 0.12, 0.08]}
        onPointerDown={(event) => {
          if (!canInsertCoin) return;
          event.stopPropagation();
          onInsertCoin();
        }}
      >
        <planeGeometry args={[0.5, 0.42]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={coinRef} position={[0, 0.12, 0.22]} visible={false}>
        <mesh rotation={[HALF_PI, 0, 0]}>
          <cylinderGeometry args={[0.085, 0.085, 0.025, 24]} />
          <meshStandardMaterial color={PALETTE.yellow} roughness={0.25} metalness={0.75} />
        </mesh>
        <mesh rotation={[HALF_PI, 0, 0]} position={[0, 0, 0.014]}>
          <cylinderGeometry args={[0.058, 0.058, 0.003, 24]} />
          <meshStandardMaterial color="#fff0a6" roughness={0.3} metalness={0.55} />
        </mesh>
      </group>
      <mesh position={[0, -0.12, 0.035]} rotation={[HALF_PI, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.02, 24]} />
        <meshStandardMaterial color={PALETTE.yellow} roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  );
}

/** Dark opening the ball rolls out of. Its rim lights up as the ball approaches. */
export function Chute({ frameRef }: { frameRef: MutableRefObject<PullFrame> }) {
  const rimRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    if (rimRef.current) {
      rimRef.current.emissiveIntensity = chuteGlow(frameRef.current) * MAX_RIM_EMISSIVE;
    }
  });

  return (
    <group position={[0, -0.98, frontZ + 0.002]}>
      <mesh>
        <circleGeometry args={[0.48, 40]} />
        {flat(PALETTE.black)}
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <ringGeometry args={[0.48, 0.54, 40]} />
        <meshStandardMaterial
          ref={rimRef}
          color={PALETTE.silver}
          emissive={PALETTE.yellow}
          emissiveIntensity={0}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
    </group>
  );
}

/** Hole in the dome floor: the ball is swallowed here. Sits on the top face of the body. */
export function FloorHole() {
  return (
    <group position={[0, 0.2005, 0]} rotation={[-HALF_PI, 0, 0]}>
      <mesh>
        <circleGeometry args={[holeRadius, 32]} />
        {flat(PALETTE.black)}
      </mesh>
      <mesh position={[0, 0, 0.002]}>
        <ringGeometry args={[holeRadius, holeRadius + 0.05, 32]} />
        <meshStandardMaterial color={PALETTE.silver} roughness={0.3} metalness={0.4} />
      </mesh>
    </group>
  );
}

/** Tray where the ball comes to rest. Its top surface matches `trayTopY`. */
export function Tray() {
  const thickness = 0.1;
  const backZ = frontZ - 0.05; // tucked slightly into the body
  const depth = trayEndZ - backZ;

  return (
    <group position={[0, trayTopY - thickness / 2, backZ + depth / 2]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, thickness, depth]} />
        <meshStandardMaterial color="#dfe3ea" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.03, depth / 2]}>
        <boxGeometry args={[1.5, 0.16, 0.06]} />
        {flat(PALETTE.black)}
      </mesh>
    </group>
  );
}
