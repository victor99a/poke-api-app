import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Heart, Trophy, Flame, Music, VolumeX } from 'lucide-react';
import { GameStatus, Pipe, GAME_CONSTANTS } from './types';

// --- Assets ---
const CHARIZARD_SPRITE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png";
const PIKACHU_SPRITE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png";

// Meme Assets
// Using reliable placeholder URLs that match the user's description
const RENE_PUENTE_IMG = "https://i1.sndcdn.com/artworks-000666037081-067272-t500x500.jpg"; // Tío René iconic
const PAPI_MICKY_IMG = "https://media.redgol.cl/2023/11/papi-micky-1.jpg"; // Papi Micky yellow shirt

// Volcano/Magma Habitat Background
const BACKGROUND_IMAGE = "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&auto=format&fit=crop";
// Pokemon Battle Theme (Hosted on Archive.org for reliability)
const BATTLE_MUSIC_URL = "https://ia800504.us.archive.org/11/items/Pocket_Monsters_Green_GB_music/10%20-%20Battle%20%28Vs.%20Wild%20Pok%C3%A9mon%29.mp3";

// --- Components ---

const GameOverlay = ({ 
  title, 
  children, 
  buttonText, 
  onAction, 
  icon 
}: { 
  title: string, 
  children?: React.ReactNode, 
  buttonText: string, 
  onAction: () => void,
  icon?: React.ReactNode
}) => (
  <motion.div 
    initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
    animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
    exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
  >
    <motion.div 
      initial={{ scale: 0.8, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      className="bg-stone-900/90 border-2 border-orange-500/50 p-8 rounded-2xl shadow-[0_0_50px_rgba(234,88,12,0.3)] max-w-lg w-full text-center text-white backdrop-blur-md relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex justify-center mb-6">
          {icon}
        </div>
        <h1 className="text-3xl md:text-4xl font-retro text-yellow-400 mb-6 drop-shadow-[2px_2px_0_rgba(180,83,9,1)] tracking-wider">
          {title}
        </h1>
        <div className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed font-light">
          {children}
        </div>
        <button 
          onClick={onAction}
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-red-600 font-retro rounded-lg hover:bg-red-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] focus:outline-none ring-offset-2 focus:ring-2 ring-red-400"
        >
          {buttonText}
          <span className="absolute -right-2 -top-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-75"></span>
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const Bird = ({ y, isHit }: { y: number, isHit: boolean }) => (
  <div 
    className="absolute z-20 transition-transform will-change-transform"
    style={{ 
      left: '10%', // Fixed horizontal position
      top: y,
      width: GAME_CONSTANTS.BIRD_SIZE,
      height: GAME_CONSTANTS.BIRD_SIZE,
      transform: `translateY(-50%) rotate(${Math.min(Math.max((y - 300) / 10, -25), 25)}deg)`, // Simple rotation based on height/velocity simulation
      filter: isHit ? 'drop-shadow(0 0 10px red) sepia(100%) saturate(500%) hue-rotate(-50deg)' : 'drop-shadow(0 0 15px rgba(255, 100, 0, 0.4))'
    }}
  >
    <img 
      src={CHARIZARD_SPRITE} 
      alt="Charizard" 
      className={`w-full h-full object-contain ${isHit ? 'animate-pulse' : ''}`}
    />
    {/* Flame tail effect - slightly adjusted for new background */}
    <div className="absolute top-1/2 -right-4 w-10 h-10 bg-orange-500 rounded-full blur-md opacity-80 animate-pulse mix-blend-screen" />
  </div>
);

const VolcanoPipe = ({ x, height, isTop }: { x: number, height: number, isTop: boolean }) => (
  <div 
    className="absolute z-10 w-[70px] bg-stone-900 border-x-4 border-stone-800 overflow-hidden shadow-2xl"
    style={{
      left: x,
      height: height,
      top: isTop ? 0 : undefined,
      bottom: isTop ? undefined : 0,
      // Lava edges
      borderBottom: isTop ? '6px solid #f97316' : 'none',
      borderTop: isTop ? 'none' : '6px solid #f97316',
      borderRadius: isTop ? '0 0 8px 8px' : '8px 8px 0 0',
    }}
  >
    {/* Rock Texture Overlay */}
    <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] mix-blend-overlay"></div>

    {/* Magma Core Effect */}
    <div className="absolute inset-x-4 inset-y-0 bg-red-900/40 flex flex-col items-center justify-around">
       <div className="w-full h-full bg-gradient-to-b from-orange-600/10 via-red-600/20 to-orange-600/10 animate-pulse"></div>
    </div>

    {/* Glow at the danger edge */}
    <div className="absolute inset-x-0 h-6 bg-orange-500 blur-md opacity-60 z-20"
         style={{ bottom: isTop ? -10 : undefined, top: isTop ? undefined : -10 }}>
    </div>

    {/* Magma/Fire particles icons */}
    <div className="relative w-full h-full flex flex-col items-center justify-center gap-12 py-4 z-10 overflow-hidden">
      <Flame className="text-orange-500/60 w-8 h-8 animate-bounce duration-[2000ms]" />
      <Flame className="text-red-500/50 w-6 h-6 animate-pulse delay-75" />
      <Flame className="text-orange-500/60 w-8 h-8 animate-bounce duration-[3000ms] delay-150" />
    </div>
    
    {/* Cracks decoration */}
    <div className="absolute top-1/4 left-1 w-8 h-0.5 bg-stone-700 rotate-12 opacity-50"></div>
    <div className="absolute bottom-1/3 right-1 w-6 h-0.5 bg-stone-700 -rotate-6 opacity-50"></div>
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  // --- State & Refs ---
  const [status, setStatus] = useState<GameStatus>('intro');
  const [renderTrigger, setRenderTrigger] = useState(0); // Force re-render for game loop
  
  // Mutable game state in refs for performance (avoiding React batching issues in 60fps loop)
  const gameState = useRef({
    birdY: 300,
    velocity: 0,
    pipes: [] as Pipe[],
    score: 0,
    lives: GAME_CONSTANTS.MAX_LIVES,
    lastFrameTime: 0,
    lastHitTime: 0,
    pipeSpawnTimer: 0,
    gameHeight: 0, // Will be set on mount
    isHit: false, // For visual feedback
  });

  const requestRef = useRef<number>();
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Audio Handling ---
  useEffect(() => {
    // Create audio object once
    audioRef.current = new Audio(BATTLE_MUSIC_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playMusic = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio play failed (interaction needed):", e));
    }
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  // --- Helpers ---
  
  const resetGame = () => {
    gameState.current = {
      birdY: window.innerHeight / 2,
      velocity: 0,
      pipes: [],
      score: 0,
      lives: GAME_CONSTANTS.MAX_LIVES,
      lastFrameTime: performance.now(),
      lastHitTime: 0,
      pipeSpawnTimer: 0,
      gameHeight: window.innerHeight,
      isHit: false,
    };
    playMusic();
    setStatus('playing');
  };

  const spawnPipe = (gameWidth: number, gameHeight: number) => {
    const minHeight = 50;
    const availableHeight = gameHeight - GAME_CONSTANTS.PIPE_GAP - (minHeight * 2);
    const randomHeight = Math.floor(Math.random() * availableHeight) + minHeight;

    const newPipe: Pipe = {
      id: Date.now(),
      x: gameWidth,
      topHeight: randomHeight,
      passed: false
    };
    gameState.current.pipes.push(newPipe);
  };

  const checkCollision = (pipe: Pipe) => {
    // Bird HITBOX (approximate)
    const birdLeft = gameAreaRef.current ? gameAreaRef.current.clientWidth * 0.1 : 100; // 10% from left
    const birdRight = birdLeft + GAME_CONSTANTS.BIRD_SIZE - 20; // Padding
    const birdTop = gameState.current.birdY + 15;
    const birdBottom = gameState.current.birdY + GAME_CONSTANTS.BIRD_SIZE - 15;

    // Pipe HITBOXES
    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + 70; // Width of VolcanoPipe

    // Check horizontal overlap
    if (birdRight > pipeLeft && birdLeft < pipeRight) {
      // Check vertical overlap (Top Pipe OR Bottom Pipe)
      if (
        birdTop < pipe.topHeight || // Hit top pipe
        birdBottom > pipe.topHeight + GAME_CONSTANTS.PIPE_GAP // Hit bottom pipe
      ) {
        return true;
      }
    }
    return false;
  };

  const handleJump = useCallback(() => {
    if (status === 'playing') {
      gameState.current.velocity = GAME_CONSTANTS.JUMP_STRENGTH;
    }
  }, [status]);

  // --- Game Loop ---

  const loop = useCallback((time: number) => {
    if (status !== 'playing') return;

    const state = gameState.current;
    const deltaTime = time - state.lastFrameTime;
    
    // 2. Physics
    state.velocity += GAME_CONSTANTS.GRAVITY;
    state.birdY += state.velocity;

    // Floor/Ceiling collision
    if (state.birdY < 0) {
      state.birdY = 0;
      state.velocity = 0;
    }
    if (state.birdY > state.gameHeight - GAME_CONSTANTS.BIRD_SIZE) {
      state.birdY = state.gameHeight - GAME_CONSTANTS.BIRD_SIZE;
      state.velocity = 0;
    }

    // 3. Pipes Management
    state.pipeSpawnTimer += 1;
    if (state.pipeSpawnTimer > GAME_CONSTANTS.PIPE_SPAWN_RATE) {
      spawnPipe(gameAreaRef.current?.clientWidth || window.innerWidth, state.gameHeight);
      state.pipeSpawnTimer = 0;
    }

    // Move pipes
    state.pipes.forEach(pipe => {
      pipe.x -= GAME_CONSTANTS.PIPE_SPEED;
    });

    // Remove off-screen pipes
    state.pipes = state.pipes.filter(pipe => pipe.x + 100 > -50);

    // 4. Scoring & Collision
    state.pipes.forEach(pipe => {
      // Increment score continuously for survival distance
      state.score += 1; 

      // Collision
      if (checkCollision(pipe)) {
        const now = performance.now();
        if (now - state.lastHitTime > GAME_CONSTANTS.COLLISION_COOLDOWN) {
          // HIT!
          state.lastHitTime = now;
          state.lives -= 1;
          state.isHit = true;

          // Game Over check
          if (state.lives <= 0) {
            stopMusic();
            setStatus('gameover');
            cancelAnimationFrame(requestRef.current!);
            return;
          }

          // Reset visual flash after 200ms
          setTimeout(() => { gameState.current.isHit = false; }, 200);
        }
      }
    });

    state.lastFrameTime = time;
    
    // Force React Render
    setRenderTrigger(prev => prev + 1);
    
    requestRef.current = requestAnimationFrame(loop);
  }, [status]);

  // --- Effects ---

  // Key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault(); // Stop scrolling
        if (status === 'intro' || status === 'gameover') {
            // Optional: Start on spacebar if in menu?
        } else {
            handleJump();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump, status]);

  // Start/Stop Loop
  useEffect(() => {
    if (status === 'playing') {
      gameState.current.gameHeight = window.innerHeight;
      gameState.current.lastFrameTime = performance.now();
      requestRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [status, loop]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      gameState.current.gameHeight = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Render Helpers ---

  const getEndContent = (score: number) => {
    if (score > 3000) return {
      title: "¡Nunca sapo, siempre vío!",
      subtitle: "¡Te fuiste en volá! El tío René estaría orgulloso.",
      img: RENE_PUENTE_IMG
    };
    if (score > 1000) return {
      title: "¡Creeeeo que soy el Papi Micky!",
      subtitle: "¡Coñoooo! Salvaste el semestre, manito.",
      img: PAPI_MICKY_IMG
    };
    if (score > 500) return {
      title: "¡Te falta calle!",
      subtitle: "Despertaron los leones... pero tú no.",
      img: CHARIZARD_SPRITE
    };
    return {
      title: "¡Andai puro dando jugo!",
      subtitle: "¡Pa' la casa! Chao con los giles.",
      img: CHARIZARD_SPRITE
    };
  };

  const endContent = getEndContent(gameState.current.score);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900 select-none font-sans">
      {/* Background Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 opacity-100"
        style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}
      />
      {/* Overlay to darken and tint the background for better contrast */}
      <div className="absolute inset-0 bg-orange-900/20 mix-blend-multiply z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none" />

      {/* Game Area */}
      <div ref={gameAreaRef} className="relative z-10 w-full h-full">
        
        {/* HIT FLASH EFFECT */}
        {gameState.current.isHit && (
           <div className="absolute inset-0 bg-red-600/50 z-50 pointer-events-none animate-ping" />
        )}

        {/* HUD */}
        {status !== 'intro' && (
          <div className="absolute top-4 left-0 right-0 flex justify-between px-8 z-40 pointer-events-none">
            {/* Lives HUD */}
            <div className="flex items-center gap-2">
              <div className={`p-3 rounded-xl border-2 flex items-center gap-2 shadow-lg transition-colors duration-300 ${gameState.current.lives === 1 ? 'bg-red-900/80 border-red-500 animate-pulse' : 'bg-stone-900/80 border-red-500'}`}>
                {Array.from({ length: GAME_CONSTANTS.MAX_LIVES }).map((_, i) => (
                  <Heart 
                    key={i} 
                    className={`w-8 h-8 ${i < gameState.current.lives ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} 
                  />
                ))}
              </div>
            </div>
            
            {/* Score HUD */}
            <div className="flex items-center gap-2">
              <div className="p-3 bg-stone-900/90 rounded-xl border-2 border-yellow-500 flex items-center gap-3 shadow-lg">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <span className="text-2xl font-mono font-bold text-yellow-400">
                  {gameState.current.score}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Entities */}
        <Bird y={gameState.current.birdY} isHit={gameState.current.isHit} />

        {gameState.current.pipes.map(pipe => (
          <React.Fragment key={pipe.id}>
            <VolcanoPipe x={pipe.x} height={pipe.topHeight} isTop={true} />
            <VolcanoPipe 
              x={pipe.x} 
              height={gameState.current.gameHeight - pipe.topHeight - GAME_CONSTANTS.PIPE_GAP} 
              isTop={false} 
            />
          </React.Fragment>
        ))}
        
        {/* Ground visuals (Lava floor) */}
        <div className="absolute bottom-0 w-full h-4 bg-gradient-to-t from-red-600 to-orange-500 z-30 opacity-80 animate-pulse shadow-[0_0_30px_rgba(234,88,12,0.8)]" />
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {status === 'intro' && (
          <GameOverlay 
            title="¡Ayuda a Charizard!" 
            buttonText="¡A VOLAR!" 
            onAction={resetGame}
            icon={
              <img src={PIKACHU_SPRITE} alt="Pikachu" className="w-32 h-32 object-contain drop-shadow-2xl animate-bounce" />
            }
          >
            <div className="space-y-4">
              <p>Charizard está atrapado en un volcán infinito.</p>
              <div className="flex flex-col gap-2 bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-1 bg-gray-700 rounded border-b-2 border-gray-500 font-mono text-sm">ESPACIO</kbd>
                  <span>para impulsarte hacia arriba</span>
                </div>
                <div className="flex items-center gap-3">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span>Esquiva las <span className="text-orange-400 font-bold">columnas de magma</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>¡Tienes <span className="text-red-400 font-bold">2 vidas</span>!</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                  <Music className="w-4 h-4" />
                  <span>Incluye música de batalla</span>
                </div>
              </div>
              <p className="text-sm text-red-300 italic">Si chocas 2 veces, pierdes.</p>
            </div>
          </GameOverlay>
        )}

        {status === 'gameover' && (
          <GameOverlay 
            title={endContent.title} 
            buttonText="JUGAR DE NUEVO" 
            onAction={resetGame}
            icon={
              <div className="relative flex justify-center items-center">
                 <div className="w-40 h-40 rounded-full border-4 border-orange-500 shadow-[0_0_30px_rgba(234,88,12,0.8)] overflow-hidden bg-black/50">
                    <img 
                      src={endContent.img} 
                      alt="Meme" 
                      className="w-full h-full object-cover sepia-[.3] contrast-125 hover:scale-110 transition-transform duration-500" 
                    />
                 </div>
                 {/* Visual decoration overlay */}
                 <div className="absolute -bottom-2 -right-2 text-4xl animate-bounce">🔥</div>
              </div>
            }
          >
             <div className="space-y-2">
               <h3 className="text-2xl text-yellow-400 font-bold font-retro">{gameState.current.score} Puntos</h3>
               <p className="text-xl italic text-gray-300">"{endContent.subtitle}"</p>
               <div className="mt-4 pt-4 border-t border-white/10 text-sm text-gray-400">
                 ¡Se te acabó la vida, manito!
               </div>
             </div>
          </GameOverlay>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;