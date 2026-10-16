import { useFrame } from '@react-three/fiber/native';
import { MutableRefObject, useRef } from 'react';
import type { Group } from 'three';
import { dialAngle } from '../../animation/machineAnimation';
import { PullFrame } from '../../animation/PullPhase';
import { PALETTE } from '../../config/palette';
import { SCENE_CONFIG } from '../../config/sceneConfig';

interface Props {
  frameRef: MutableRefObject<PullFrame>;
}

const { frontZ } = SCENE_CONFIG.machine;
const HALF_PI = Math.PI / 2;

/** Poké Ball-style knob on the belt; it turns while the machine shakes. */
export function Dial({ frameRef }: Props) {
  const handleRef = useRef<Group>(null);

  useFrame(() => {
    if (handleRef.current) handleRef.current.rotation.z = dialAngle(frameRef.current);
  });

  return (
    <group position={[0.62, -0.5, frontZ + 0.06]}>
      <mesh rotation={[HALF_PI, 0, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.08, 32]} />
        <meshStandardMaterial color={PALETTE.black} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.02]} rotation={[HALF_PI, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.08, 32]} />
        <meshStandardMaterial color={PALETTE.white} roughness={0.4} />
      </mesh>
      <group ref={handleRef} position={[0, 0, 0.07]}>
        <mesh>
          <boxGeometry args={[0.4, 0.08, 0.05]} />
          <meshStandardMaterial color={PALETTE.black} roughness={0.5} />
        </mesh>
        <mesh rotation={[HALF_PI, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.07, 16]} />
          <meshStandardMaterial color={PALETTE.red} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
