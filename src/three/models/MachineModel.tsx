import { useFrame } from '@react-three/fiber/native';
import { MutableRefObject, useRef } from 'react';
import type { Group } from 'three';
import { machineShake } from '../animation/machineAnimation';
import { PullFrame } from '../animation/PullPhase';
import { Dial } from './machine/Dial';
import { DomeBalls } from './machine/DomeBalls';
import { GlassDome } from './machine/GlassDome';
import { GroundShadow } from './machine/GroundShadow';
import { MachineBody } from './machine/MachineBody';
import { MarqueeLights } from './machine/MarqueeLights';

interface Props {
  frameRef: MutableRefObject<PullFrame>;
  canInsertCoin: boolean;
  isInsertingCoin: boolean;
  onInsertCoin: () => void;
}

/**
 * Procedural Pokémon-style gacha machine (no external assets).
 * To use a downloaded GLB instead, replace the children below and keep the props:
 * the animation only needs the dome centre, the floor hole, the slot, the tray
 * surface and the front plane, all defined in SCENE_CONFIG.
 */
export function MachineModel({ frameRef, canInsertCoin, isInsertingCoin, onInsertCoin }: Props) {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    group.rotation.z = machineShake(frameRef.current, clock.elapsedTime);
  });

  return (
    <group ref={groupRef}>
      <GroundShadow />
      <MachineBody
        frameRef={frameRef}
        canInsertCoin={canInsertCoin}
        isInsertingCoin={isInsertingCoin}
        onInsertCoin={onInsertCoin}
      />
      <Dial frameRef={frameRef} />
      <MarqueeLights frameRef={frameRef} />
      <DomeBalls frameRef={frameRef} />
      <GlassDome />
    </group>
  );
}
