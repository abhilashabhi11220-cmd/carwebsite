import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { audioEngine } from '../utils/audioEngine';
import { 
  Play, RotateCcw, Volume2, VolumeX, Trophy, Zap, 
  Gauge, Shield, ArrowRight, Flame, Sparkles 
} from 'lucide-react';

interface Obstacle {
  x: number; // -1 to 1 (road relative)
  y: number; // Distance ahead in world units (0 to 1000)
  type: 'traffic-car' | 'rock' | 'boost';
  lane: number;
  width: number;
  speed: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
}

export const GamePage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Game UI State
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('spettacolo_high_score') || '0', 10);
  });
  const [speedKmh, setSpeedKmh] = useState(0);
  const [nitro, setNitro] = useState(100);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [gear, setGear] = useState('1');
  const [isAudioOn, setIsAudioOn] = useState(true);

  // Key tracking
  const keys = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
    nitro: false,
  });

  // Game engine internal physics
  const stateRef = useRef({
    playerX: 0, // -1 (left road boundary) to +1 (right road boundary)
    playerSpeed: 0, // 0 to 120 (world units/sec)
    maxSpeed: 100, // ~350 km/h
    distance: 0,
    nitroAmount: 100,
    isNitroActive: false,
    obstacles: [] as Obstacle[],
    particles: [] as Particle[],
    roadCurve: 0,
    targetRoadCurve: 0,
    curveTimer: 0,
    scoreCount: 0,
    gameOver: false,
  });

  // Start / Restart Game
  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.playerX = 0;
    s.playerSpeed = 20;
    s.distance = 0;
    s.nitroAmount = 100;
    s.isNitroActive = false;
    s.obstacles = [];
    s.particles = [];
    s.roadCurve = 0;
    s.targetRoadCurve = 0;
    s.curveTimer = 0;
    s.scoreCount = 0;
    s.gameOver = false;

    // Spawn initial obstacles spread out
    for (let i = 0; i < 6; i++) {
      s.obstacles.push({
        x: (Math.random() - 0.5) * 1.5,
        y: 300 + i * 180,
        type: Math.random() > 0.3 ? 'traffic-car' : Math.random() > 0.5 ? 'boost' : 'rock',
        lane: Math.floor(Math.random() * 3),
        width: 0.28,
        speed: 15 + Math.random() * 20,
      });
    }

    if (isAudioOn && !audioEngine.getIsRunning()) {
      audioEngine.startEngine();
    }

    setGameState('playing');
  }, [isAudioOn]);

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.current.right = true;
      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.current.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.current.down = true;
      if (e.code === 'Space' || e.code === 'ShiftLeft') keys.current.nitro = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.current.right = false;
      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.current.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.current.down = false;
      if (e.code === 'Space' || e.code === 'ShiftLeft') keys.current.nitro = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 600;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const loop = (currentTime: number) => {
      animId = requestAnimationFrame(loop);
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      const s = stateRef.current;
      const k = keys.current;
      const W = canvas.width;
      const H = canvas.height;

      // -------------------------------------------------------------
      // 1. GAMEPLAY PHYSICS (Only when playing)
      // -------------------------------------------------------------
      if (gameState === 'playing' && !s.gameOver) {
        // Curve generator
        s.curveTimer -= dt;
        if (s.curveTimer <= 0) {
          s.targetRoadCurve = (Math.random() - 0.5) * 1.6;
          s.curveTimer = 2.5 + Math.random() * 3.5;
        }
        s.roadCurve += (s.targetRoadCurve - s.roadCurve) * dt * 1.5;

        // Nitro boost mechanics
        s.isNitroActive = k.nitro && s.nitroAmount > 0;
        if (s.isNitroActive) {
          s.nitroAmount = Math.max(0, s.nitroAmount - dt * 25);
        } else {
          s.nitroAmount = Math.min(100, s.nitroAmount + dt * 4); // Slow recharge
        }

        const maxSpd = s.isNitroActive ? 125 : s.maxSpeed;
        const accel = s.isNitroActive ? 45 : 28;
        const brake = 50;

        // Acceleration & Braking
        if (k.up) {
          s.playerSpeed = Math.min(maxSpd, s.playerSpeed + accel * dt);
        } else if (k.down) {
          s.playerSpeed = Math.max(10, s.playerSpeed - brake * dt);
        } else {
          s.playerSpeed = Math.max(25, s.playerSpeed - 12 * dt); // Natural roll
        }

        // Steering & Centrifugal curve pull
        const steerSpeed = 1.6 * (s.playerSpeed / 70);
        if (k.left) s.playerX -= steerSpeed * dt;
        if (k.right) s.playerX += steerSpeed * dt;

        // Curve inertia pulls car outward
        s.playerX -= s.roadCurve * (s.playerSpeed / 110) * dt * 0.7;

        // Road boundaries (-1.1 to +1.1)
        if (Math.abs(s.playerX) > 1.0) {
          // Off road dirt slowdown & dust
          s.playerSpeed = Math.max(15, s.playerSpeed - 40 * dt);
          if (Math.abs(s.playerX) > 1.35) {
            s.playerX = Math.sign(s.playerX) * 1.35;
          }
        }

        // Distance & score
        s.distance += s.playerSpeed * dt * 3.5;
        s.scoreCount += Math.round(s.playerSpeed * dt * (s.isNitroActive ? 15 : 8));

        // Sound audio feedback
        const currentRpm = 1200 + (s.playerSpeed / 125) * 7300;
        audioEngine.setRpm(currentRpm);

        // Spawn dust/exhaust particles
        if (Math.random() > 0.2) {
          s.particles.push({
            x: s.playerX - 0.08 + (Math.random() - 0.5) * 0.04,
            y: 0,
            vx: -s.roadCurve * 0.5 + (Math.random() - 0.5) * 0.4,
            vy: -s.playerSpeed * 0.8,
            alpha: 0.8,
            size: s.isNitroActive ? 6 : 4,
            color: s.isNitroActive ? '#38bdf8' : Math.abs(s.playerX) > 0.95 ? '#d97706' : '#94a3b8',
          });
          s.particles.push({
            x: s.playerX + 0.08 + (Math.random() - 0.5) * 0.04,
            y: 0,
            vx: -s.roadCurve * 0.5 + (Math.random() - 0.5) * 0.4,
            vy: -s.playerSpeed * 0.8,
            alpha: 0.8,
            size: s.isNitroActive ? 6 : 4,
            color: s.isNitroActive ? '#38bdf8' : Math.abs(s.playerX) > 0.95 ? '#d97706' : '#94a3b8',
          });
        }

        // Obstacles movement & collision detection
        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          const obs = s.obstacles[i];
          // Move obstacle towards player as player travels forward
          obs.y -= (s.playerSpeed - (obs.type === 'traffic-car' ? obs.speed : 0)) * dt * 2.8;

          // Check collision with player car
          const inYRange = obs.y < 28 && obs.y > -8;
          const inXRange = Math.abs(obs.x - s.playerX) < 0.22;

          if (inYRange && inXRange) {
            if (obs.type === 'boost') {
              // Collected Nitro Boost canister!
              s.nitroAmount = Math.min(100, s.nitroAmount + 40);
              s.scoreCount += 1500;
              audioEngine.playExhaustPop();
              s.obstacles.splice(i, 1);
              continue;
            } else {
              // Crash!
              s.gameOver = true;
              audioEngine.playExhaustPop();
              setGameState('gameover');
              if (s.scoreCount > highScore) {
                setHighScore(s.scoreCount);
                localStorage.setItem('spettacolo_high_score', String(s.scoreCount));
              }
              break;
            }
          }

          // Respawn obstacle ahead when it falls behind player
          if (obs.y < -30) {
            obs.y = 800 + Math.random() * 400;
            obs.x = (Math.random() - 0.5) * 1.6;
            obs.type = Math.random() > 0.35 ? 'traffic-car' : Math.random() > 0.45 ? 'boost' : 'rock';
          }
        }

        // Update telemetry states
        const actualKmh = Math.round(s.playerSpeed * 3.0);
        setSpeedKmh(actualKmh);
        setDistanceMeters(Math.round(s.distance));
        setNitro(Math.round(s.nitroAmount));
        setScore(s.scoreCount);

        let g = '1';
        if (actualKmh > 290) g = '7';
        else if (actualKmh > 230) g = '6';
        else if (actualKmh > 180) g = '5';
        else if (actualKmh > 130) g = '4';
        else if (actualKmh > 80) g = '3';
        else if (actualKmh > 40) g = '2';
        setGear(g);
      }

      // -------------------------------------------------------------
      // 2. CANVAS RENDERING (Retro Pseudo-3D Desert Canyon Highway)
      // -------------------------------------------------------------
      ctx.clearRect(0, 0, W, H);

      // Sky gradient (Sierra Sunset orange / twilight)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.45);
      skyGrad.addColorStop(0, '#0c1020');
      skyGrad.addColorStop(0.6, '#9a3412');
      skyGrad.addColorStop(1, '#f97316');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H * 0.45);

      // Distant Canyon Mountain Ridges
      const horizonY = H * 0.44;
      ctx.fillStyle = '#431407';
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      for (let x = 0; x <= W; x += 40) {
        const peak = Math.sin(x * 0.008 + s.distance * 0.0004) * 45 + Math.cos(x * 0.02) * 20;
        ctx.lineTo(x, horizonY - 40 - peak);
      }
      ctx.lineTo(W, horizonY);
      ctx.closePath();
      ctx.fill();

      // Desert Ground plane (Brown dirt canyon bed)
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, horizonY, W, H - horizonY);

      // Projected Canyon Road surface (Perspective trapezoid)
      const roadBottomW = W * 0.72;
      const roadTopW = W * 0.08;
      const roadCenterX = W * 0.5 + s.roadCurve * W * 0.22;

      ctx.fillStyle = '#1e2330'; // Dark asphalt
      ctx.beginPath();
      ctx.moveTo(roadCenterX - roadTopW / 2, horizonY);
      ctx.lineTo(roadCenterX + roadTopW / 2, horizonY);
      ctx.lineTo(W * 0.5 + roadBottomW / 2, H);
      ctx.lineTo(W * 0.5 - roadBottomW / 2, H);
      ctx.closePath();
      ctx.fill();

      // Road Red/White Curbs / Rumble Strips
      const segments = 16;
      for (let i = 0; i < segments; i++) {
        const p1 = i / segments;
        const p2 = (i + 1) / segments;
        const y1 = horizonY + Math.pow(p1, 2) * (H - horizonY);
        const y2 = horizonY + Math.pow(p2, 2) * (H - horizonY);

        const w1 = roadTopW + (roadBottomW - roadTopW) * Math.pow(p1, 2);
        const w2 = roadTopW + (roadBottomW - roadTopW) * Math.pow(p2, 2);

        const x1 = roadCenterX + (W * 0.5 - roadCenterX) * p1;
        const x2 = roadCenterX + (W * 0.5 - roadCenterX) * p2;

        const isAlt = (Math.floor(s.distance * 0.2) + i) % 2 === 0;

        // Left curb
        ctx.fillStyle = isAlt ? '#ef4444' : '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(x1 - w1 / 2 - 12 * p1, y1);
        ctx.lineTo(x1 - w1 / 2, y1);
        ctx.lineTo(x2 - w2 / 2, y2);
        ctx.lineTo(x2 - w2 / 2 - 12 * p2, y2);
        ctx.closePath();
        ctx.fill();

        // Right curb
        ctx.beginPath();
        ctx.moveTo(x1 + w1 / 2, y1);
        ctx.lineTo(x1 + w1 / 2 + 12 * p1, y1);
        ctx.lineTo(x2 + w2 / 2 + 12 * p2, y2);
        ctx.lineTo(x2 + w2 / 2, y2);
        ctx.closePath();
        ctx.fill();

        // Center double yellow line stripes
        if (isAlt) {
          ctx.fillStyle = '#f59e0b';
          const lineW = 3 * p2 + 1;
          ctx.fillRect(x1 - lineW - 2, y1, lineW, y2 - y1);
          ctx.fillRect(x1 + 2, y1, lineW, y2 - y1);
        }
      }

      // Draw Obstacles (Traffic cars, rock boulders, boost canisters)
      const sortedObstacles = [...s.obstacles].sort((a, b) => b.y - a.y);
      for (const obs of sortedObstacles) {
        if (obs.y > 600 || obs.y < 0) continue;
        const depth = 1 - obs.y / 600; // 0 (horizon) to 1 (near)
        const curY = horizonY + Math.pow(depth, 2) * (H - horizonY);
        const curRoadW = roadTopW + (roadBottomW - roadTopW) * Math.pow(depth, 2);
        const curRoadCenter = roadCenterX + (W * 0.5 - roadCenterX) * depth;
        const curX = curRoadCenter + (obs.x * curRoadW * 0.42);

        const objSize = (35 + depth * 75);

        if (obs.type === 'boost') {
          // Glowing Blue Nitro canister
          ctx.fillStyle = '#0284c7';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(curX, curY - objSize * 0.3, objSize * 0.25, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(10, Math.round(objSize * 0.2))}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText('⚡N2O', curX, curY - objSize * 0.25);
        } else if (obs.type === 'rock') {
          // Canyon Rock / Boulder
          ctx.fillStyle = '#57534e';
          ctx.beginPath();
          ctx.ellipse(curX, curY - objSize * 0.2, objSize * 0.35, objSize * 0.22, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#78716c';
          ctx.beginPath();
          ctx.ellipse(curX - 4, curY - objSize * 0.24, objSize * 0.2, objSize * 0.12, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Traffic Car (Challenger / Coupe silhouette)
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(curX - objSize * 0.45, curY - objSize * 0.38, objSize * 0.9, objSize * 0.36);
          // Cabin glass
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(curX - objSize * 0.32, curY - objSize * 0.52, objSize * 0.64, objSize * 0.18);
          // Red glowing taillights
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 8;
          ctx.fillRect(curX - objSize * 0.4, curY - objSize * 0.22, objSize * 0.2, objSize * 0.08);
          ctx.fillRect(curX + objSize * 0.2, curY - objSize * 0.22, objSize * 0.2, objSize * 0.08);
          ctx.shadowBlur = 0;
        }
      }

      // Draw Particles (Dust trails & exhaust flames)
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.alpha -= dt * 1.6;
        p.y += p.vy * dt;
        p.x += p.vx * dt;

        if (p.alpha <= 0) {
          s.particles.splice(i, 1);
          continue;
        }

        const screenPX = W * 0.5 + (p.x * roadBottomW * 0.48);
        const screenPY = H - 65 - p.y;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(screenPX, screenPY, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // -------------------------------------------------------------
      // 3. DRAW PLAYER SUPERCAR (Arancio SVJ Orange Supercar rear view)
      // -------------------------------------------------------------
      const playerScreenX = W * 0.5 + (s.playerX * roadBottomW * 0.45);
      const playerScreenY = H - 65;
      const carW = 140;
      const carH = 75;

      // Drop shadow underneath tires
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath();
      ctx.ellipse(playerScreenX, playerScreenY + carH * 0.42, carW * 0.55, carH * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wide rear tires
      ctx.fillStyle = '#18181b';
      ctx.fillRect(playerScreenX - carW * 0.52, playerScreenY + carH * 0.08, carW * 0.22, carH * 0.38);
      ctx.fillRect(playerScreenX + carW * 0.3, playerScreenY + carH * 0.08, carW * 0.22, carH * 0.38);

      // Low rear carbon diffuser
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(playerScreenX - carW * 0.44, playerScreenY + carH * 0.2, carW * 0.88, carH * 0.25);

      // Titanium dual central high-mount exhaust pipes
      ctx.fillStyle = s.isNitroActive ? '#38bdf8' : '#e2e8f0';
      ctx.beginPath();
      ctx.arc(playerScreenX - 14, playerScreenY + carH * 0.18, 9, 0, Math.PI * 2);
      ctx.arc(playerScreenX + 14, playerScreenY + carH * 0.18, 9, 0, Math.PI * 2);
      ctx.fill();

      // Exhaust flame burst on Nitro or high throttle
      if (s.isNitroActive) {
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(playerScreenX - 14, playerScreenY + carH * 0.25);
        ctx.lineTo(playerScreenX - 20, playerScreenY + carH * 0.7);
        ctx.lineTo(playerScreenX - 8, playerScreenY + carH * 0.7);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(playerScreenX + 14, playerScreenY + carH * 0.25);
        ctx.lineTo(playerScreenX + 8, playerScreenY + carH * 0.7);
        ctx.lineTo(playerScreenX + 20, playerScreenY + carH * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Main Muscular Rear Bodywork (Iconic Pearlescent Orange)
      ctx.fillStyle = '#f95700'; // Arancio Atlas
      ctx.beginPath();
      ctx.moveTo(playerScreenX - carW * 0.48, playerScreenY + carH * 0.15);
      ctx.lineTo(playerScreenX - carW * 0.44, playerScreenY - carH * 0.1);
      ctx.lineTo(playerScreenX - carW * 0.28, playerScreenY - carH * 0.25);
      ctx.lineTo(playerScreenX + carW * 0.28, playerScreenY - carH * 0.25);
      ctx.lineTo(playerScreenX + carW * 0.44, playerScreenY - carH * 0.1);
      ctx.lineTo(playerScreenX + carW * 0.48, playerScreenY + carH * 0.15);
      ctx.closePath();
      ctx.fill();

      // Slanted rear louvers & tinted engine glass
      ctx.fillStyle = '#090a0f';
      ctx.beginPath();
      ctx.moveTo(playerScreenX - carW * 0.26, playerScreenY - carH * 0.25);
      ctx.lineTo(playerScreenX - carW * 0.2, playerScreenY - carH * 0.58);
      ctx.lineTo(playerScreenX + carW * 0.2, playerScreenY - carH * 0.58);
      ctx.lineTo(playerScreenX + carW * 0.26, playerScreenY - carH * 0.25);
      ctx.closePath();
      ctx.fill();

      // Iconic Y-shaped rear LED taillights (Glowing neon red)
      ctx.fillStyle = '#ff0033';
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 10;
      // Left Y-light
      ctx.fillRect(playerScreenX - carW * 0.42, playerScreenY - carH * 0.05, carW * 0.16, 4);
      // Right Y-light
      ctx.fillRect(playerScreenX + carW * 0.26, playerScreenY - carH * 0.05, carW * 0.16, 4);
      ctx.shadowBlur = 0;

      // Active Aerodynamic Carbon Rear Wing (ALA 2.0 Wing Blade)
      ctx.fillStyle = '#090a0f';
      ctx.fillRect(playerScreenX - carW * 0.54, playerScreenY - carH * 0.5, carW * 1.08, 7);
      // Wing struts
      ctx.fillRect(playerScreenX - carW * 0.22, playerScreenY - carH * 0.5, 4, carH * 0.3);
      ctx.fillRect(playerScreenX + carW * 0.22, playerScreenY - carH * 0.5, 4, carH * 0.3);
      // Central ALA spine pylon
      ctx.fillRect(playerScreenX - 4, playerScreenY - carH * 0.5, 8, carH * 0.35);

      // Speed blur speedlines on edges when fast
      if (s.playerSpeed > 85) {
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
          const ly = Math.random() * H;
          ctx.beginPath();
          ctx.moveTo(Math.random() * 40, ly);
          ctx.lineTo(Math.random() * 90 + 40, ly);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(W - Math.random() * 40, ly);
          ctx.lineTo(W - Math.random() * 90 - 40, ly);
          ctx.stroke();
        }
      }
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [gameState, highScore]);

  // Audio Toggle
  const handleToggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    audioEngine.toggleMute();
  };

  return (
    <div className="relative w-full h-[calc(100vh-4.5rem)] bg-[#090a0f] text-slate-100 flex flex-col justify-between overflow-hidden">
      {/* 2D Canvas Viewport */}
      <div className="absolute inset-0 z-0">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Top HUD: Speed, Score, Gear & Nitro */}
      <div className="relative z-10 pt-4 px-4 md:px-8 max-w-7xl mx-auto w-full pointer-events-none flex flex-wrap items-center justify-between gap-4">
        {/* Game Title & Score */}
        <div className="pointer-events-auto bg-black/75 backdrop-blur-xl border border-white/15 px-4 py-2.5 rounded-2xl flex items-center gap-4 shadow-xl">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff5500] animate-pulse" />
              <span>Sierra Canyon Sprint</span>
            </div>
            <div className="text-xl md:text-2xl font-black text-white font-mono tabular-nums">
              {score.toLocaleString()}{' '}
              <span className="text-xs text-[#ff5500] font-sans font-bold">PTS</span>
            </div>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">High Score</div>
            <div className="text-sm md:text-base font-bold text-amber-400 font-mono tabular-nums">
              {highScore.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Speedometer & Gear HUD */}
        <div className="pointer-events-auto bg-black/75 backdrop-blur-xl border border-white/15 px-5 py-2.5 rounded-2xl flex items-center gap-6 shadow-xl">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl md:text-4xl font-black text-white font-mono tabular-nums tracking-tighter">
              {speedKmh}
            </span>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-bold text-[#ff5500] font-display">KM/H</span>
              <span className="text-[9px] text-slate-400">
                {Math.round(speedKmh * 0.621)} MPH
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[9px] text-slate-400 uppercase">GEAR</span>
            <span className="px-2 py-0.5 bg-[#ff5500] text-white font-black rounded text-xs font-mono">
              {gear}
            </span>
          </div>

          {/* Nitro Gauge Bar */}
          <div className="w-24 sm:w-32 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-semibold">
              <span className="text-cyan-400 flex items-center gap-1">
                <Flame className="w-3 h-3" />
                <span>NITRO</span>
              </span>
              <span className="font-mono text-white">{nitro}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 p-0.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-75 shadow-sm shadow-cyan-400"
                style={{ width: `${nitro}%` }}
              />
            </div>
          </div>

          {/* Audio toggle */}
          <button
            type="button"
            onClick={handleToggleAudio}
            className={`p-2 rounded-lg text-xs transition-colors ${
              isAudioOn ? 'bg-[#ff5500] text-white' : 'bg-white/10 text-slate-400'
            }`}
            title="Toggle Engine Audio"
          >
            {isAudioOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Start / Game Over Overlays */}
      {gameState === 'menu' && (
        <div className="relative z-20 m-auto max-w-md w-full p-6 md:p-8 bg-[#0e111a]/95 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#ff5500]/15 border border-[#ff5500]/30 flex items-center justify-center text-[#ff5500]">
            <Gauge className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#ff5500]">
              Arcade Canyon Rush
            </span>
            <h2 className="text-3xl font-black uppercase text-white font-display mt-1 tracking-tight">
              Spettacolo SVJ Sprint
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Dodge traffic and mountain boulders, collect Nitro canisters, and sustain 350+ km/h through high-speed canyon curves.
            </p>
          </div>

          <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300 space-y-1.5 text-left">
            <div className="flex justify-between">
              <span className="text-slate-400">Steer Left / Right:</span>
              <span className="font-mono text-white">A / D or ← / →</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Accelerate / Brake:</span>
              <span className="font-mono text-white">W / S or ↑ / ↓</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Nitro Boost (Supercharge):</span>
              <span className="font-mono text-[#ff5500] font-bold">SPACEBAR / SHIFT</span>
            </div>
          </div>

          <button
            type="button"
            onClick={startGame}
            className="w-full py-3.5 bg-[#ff5500] hover:bg-[#ff661a] text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-xl shadow-[#ff5500]/30 flex items-center justify-center gap-2 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Canyon Run</span>
          </button>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="relative z-20 m-auto max-w-md w-full p-6 md:p-8 bg-[#0e111a]/95 backdrop-blur-2xl border border-rose-500/30 rounded-3xl shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-500">
            <Zap className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-rose-400">
              Run Terminated
            </span>
            <h2 className="text-3xl font-black uppercase text-white font-display mt-1">
              Collision On Pass
            </h2>
            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Final Score</div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">
                  {score.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Distance Traveled</div>
                <div className="text-xl font-bold font-mono text-[#ff5500] mt-0.5">
                  {(distanceMeters / 1000).toFixed(2)} km
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={startGame}
              className="flex-1 py-3 bg-[#ff5500] hover:bg-[#ff661a] text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg shadow-[#ff5500]/30 flex items-center justify-center gap-2 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Sprint</span>
            </button>

            <Link
              to="/configurator"
              className="py-3 px-4 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition-colors border border-white/15"
            >
              Customize
            </Link>
          </div>
        </div>
      )}

      {/* Bottom HUD: Mobile On-Screen Controls */}
      <div className="relative z-10 pb-6 px-4 md:px-8 max-w-5xl mx-auto w-full pointer-events-none">
        {/* Mobile Touch Controls */}
        <div className="md:hidden flex items-end justify-between pointer-events-auto">
          {/* Steering */}
          <div className="flex gap-2">
            <button
              type="button"
              onTouchStart={() => { keys.current.left = true; }}
              onTouchEnd={() => { keys.current.left = false; }}
              className="w-14 h-14 bg-black/70 border border-white/20 rounded-2xl flex items-center justify-center text-white text-2xl active:bg-[#ff5500]"
            >
              ←
            </button>
            <button
              type="button"
              onTouchStart={() => { keys.current.right = true; }}
              onTouchEnd={() => { keys.current.right = false; }}
              className="w-14 h-14 bg-black/70 border border-white/20 rounded-2xl flex items-center justify-center text-white text-2xl active:bg-[#ff5500]"
            >
              →
            </button>
          </div>

          {/* Gas & Nitro */}
          <div className="flex gap-2">
            <button
              type="button"
              onTouchStart={() => { keys.current.nitro = true; }}
              onTouchEnd={() => { keys.current.nitro = false; }}
              className="w-14 h-14 bg-cyan-600/80 border border-cyan-400 rounded-2xl flex items-center justify-center text-white font-bold text-xs active:bg-cyan-500"
            >
              N2O
            </button>
            <button
              type="button"
              onTouchStart={() => { keys.current.up = true; }}
              onTouchEnd={() => { keys.current.up = false; }}
              className="w-16 h-16 bg-[#ff5500] border border-[#ff5500] rounded-2xl flex items-center justify-center text-white font-bold active:scale-95 shadow-lg shadow-[#ff5500]/30"
            >
              GAS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
