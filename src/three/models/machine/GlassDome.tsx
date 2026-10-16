import { PALETTE } from '../../config/palette';
import { SCENE_CONFIG } from '../../config/sceneConfig';

const { domeY } = SCENE_CONFIG.ball;
const { domeRadius } = SCENE_CONFIG.machine;
const HALF_PI = Math.PI / 2;

/** Transparent dome with a highlight streak, a silver rim and a red cap. */
export function GlassDome() {
  return (
    <group position={[0, domeY, 0]}>
      <mesh>
        <sphereGeometry args={[domeRadius, 32, 32]} />
        <meshStandardMaterial
          color={PALETTE.glass}
          transparent
          opacity={0.22}
          roughness={0.05}
          depthWrite={false}
        />
      </mesh>

      {/* Highlight streak: sells the "glass" look cheaply */}
      <mesh position={[-0.44, 0.54, 0.68]} rotation={[0, -0.5, 0.6]} scale={[0.32, 0.07, 0.03]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="white" transparent opacity={0.6} depthWrite={false} />
      </mesh>

      <mesh position={[0, -domeRadius, 0]} rotation={[HALF_PI, 0, 0]}>
        <torusGeometry args={[domeRadius - 0.02, 0.06, 12, 48]} />
        <meshStandardMaterial color={PALETTE.silver} roughness={0.3} metalness={0.5} />
      </mesh>

      <mesh position={[0, domeRadius + 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.2, 0.12, 24]} />
        <meshStandardMaterial color={PALETTE.red} roughness={0.4} />
      </mesh>
      <mesh position={[0, domeRadius + 0.12, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={PALETTE.black} roughness={0.5} />
      </mesh>
    </group>
  );
}
