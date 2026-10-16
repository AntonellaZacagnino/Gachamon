import { Canvas } from '@react-three/fiber/native';
import { Suspense } from 'react';
import { usePullAnimation } from './animation/usePullAnimation';
import { SCENE_CONFIG } from './config/sceneConfig';
import { MachineModel } from './models/MachineModel';
import { PokeBallModel } from './models/PokeBallModel';
import { PokemonActor } from './models/PokemonActor';
import { SceneErrorBoundary } from './models/SceneErrorBoundary';

export interface GachaCanvasProps {
  isPulling: boolean;
  canInsertCoin: boolean;
  isInsertingCoin: boolean;
  onInsertCoin: () => void;
  /** Colour of the light burst when the ball opens. */
  accentColor: string;
  /** Artwork of the Pokémon about to be revealed; null before a pull. */
  pokemonImageUrl: string | null;
  onAnimationComplete: () => void;
}

export function GachaCanvas(props: GachaCanvasProps) {
  const { camera } = SCENE_CONFIG;
  return (
    <Canvas camera={{ position: camera.position, fov: camera.fov }} shadows="soft">
      <Scene {...props} />
    </Canvas>
  );
}

// Separate component: hooks like useFrame only work *inside* <Canvas>.
function Scene({
  isPulling,
  canInsertCoin,
  isInsertingCoin,
  onInsertCoin,
  accentColor,
  pokemonImageUrl,
  onAnimationComplete,
}: GachaCanvasProps) {
  const frameRef = usePullAnimation(isPulling, onAnimationComplete);
  const { lights } = SCENE_CONFIG;

  return (
    <>
      <ambientLight intensity={lights.ambientIntensity} />
      <directionalLight
        castShadow
        intensity={lights.directional.intensity}
        position={lights.directional.position}
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-near={0.1}
        shadow-camera-far={18}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0002}
        shadow-radius={4}
      />
      <MachineModel
        frameRef={frameRef}
        canInsertCoin={canInsertCoin}
        isInsertingCoin={isInsertingCoin}
        onInsertCoin={onInsertCoin}
      />
      <PokeBallModel frameRef={frameRef} accentColor={accentColor}>
        {pokemonImageUrl && (
          // key resets the boundary, so one failed image doesn't block later pulls
          <SceneErrorBoundary key={pokemonImageUrl}>
            <Suspense fallback={null}>
              <PokemonActor frameRef={frameRef} imageUrl={pokemonImageUrl} />
            </Suspense>
          </SceneErrorBoundary>
        )}
      </PokeBallModel>
    </>
  );
}
