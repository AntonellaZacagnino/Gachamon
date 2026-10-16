const HALF_PI = Math.PI / 2;

/** Soft dark disc under the machine so it doesn't float. */
export function GroundShadow() {
  return (
    <>
      <mesh
        position={[0, -1.705, 0]}
        rotation={[-HALF_PI, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[30, 30]} />
        <shadowMaterial transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <mesh position={[0, -1.71, 0.4]} rotation={[-HALF_PI, 0, 0]}>
        <circleGeometry args={[2.1, 40]} />
        <meshBasicMaterial color="black" transparent opacity={0.16} depthWrite={false} />
      </mesh>
    </>
  );
}
