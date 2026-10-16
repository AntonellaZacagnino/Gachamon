import { useFrame } from '@react-three/fiber/native';
import { MutableRefObject, useRef } from 'react';
import type { MeshStandardMaterial } from 'three';
import { bulbGlow } from '../../animation/machineAnimation';
import { PullFrame } from '../../animation/PullPhase';
import { PALETTE } from '../../config/palette';
import { SCENE_CONFIG } from '../../config/sceneConfig';

interface Props {
  frameRef: MutableRefObject<PullFrame>;
}

const { frontZ } = SCENE_CONFIG.machine;
const BULB_X = [-0.8, -0.4, 0, 0.4, 0.8] as const;
const MAX_EMISSIVE = 1.2;

/** Yellow bulbs along the top edge, like the lights of a game-corner machine. */
export function MarqueeLights({ frameRef }: Props) {
  const materials = useRef<Array<MeshStandardMaterial | null>>([]);

  useFrame(({ clock }) => {
    materials.current.forEach((material, index) => {
      if (material) {
        material.emissiveIntensity = bulbGlow(frameRef.current, clock.elapsedTime, index) * MAX_EMISSIVE;
      }
    });
  });

  return (
    <group position={[0, 0.1, frontZ + 0.02]}>
      {BULB_X.map((x, index) => (
        <mesh key={x} position={[x, 0, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial
            ref={(material) => {
              materials.current[index] = material;
            }}
            color={PALETTE.yellow}
            emissive={PALETTE.yellow}
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}
