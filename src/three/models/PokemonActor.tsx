import { useFrame, useLoader } from '@react-three/fiber/native';
import { MutableRefObject, useRef } from 'react';
import { Group, MeshBasicMaterial, TextureLoader } from 'three';
import { pokemonPose } from '../animation/pokemonPose';
import { PullFrame } from '../animation/PullPhase';
import { SCENE_CONFIG } from '../config/sceneConfig';

interface Props {
  frameRef: MutableRefObject<PullFrame>;
  imageUrl: string;
}

const { size } = SCENE_CONFIG.pokemon;

/**
 * The revealed Pokémon, drawn as a textured plane (a "billboard").
 * This is the single seam to replace if real 3D models are added later:
 * same props, same pose function, different content.
 */
export function PokemonActor({ frameRef, imageUrl }: Props) {
  const texture = useLoader(TextureLoader, imageUrl);
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<MeshBasicMaterial>(null);

  useFrame(() => {
    const group = groupRef.current;
    const material = materialRef.current;
    if (!group || !material) return;

    const pose = pokemonPose(frameRef.current);
    group.visible = pose.visible;
    group.position.y = pose.y;
    group.scale.setScalar(pose.scale);
    material.opacity = pose.opacity;
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial ref={materialRef} map={texture} transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
