export const SCENE_CONFIG = {
  camera: { position: [0, 1.5, 6] as [number, number, number], fov: 45 },
  lights: {
    ambientIntensity: 0.8,
    directional: { intensity: 1.2, position: [5, 8, 5] as [number, number, number] },
  },
  machine: {
    domeRadius: 1,
    width: 2,
    depth: 2,
    frontZ: 1, // depth / 2: the plane where the front details sit
    holeRadius: 0.3, // hole in the dome floor that swallows the ball
    trayTopY: -1.35, // the Poké Ball rests on this surface
    trayEndZ: 2.4, // front edge of the tray (long enough for the ball and its open lid)
  },
  ball: {
    radius: 0.45,
    insideScale: 0.55, // inside the machine the ball is smaller, so it fits in the dome pile
    domeY: 1.2, // where the ball floats inside the dome
    holeY: -0.05, // where it has sunk completely below the dome floor
    exitStartZ: 0.5, // inside the body, just before it reaches the slot
    chuteY: -0.9, // height of the slot and of the ball once on the tray
    restZ: 1.8, // where it stops on the tray: far enough that the open lid clears the machine wall
    lidMaxAngle: 1.22, // radians (~70°). More than this and the lid would cross the wall (see lidGeometry.ts)
  },
  pokemon: { revealY: 1.1, size: 1.7 },
  animation: {
    shaking: 600,
    falling: 550, // dome -> hole (visible through the glass)
    inside: 450, // inside the machine (hidden)
    exiting: 800, // out of the slot and onto the tray
    wobbling: 900,
    opening: 600,
    emerging: 900,
  }, // milliseconds
} as const;
