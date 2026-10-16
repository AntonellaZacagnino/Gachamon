import { MutableRefObject } from 'react';
import { PullFrame } from '../../animation/PullPhase';
import { PALETTE } from '../../config/palette';
import { SCENE_CONFIG } from '../../config/sceneConfig';
import { Chute, CoinPanel, Emblem, FloorHole, Tray } from './MachineDetails';
import { RoundedBlock } from './RoundedBlock';

interface Props {
  frameRef: MutableRefObject<PullFrame>;
  canInsertCoin: boolean;
  isInsertingCoin: boolean;
  onInsertCoin: () => void;
}

const { width, depth } = SCENE_CONFIG.machine;

/** Static shell: black plinth, white base, red top, black belt, and front details. */
export function MachineBody({ frameRef, canInsertCoin, isInsertingCoin, onInsertCoin }: Props) {
  return (
    <group>
      <mesh position={[0, -1.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.3, 0.2, depth + 0.3]} />
        <meshStandardMaterial color={PALETTE.black} roughness={0.6} />
      </mesh>

      <RoundedBlock width={width} height={0.93} depth={depth} y={-1.035} color={PALETTE.white} />
      <RoundedBlock width={width} height={0.63} depth={depth} y={-0.115} color={PALETTE.red} />

      <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.04, 0.14, depth + 0.04]} />
        <meshStandardMaterial color={PALETTE.black} roughness={0.6} />
      </mesh>

      <FloorHole />
      <Emblem />
      <CoinPanel
        canInsertCoin={canInsertCoin}
        isInsertingCoin={isInsertingCoin}
        onInsertCoin={onInsertCoin}
      />
      <Chute frameRef={frameRef} />
      <Tray />
    </group>
  );
}
