import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { createSupercarModel, CarConfig, SupercarInstance } from './SupercarModel';
import { audioEngine } from '../../utils/audioEngine';

interface CanyonDriveCanvasProps {
  carConfig: CarConfig;
  timeOfDay?: 'sunset' | 'noon' | 'night';
  className?: string;
  onTelemetryUpdate?: (telemetry: {
    speedKmh: number;
    rpm: number;
    gear: string;
    lateralG: number;
    throttle: number;
  }) => void;
}

export const CanyonDriveCanvas: React.FC<CanyonDriveCanvasProps> = ({
  carConfig,
  timeOfDay = 'sunset',
  className = 'w-full h-full',
  onTelemetryUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [cameraMode, setCameraMode] = useState<'chase' | 'hood' | 'drone'>('chase');
  const [isAudioActive, setIsAudioActive] = useState(false);

  // Key state tracking
  const keys = useRef<{
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    handbrake: boolean;
  }>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    handbrake: false,
  });

  // Physical car state
  const physics = useRef({
    posX: 0,
    posZ: 0,
    heading: 0, // radians
    speed: 0, // meters per second
    steerAngle: 0,
    rpm: 800,
    gear: 1,
    throttle: 0,
    lateralG: 0,
    wheelRotation: 0,
  });

  // Toggle Audio
  const handleToggleEngine = useCallback(() => {
    if (audioEngine.getIsRunning()) {
      audioEngine.stopEngine();
      setIsAudioActive(false);
    } else {
      audioEngine.startEngine();
      setIsAudioActive(true);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        keys.current.forward = true;
        if (!audioEngine.getIsRunning()) {
          audioEngine.startEngine();
          setIsAudioActive(true);
        }
      }
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.current.backward = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.current.right = true;
      if (e.code === 'Space') keys.current.handbrake = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.current.forward = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.current.backward = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.current.right = false;
      if (e.code === 'Space') keys.current.handbrake = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      audioEngine.stopEngine();
    };
  }, []);

  // Three.js Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();

    // Canyon Lighting & Atmosphere based on time of day
    let skyColor = 0xf97316; // Sunset orange matching video
    let groundColor = 0x78350f;
    let fogDensity = 0.0055;
    let sunIntensity = 2.8;

    if (timeOfDay === 'sunset') {
      skyColor = 0xfb923c;
      groundColor = 0xb45309;
      scene.background = new THREE.Color(0xfdba74);
      scene.fog = new THREE.FogExp2(0xfb923c, 0.005);
    } else if (timeOfDay === 'noon') {
      skyColor = 0x38bdf8;
      scene.background = new THREE.Color(0xbae6fd);
      scene.fog = new THREE.FogExp2(0xe2e8f0, 0.004);
      sunIntensity = 3.2;
    } else {
      skyColor = 0x0f172a;
      scene.background = new THREE.Color(0x020617);
      scene.fog = new THREE.FogExp2(0x090d16, 0.008);
      sunIntensity = 0.5;
    }

    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 800);
    camera.position.set(0, 3, -7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Ambient light
    const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, 0.85);
    scene.add(hemiLight);

    // Sunlight (warm directional)
    const sunLight = new THREE.DirectionalLight(0xffedd5, sunIntensity);
    sunLight.position.set(60, 90, 80);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0003;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 300;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    scene.add(sunLight);

    // -----------------------------------------------------------
    // CANYON ENVIRONMENT & ROAD GENERATION
    // -----------------------------------------------------------
    const roadGroup = new THREE.Group();
    const roadWidth = 14;
    const roadSegments = 160;
    const segmentLength = 8;
    const totalRoadLength = roadSegments * segmentLength;

    // Endless canyon terrain
    const terrainGeo = new THREE.PlaneGeometry(360, totalRoadLength, 48, 120);
    // Displace vertices to create canyon mountain peaks on both sides
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i); // This is along the road
      const distFromRoad = Math.abs(vx);
      if (distFromRoad > roadWidth * 0.7) {
        const cliffHeight = Math.pow((distFromRoad - roadWidth * 0.7) / 20, 1.6) * 14;
        const noise = Math.sin(vx * 0.1) * Math.cos(vy * 0.05) * 6;
        pos.setZ(i, cliffHeight + noise);
      } else {
        pos.setZ(i, 0); // Flat asphalt corridor
      }
    }
    terrainGeo.computeVertexNormals();

    const rockMat = new THREE.MeshStandardMaterial({
      color: timeOfDay === 'sunset' ? 0xc2410c : 0x78716c,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, rockMat);
    terrainMesh.rotation.x = -Math.PI / 2;
    terrainMesh.position.set(0, 0, -totalRoadLength / 2 + 100);
    terrainMesh.receiveShadow = true;
    roadGroup.add(terrainMesh);

    // High quality asphalt road surface
    const asphaltGeo = new THREE.PlaneGeometry(roadWidth, totalRoadLength);
    const asphaltMat = new THREE.MeshStandardMaterial({
      color: 0x1f242e,
      roughness: 0.75,
      metalness: 0.15,
    });
    const asphalt = new THREE.Mesh(asphaltGeo, asphaltMat);
    asphalt.rotation.x = -Math.PI / 2;
    asphalt.position.set(0, 0.02, -totalRoadLength / 2 + 100);
    asphalt.receiveShadow = true;
    roadGroup.add(asphalt);

    // Yellow double center line divider
    const centerLineGeo = new THREE.PlaneGeometry(0.2, totalRoadLength);
    const centerLineMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const lineLeft = new THREE.Mesh(centerLineGeo, centerLineMat);
    lineLeft.rotation.x = -Math.PI / 2;
    lineLeft.position.set(-0.25, 0.04, -totalRoadLength / 2 + 100);

    const lineRight = new THREE.Mesh(centerLineGeo, centerLineMat);
    lineRight.rotation.x = -Math.PI / 2;
    lineRight.position.set(0.25, 0.04, -totalRoadLength / 2 + 100);
    roadGroup.add(lineLeft, lineRight);

    // White outer road shoulder lines
    const shoulderGeo = new THREE.PlaneGeometry(0.25, totalRoadLength);
    const shoulderMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
    const shoulderLeft = new THREE.Mesh(shoulderGeo, shoulderMat);
    shoulderLeft.rotation.x = -Math.PI / 2;
    shoulderLeft.position.set(-roadWidth / 2 + 0.8, 0.04, -totalRoadLength / 2 + 100);

    const shoulderRight = new THREE.Mesh(shoulderGeo, shoulderMat);
    shoulderRight.rotation.x = -Math.PI / 2;
    shoulderRight.position.set(roadWidth / 2 - 0.8, 0.04, -totalRoadLength / 2 + 100);
    roadGroup.add(shoulderLeft, shoulderRight);

    // Canyon boulders & rocks along road sides
    const boulderGeo = new THREE.DodecahedronGeometry(1.5, 1);
    for (let i = 0; i < 70; i++) {
      const boulder = new THREE.Mesh(boulderGeo, rockMat);
      const side = Math.random() > 0.5 ? 1 : -1;
      const bX = side * (roadWidth / 2 + 2 + Math.random() * 25);
      const bZ = -(Math.random() * totalRoadLength);
      const bScale = 1 + Math.random() * 3.5;
      boulder.scale.set(bScale, bScale * (0.8 + Math.random() * 0.6), bScale);
      boulder.position.set(bX, bScale * 0.7, bZ);
      boulder.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      boulder.castShadow = true;
      boulder.receiveShadow = true;
      roadGroup.add(boulder);
    }

    scene.add(roadGroup);

    // -----------------------------------------------------------
    // TIRE DUST TRAILS (Kicked up dust as seen in video!)
    // -----------------------------------------------------------
    const dustCount = 200;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustScales = new Float32Array(dustCount);
    const dustAlphas = new Float32Array(dustCount);

    const dustParticles: {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      life: number;
      maxLife: number;
    }[] = [];

    for (let i = 0; i < dustCount; i++) {
      dustParticles.push({
        x: 0,
        y: -10,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        maxLife: 1.0,
      });
      dustPositions[i * 3] = 0;
      dustPositions[i * 3 + 1] = -10;
      dustPositions[i * 3 + 2] = 0;
      dustScales[i] = 0;
      dustAlphas[i] = 0;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xd97706,
      size: 0.85,
      transparent: true,
      opacity: 0.45,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // -----------------------------------------------------------
    // Supercar Instance
    // -----------------------------------------------------------
    const supercar = createSupercarModel({
      ...carConfig,
      doorAngle: 0, // closed while driving
      headlightsOn: true,
      highBeamsOn: timeOfDay === 'night',
    });
    scene.add(supercar.group);

    // -----------------------------------------------------------
    // Game Loop & Vehicle Dynamics
    // -----------------------------------------------------------
    let animId: number;
    const clock = new THREE.Clock();
    let dustSpawnIndex = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);

      const p = physics.current;
      const k = keys.current;

      // Acceleration / Throttle
      const maxSpeed = 98; // ~352 km/h in m/s
      const accelRate = 18.0; // m/s^2
      const brakeRate = 32.0; // m/s^2
      const naturalDrag = 0.988;

      if (k.forward) {
        p.throttle = Math.min(1.0, p.throttle + dt * 3.5);
        p.speed += accelRate * p.throttle * dt;
        if (p.speed > maxSpeed) p.speed = maxSpeed;
      } else {
        p.throttle = Math.max(0, p.throttle - dt * 4.0);
      }

      if (k.backward) {
        if (p.speed > 1.0) {
          p.speed -= brakeRate * dt; // Braking
        } else {
          p.speed -= (accelRate * 0.4) * dt; // Reverse
          if (p.speed < -12) p.speed = -12;
        }
      }

      if (k.handbrake) {
        p.speed *= 0.92;
      } else if (!k.forward && !k.backward) {
        p.speed *= naturalDrag;
      }

      // Steering dynamics
      const maxSteer = 0.52; // ~30 degrees
      const steerSpeed = 2.4;
      if (k.left) {
        p.steerAngle = Math.min(maxSteer, p.steerAngle + steerSpeed * dt);
      } else if (k.right) {
        p.steerAngle = Math.max(-maxSteer, p.steerAngle - steerSpeed * dt);
      } else {
        p.steerAngle *= 0.85; // Auto-center
      }

      // Vehicle rotation based on speed and steering
      const speedSign = Math.sign(p.speed) || 1;
      const turnRate = (p.steerAngle * (p.speed / 14)) * 0.8;
      p.heading += turnRate * dt * speedSign;

      // Position update (driving forward along heading)
      // We orient the canyon road along negative Z
      const moveDistance = p.speed * dt;
      p.posX += Math.sin(p.heading) * moveDistance;
      p.posZ -= Math.cos(p.heading) * moveDistance;

      // Keep car on road bounds (-6 to +6)
      if (Math.abs(p.posX) > roadWidth / 2 - 1.2) {
        p.posX = Math.sign(p.posX) * (roadWidth / 2 - 1.2);
        p.speed *= 0.85; // Scrub speed on shoulder
      }

      // Loop terrain when car travels far
      if (p.posZ < -totalRoadLength + 200) {
        p.posZ = 0;
      }

      // Calculate RPM & Gear
      const speedKmh = Math.abs(p.speed * 3.6);
      let calculatedGear = 1;
      let calculatedRpm = 800;

      if (p.speed < -0.5) {
        calculatedGear = 0; // Reverse
        calculatedRpm = 1200 + Math.abs(p.speed) * 200;
      } else {
        const gearRatios = [0, 45, 95, 150, 210, 275, 330, 360];
        for (let g = 1; g <= 7; g++) {
          if (speedKmh <= gearRatios[g] || g === 7) {
            calculatedGear = g;
            const prevMax = gearRatios[g - 1];
            const currentMax = gearRatios[g];
            const gearProgress = Math.min(1, Math.max(0, (speedKmh - prevMax) / (currentMax - prevMax)));
            calculatedRpm = 3200 + gearProgress * 5100;
            break;
          }
        }
        if (speedKmh < 2 && !k.forward) {
          calculatedRpm = 800;
        }
      }

      p.rpm = calculatedRpm;
      p.gear = calculatedGear;
      p.lateralG = (p.speed * turnRate) / 9.81;
      p.wheelRotation += (p.speed / 0.38) * dt;

      // Update Audio Engine
      audioEngine.setRpm(p.rpm);

      // Inform parent of telemetry
      onTelemetryUpdate?.({
        speedKmh: Math.round(speedKmh),
        rpm: Math.round(p.rpm),
        gear: calculatedGear === 0 ? 'R' : speedKmh < 1 && !k.forward ? 'N' : String(calculatedGear),
        lateralG: Number(p.lateralG.toFixed(2)),
        throttle: Number(p.throttle.toFixed(2)),
      });

      // Update 3D car position & rotation
      supercar.group.position.set(p.posX, 0, p.posZ);
      supercar.group.rotation.y = p.heading;
      // Body roll during sharp turns
      supercar.group.rotation.z = -p.lateralG * 0.05;
      // Body pitch during acceleration / braking
      const pitch = (k.forward ? 0.025 : 0) - (k.backward || k.handbrake ? 0.045 : 0);
      supercar.group.rotation.x = pitch;

      // Update 3D model parts (steer & wheel spin)
      supercar.update({
        ...carConfig,
        doorAngle: 0,
        steerAngle: p.steerAngle,
        wheelRotation: p.wheelRotation,
        headlightsOn: true,
        highBeamsOn: timeOfDay === 'night',
      });

      // Sun follower: keep sun shadow frustum centered near the car
      sunLight.position.set(p.posX + 50, 80, p.posZ + 60);
      sunLight.target.position.set(p.posX, 0, p.posZ);
      sunLight.target.updateMatrixWorld();

      // Spawn dust trail from rear tires if moving fast or sliding
      if (speedKmh > 20 || (Math.abs(p.lateralG) > 0.4 && speedKmh > 10)) {
        for (let t = 0; t < 2; t++) {
          const side = t === 0 ? -0.9 : 0.9;
          const dust = dustParticles[dustSpawnIndex];
          dust.x = p.posX + Math.cos(p.heading) * side - Math.sin(p.heading) * 1.5;
          dust.y = 0.15;
          dust.z = p.posZ - Math.sin(p.heading) * side - Math.cos(p.heading) * 1.5;
          dust.vx = (Math.random() - 0.5) * 1.2;
          dust.vy = 0.6 + Math.random() * 1.2;
          dust.vz = (Math.random() - 0.5) * 1.2;
          dust.life = 0;
          dust.maxLife = 0.7 + Math.random() * 0.5;

          dustSpawnIndex = (dustSpawnIndex + 1) % dustCount;
        }
      }

      // Update dust particles
      const dustPosAttr = dustGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < dustCount; i++) {
        const d = dustParticles[i];
        if (d.life < d.maxLife) {
          d.life += dt;
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          d.z += d.vz * dt;
          dustPosAttr.setXYZ(i, d.x, d.y, d.z);
        } else {
          dustPosAttr.setXYZ(i, 0, -20, 0); // Hide
        }
      }
      dustPosAttr.needsUpdate = true;

      // ---------------------------------------------------------
      // Camera Tracking Modes
      // ---------------------------------------------------------
      if (cameraMode === 'chase') {
        // Dynamic chase cam that lags smoothly behind the car
        const camDistance = 6.2 + (speedKmh / 350) * 2.8;
        const camHeight = 2.4 + (speedKmh / 350) * 0.4;
        const targetCamX = p.posX - Math.sin(p.heading) * camDistance;
        const targetCamZ = p.posZ + Math.cos(p.heading) * camDistance;
        camera.position.x += (targetCamX - camera.position.x) * 0.12;
        camera.position.y += (camHeight - camera.position.y) * 0.12;
        camera.position.z += (targetCamZ - camera.position.z) * 0.12;
        camera.lookAt(p.posX, 1.1, p.posZ);
        // Dynamic FOV widening at high speed
        camera.fov = 52 + (speedKmh / 350) * 18;
        camera.updateProjectionMatrix();
      } else if (cameraMode === 'hood') {
        // Cockpit hood POV
        const hoodX = p.posX + Math.sin(p.heading) * 0.8;
        const hoodZ = p.posZ - Math.cos(p.heading) * 0.8;
        camera.position.set(hoodX, 0.85, hoodZ);
        const lookTarget = new THREE.Vector3(
          p.posX + Math.sin(p.heading) * 25,
          0.85,
          p.posZ - Math.cos(p.heading) * 25
        );
        camera.lookAt(lookTarget);
        camera.fov = 68;
        camera.updateProjectionMatrix();
      } else {
        // Drone tracking cam (aerial angle matching the video shot!)
        const droneX = p.posX - 10;
        const droneY = 7.5;
        const droneZ = p.posZ + 12;
        camera.position.lerp(new THREE.Vector3(droneX, droneY, droneZ), 0.08);
        camera.lookAt(p.posX, 0.8, p.posZ);
        camera.fov = 48;
        camera.updateProjectionMatrix();
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [carConfig, timeOfDay, cameraMode, onTelemetryUpdate]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden select-none ${className}`}>
      {/* Top Camera & Audio Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-black/60 backdrop-blur-md border border-white/10 p-1.5 rounded-lg">
          <button
            type="button"
            onClick={() => setCameraMode('chase')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              cameraMode === 'chase' ? 'bg-[#ff5500] text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Chase Cam
          </button>
          <button
            type="button"
            onClick={() => setCameraMode('hood')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              cameraMode === 'hood' ? 'bg-[#ff5500] text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Hood POV
          </button>
          <button
            type="button"
            onClick={() => setCameraMode('drone')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              cameraMode === 'drone' ? 'bg-[#ff5500] text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Drone Angle
          </button>
        </div>

        <button
          type="button"
          onClick={handleToggleEngine}
          className={`pointer-events-auto px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
            isAudioActive
              ? 'bg-[#ff5500] text-white shadow-lg shadow-[#ff5500]/30'
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isAudioActive ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
          {isAudioActive ? 'V12 Sound Active' : 'Start V12 Audio'}
        </button>
      </div>

      {/* Keyboard Helper / Mobile Touch Drive Controls */}
      <div className="absolute bottom-6 left-6 z-20 hidden md:flex items-center gap-3 bg-black/70 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-xl pointer-events-none text-xs text-slate-300">
        <div className="flex items-center gap-1 font-mono">
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20">W</kbd>
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20">A</kbd>
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20">S</kbd>
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20">D</kbd>
        </div>
        <span className="text-slate-500">·</span>
        <span>Steer &amp; Accelerate</span>
        <span className="text-slate-500">·</span>
        <div className="flex items-center gap-1 font-mono">
          <kbd className="px-2 py-0.5 bg-white/10 rounded border border-white/20">SPACE</kbd>
        </div>
        <span>Brake</span>
      </div>

      {/* Mobile Touch Controls Overlay */}
      <div className="md:hidden absolute bottom-6 left-4 right-4 z-20 flex justify-between items-end pointer-events-none">
        {/* Left / Right Steering */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            type="button"
            onTouchStart={() => { keys.current.left = true; }}
            onTouchEnd={() => { keys.current.left = false; }}
            className="w-14 h-14 bg-black/60 border border-white/20 rounded-full flex items-center justify-center text-white text-xl active:bg-[#ff5500]"
          >
            ←
          </button>
          <button
            type="button"
            onTouchStart={() => { keys.current.right = true; }}
            onTouchEnd={() => { keys.current.right = false; }}
            className="w-14 h-14 bg-black/60 border border-white/20 rounded-full flex items-center justify-center text-white text-xl active:bg-[#ff5500]"
          >
            →
          </button>
        </div>

        {/* Gas / Brake */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            type="button"
            onTouchStart={() => { keys.current.backward = true; }}
            onTouchEnd={() => { keys.current.backward = false; }}
            className="w-14 h-14 bg-black/60 border border-rose-500/50 rounded-full flex items-center justify-center text-rose-400 font-bold active:bg-rose-600 active:text-white"
          >
            BRK
          </button>
          <button
            type="button"
            onTouchStart={() => {
              keys.current.forward = true;
              if (!audioEngine.getIsRunning()) {
                audioEngine.startEngine();
                setIsAudioActive(true);
              }
            }}
            onTouchEnd={() => { keys.current.forward = false; }}
            className="w-16 h-16 bg-[#ff5500]/80 border border-[#ff5500] rounded-full flex items-center justify-center text-white font-bold active:scale-95"
          >
            GAS
          </button>
        </div>
      </div>
    </div>
  );
};
