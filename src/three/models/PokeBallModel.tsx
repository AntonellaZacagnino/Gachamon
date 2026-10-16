import { useFrame } from '@react-three/fiber/native';
import { MutableRefObject, ReactNode, useRef } from 'react';
import { DoubleSide, Group, MeshBasicMaterial, PointLight } from 'three';
import { pokeBallPose } from '../animation/pokeBallPose';
import { PullFrame } from '../animation/PullPhase';
import { PALETTE } from '../config/palette';
import { SCENE_CONFIG } from '../config/sceneConfig';

interface Props {
  frameRef: MutableRefObject<PullFrame>;
  /** Colour of the light burst (the pull's rarity colour). */
  accentColor: string;
  /** Rendered inside the ball's coordinate space (e.g. the Pokémon). */
  children?: ReactNode;
}

const { radius, lidMaxAngle } = SCENE_CONFIG.ball;
const TAU = Math.PI * 2;
const HALF_PI = Math.PI / 2;
const GLOW_LIGHT_INTENSITY = 4;

export function PokeBallModel({ frameRef, accentColor, children }: Props) {
  const rootRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const lidRef = useRef<Group>(null);
  const glowMaterialRef = useRef<MeshBasicMaterial>(null);
  const lightRef = useRef<PointLight>(null);

  useFrame(({ clock }) => {
    const root = rootRef.current;
    const body = bodyRef.current;
    const lid = lidRef.current;
    if (!root || !body || !lid) return;

    const pose = pokeBallPose(frameRef.current, clock.elapsedTime);
    root.visible = pose.visible;
    root.position.set(pose.x, pose.y, pose.z);
    body.rotation.set(pose.roll, 0, pose.wobble);
    body.scale.setScalar(pose.scale);
    lid.rotation.x = -pose.openAmount * lidMaxAngle; // negative = front edge lifts up

    if (glowMaterialRef.current) glowMaterialRef.current.opacity = pose.glow;
    if (lightRef.current) lightRef.current.intensity = pose.glow * GLOW_LIGHT_INTENSITY;
  });

  return (
    <group ref={rootRef} visible={false}>
      <group ref={bodyRef}>
        {/* Bottom half (white). DoubleSide so the inside is visible when open. */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[radius, 32, 32, 0, TAU, HALF_PI, HALF_PI]} />
          <meshStandardMaterial
            color={PALETTE.white}
            emissive={PALETTE.white}
            emissiveIntensity={0.12}
            side={DoubleSide}
          />
        </mesh>

        {/* Black band around the equator */}
        <mesh rotation={[HALF_PI, 0, 0]} castShadow receiveShadow>
          <torusGeometry args={[radius, 0.03, 12, 48]} />
          <meshStandardMaterial color={PALETTE.black} />
        </mesh>

        {/* Front button */}
        <group position={[0, 0, radius]}>
          <mesh>
            <torusGeometry args={[0.09, 0.025, 12, 24]} />
            <meshStandardMaterial color={PALETTE.black} />
          </mesh>
          <mesh scale={[1, 1, 0.4]}>
            <sphereGeometry args={[0.065, 16, 16]} />
            <meshStandardMaterial color={PALETTE.white} />
          </mesh>
        </group>

        {/* Light that fills the open ball */}
        <mesh rotation={[-HALF_PI, 0, 0]} position={[0, -0.01, 0]}>
          <circleGeometry args={[radius * 0.95, 32]} />
          <meshBasicMaterial ref={glowMaterialRef} color={accentColor} transparent opacity={0} />
        </mesh>
        <pointLight
          ref={lightRef}
          color={accentColor}
          intensity={0}
          distance={4}
          position={[0, 0.2, 0]}
        />

        {/* Lid (red), hinged at the back edge of the ball */}
        <group ref={lidRef} position={[0, 0, -radius]}>
          <mesh position={[0, 0, radius]}>
            <sphereGeometry args={[radius, 32, 32, 0, TAU, 0, HALF_PI]} />
            <meshStandardMaterial
              color={PALETTE.red}
              emissive={PALETTE.red}
              emissiveIntensity={0.18}
              side={DoubleSide}
            />
          </mesh>
        </group>
      </group>

      {children}
    </group>
  );
}
