export type PullPhase =
  | 'idle'
  | 'shaking' // machine shakes, the ball floats in the dome
  | 'falling' // the ball drops through the dome and into the floor hole
  | 'inside' // hidden inside the machine, on its way to the slot
  | 'exiting' // the ball rolls out of the slot and onto the tray
  | 'wobbling' // ball rocks side to side
  | 'opening' // lid opens, light bursts out
  | 'emerging' // the Pokémon rises out of the ball
  | 'revealed';

export interface PullFrame {
  readonly phase: PullPhase;
  /** Progress inside the current phase, from 0 to 1. */
  readonly progress: number;
}

export const IDLE_FRAME: PullFrame = { phase: 'idle', progress: 0 };
export const REVEALED_FRAME: PullFrame = { phase: 'revealed', progress: 1 };
