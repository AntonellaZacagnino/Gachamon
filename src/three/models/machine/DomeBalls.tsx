import { useFrame } from '@react-three/fiber/native';
import { MutableRefObject, useRef } from 'react';
import type { Group } from 'three';
import { domeBallOffset } from '../../animation/machineAnimation';
import { PullFrame } from '../../animation/PullPhase';
import { DOME_BALLS, MINI_BALL_RADIUS } from '../../config/domeBallLayout';
import { PALETTE } from '../../config/palette';
import { SCENE_CONFIG } from '../../config/sceneConfig';

interface Props {
  frameRef: MutableRefObject<PullFrame>;
}

const { domeY } = SCENE_CONFIG.ball;
const TAU = Math.PI * 2;
const HALF_PI = Math.PI / 2;

/** The pile of small Poké Balls inside the dome. They tumble while the machine shakes. */
export function DomeBalls({ frameRef }: Props) {
  const groups = useRef<Array<Group | null>>([]);

  useFrame(({ clock }) => {
    DOME_BALLS.forEach((ball, index) => {
      const group = groups.current[index];
      if (!group) return;

      const offset = domeBallOffset(frameRef.current, clock.elapsedTime, index);
      group.position.set(
        ball.position[0] + offset.x,
        ball.position[1] + offset.y,
        ball.position[2] + offset.z,
      );
      group.rotation.set(ball.rotation[0], ball.rotation[1] + offset.spin, ball.rotation[2]);
    });
  });

  return (
    <group position={[0, domeY, 0]}>
      {DOME_BALLS.map((ball, index) => (
        <group
          key={index}
          ref={(group) => {
            groups.current[index] = group;
          }}
          position={ball.position}
          rotation={ball.rotation}
        >
          <mesh>
            <sphereGeometry args={[MINI_BALL_RADIUS, 16, 16, 0, TAU, 0, HALF_PI]} />
            <meshStandardMaterial color={ball.color} roughness={0.4} />
          </mesh>
          <mesh>
            <sphereGeometry args={[MINI_BALL_RADIUS, 16, 16, 0, TAU, HALF_PI, HALF_PI]} />
            <meshStandardMaterial color={PALETTE.white} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
