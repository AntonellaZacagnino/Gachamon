import { SCENE_CONFIG } from '../config/sceneConfig';

/**
 * Furthest-back world z reached by the open lid.
 *
 * The lid is a hemisphere hinged at the rear edge of the ball. Opened by `angle`
 * (radians, 0..π) its sphere centre sits at `restZ - 2r + r·cos(angle)` behind the
 * hinge line, and the hemisphere always includes its rearmost point, so the lid
 * reaches back to `centre - r`. If this drops below the machine's front plane,
 * the lid pokes through the wall.
 */
export function lidBackZ(
  angle: number,
  restZ: number = SCENE_CONFIG.ball.restZ,
  radius: number = SCENE_CONFIG.ball.radius,
): number {
  return restZ - 2 * radius + radius * Math.cos(angle);
}
