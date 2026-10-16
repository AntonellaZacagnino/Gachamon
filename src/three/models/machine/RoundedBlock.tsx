interface Props {
  width: number;
  height: number;
  depth: number;
  /** Vertical centre of the block. */
  y: number;
  color: string;
  radius?: number;
}

const CORNERS = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
] as const;

/** A box with rounded vertical edges, built from two boxes and four cylinders. */
export function RoundedBlock({ width, height, depth, y, color, radius = 0.1 }: Props) {
  return (
    <group position={[0, y, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width - radius * 2, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth - radius * 2]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      {CORNERS.map(([sx, sz]) => (
        <mesh
          key={`${sx}${sz}`}
          position={[sx * (width / 2 - radius), 0, sz * (depth / 2 - radius)]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[radius, radius, height, 16]} />
          <meshStandardMaterial color={color} roughness={0.45} />
        </mesh>
      ))}
    </group>
  );
}
