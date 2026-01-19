export type GameStatus = 'intro' | 'playing' | 'gameover';

export interface Pipe {
  id: number;
  x: number;
  topHeight: number; // Height of the top pipe
  passed: boolean; // Has the bird passed this pipe?
}

export interface GameState {
  birdY: number;
  velocity: number;
  score: number;
  lives: number; // Replaces timeLeft
  isHit: boolean; // Visual flash state
}

export const GAME_CONSTANTS = {
  GRAVITY: 0.75, // Stronger gravity for faster gameplay
  JUMP_STRENGTH: -11, // Stronger jump to match gravity
  PIPE_SPEED: 6.5, // Increased speed (was 5.5)
  PIPE_SPAWN_RATE: 90, // Faster spawn rate (was 100)
  PIPE_GAP: 230, // Slightly larger gap for fairness at high speed
  PIPE_WIDTH: 70, 
  BIRD_SIZE: 80, 
  MAX_LIVES: 2,
  COLLISION_COOLDOWN: 1000, // ms
};