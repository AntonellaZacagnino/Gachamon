import { SCENE_CONFIG } from '../config/sceneConfig';
import { clamp01, easeOutBack, lerp } from './easing';
import { PullFrame } from './PullPhase';

export interface PokemonPose {
  readonly visible: boolean;
  /** Height above the ball. */
  readonly y: number;
  readonly scale: number;
  readonly opacity: number;
}

const { revealY } = SCENE_CONFIG.pokemon;
const HIDDEN: PokemonPose = { visible: false, y: 0, scale: 0, opacity: 0 };
const FULLY_REVEALED: PokemonPose = { visible: true, y: revealY, scale: 1, opacity: 1 };
const START_Y = 0.1;
const START_SCALE = 0.05;

/** Pure function: the Pokémon pops out of the open ball and settles above it. */
export function pokemonPose(frame: PullFrame): PokemonPose {
  switch (frame.phase) {
    case 'emerging': {
      const t = easeOutBack(frame.progress);
      return {
        visible: true,
        y: lerp(START_Y, revealY, t),
        scale: lerp(START_SCALE, 1, t),
        opacity: clamp01(frame.progress * 3), // fades in during the first third
      };
    }
    case 'revealed':
      return FULLY_REVEALED;
    default:
      return HIDDEN;
  }
}
