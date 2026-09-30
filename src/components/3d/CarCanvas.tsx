import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createSupercarModel, CarConfig, SupercarInstance } from './SupercarModel';

interface Hotspot {
  id: string;
  name: string;
  position: [number, number, number];
  description: string;
}

export const SUPERCAR_HOTSPOTS: Hotspot[] = [
  {
    id: 'aero-splitter',
    name: 'ALA 2.0 Front Splitter',
    position: [0, 0.3, 2.0],
    description: 'Active aerodynamic flaps actively channel airflow beneath the carbon chassis or vent over the front bumper to alter downforce in 500 milliseconds.',
  },
  {
    id: 'scissor-doors',
    name: 'Bespoke Scissor Kinematics',
    position: [-1.0, 0.9, 0.3],
    description: 'Iconic upward-opening doors engineered on forged lightweight alloy hinges, allowing effortless entry while displaying the carbon-fiber monocoque threshold.',
  },
  {
    id: 'v12-engine',
    name: '6.5L Naturally Aspirated V12',
    position: [0, 0.85, -1.0],
    description: 'Producing 770 CV (759 hp) at 8,500 RPM with 720 Nm of torque. Titanium intake valves and modified ducting unleash an exhilarating acoustic symphony.',
  },
  {
    id: 'rear-wing',
    name: 'Active Aerodynamic Rear Wing',
    position: [0, 1.2, -2.0],
    description: 'Integrated ALA 2.0 rear wing with internal air ducts and electric micro-actuators that provide active aero vectoring during high-speed canyon cornering.',
  },
  {
    id: 'brakes',
    name: 'Carbon-Ceramic Braking (CCB)',
    position: [1.1, 0.4, 1.35],
    description: '6-piston front monobloc calipers clamping 400x38mm carbon ceramic ventilated discs, achieving 100-0 km/h braking in just 30 meters.',
  },
];

interface CarCanvasProps {
  config: CarConfig;
  showWindTunnel?: boolean;
  windTunnelMode?: 'downforce' | 'lowdrag' | 'vectoring';
  activeHotspotId?: string | null;
  onSelectHotspot?: (hotspot: Hotspot | null) => void;
  cameraPreset?: 'front-quarter' | 'profile' | 'rear-quarter' | 'top' | 'scissor' | 'cockpit';
  autoRotate?: boolean;
  className?: string;
}

export const CarCanvas: React.FC<CarCanvasProps> = ({
  config,
  showWindTunnel = false,
  windTunnelMode = 'downforce',
  activeHotspotId,
  onSelectHotspot,
  cameraPreset = 'front-quarter',
  autoRotate = false,
  className = 'w-full h-full',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const carInstanceRef = useRef<SupercarInstance | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Interaction / Orbit State
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const cameraSpherical = useRef({
    radius: 7.2,
    theta: Math.PI / 4, // Horizontal angle (around Y)
    phi: Math.PI / 3, // Vertical angle (elevation)
    target: new THREE.Vector3(0, 0.6, 0),
  });
  const targetSpherical = useRef({
    radius: 7.2,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
    target: new THREE.Vector3(0, 0.6, 0),
  });

  // Wind tunnel particles
  const windStreamlinesRef = useRef<THREE.LineSegments | null>(null);

  // Set camera angle preset
  useEffect(() => {
    switch (cameraPreset) {
      case 'front-quarter':
        targetSpherical.current.radius = 7.0;
        targetSpherical.current.theta = 0.65;
        targetSpherical.current.phi = 1.25;
        targetSpherical.current.target.set(0, 0.5, 0);
        break;
      case 'scissor':
        targetSpherical.current.radius = 5.2;
        targetSpherical.current.theta = 1.35;
        targetSpherical.current.phi = 1.2;
        targetSpherical.current.target.set(-0.5, 0.7, 0.2);
        break;
      case 'rear-quarter':
        targetSpherical.current.radius = 6.8;
        targetSpherical.current.theta = 2.4;
        targetSpherical.current.phi = 1.2;
        targetSpherical.current.target.set(0, 0.5, -0.5);
        break;
      case 'profile':
        targetSpherical.current.radius = 7.5;
        targetSpherical.current.theta = 1.57;
        targetSpherical.current.phi = 1.45;
        targetSpherical.current.target.set(0, 0.5, 0);
        break;
      case 'top':
        targetSpherical.current.radius = 8.0;
        targetSpherical.current.theta = 0.5;
        targetSpherical.current.phi = 0.25;
        targetSpherical.current.target.set(0, 0.5, 0);
        break;
      case 'cockpit':
        targetSpherical.current.radius = 3.2;
        targetSpherical.current.theta = 0.7;
        targetSpherical.current.phi = 1.1;
        targetSpherical.current.target.set(-0.2, 0.7, 0.1);
        break;
    }
  }, [cameraPreset]);

  // Update car model whenever config changes
  useEffect(() => {
    if (carInstanceRef.current) {
      carInstanceRef.current.update(config);
    }
  }, [config]);

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x090a0f);
    scene.fog = new THREE.FogExp2(0x090a0f, 0.035);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    cameraRef.current = camera;
    camera.position.set(5, 3.5, 6);

    // Renderer setup with anti-aliasing & tone mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // -----------------------------------------------------------
    // Studio Lighting
    // -----------------------------------------------------------
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Key Light (Warm tinted sunlight / studio spot)
    const keyLight = new THREE.DirectionalLight(0xfff3e0, 2.8);
    keyLight.position.set(6, 9, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    scene.add(keyLight);

    // Fill Light (Cool tinted studio bounce)
    const fillLight = new THREE.DirectionalLight(0x94a3b8, 1.4);
    fillLight.position.set(-6, 5, -5);
    scene.add(fillLight);

    // Rim Light (Sharp rear highlight to emphasize supercar silhouette)
    const rimLight = new THREE.DirectionalLight(0xffedd5, 2.5);
    rimLight.position.set(0, 7, -8);
    scene.add(rimLight);

    // Soft overhead softbox light
    const overheadLight = new THREE.DirectionalLight(0xffffff, 1.2);
    overheadLight.position.set(0, 8, 0);
    scene.add(overheadLight);

    // -----------------------------------------------------------
    // Studio Floor & Turntable
    // -----------------------------------------------------------
    // Dark reflective showroom floor
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f121a,
      roughness: 0.28,
      metalness: 0.65,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Circular Turntable Podium with orange glowing hairline border
    const podiumGeo = new THREE.CylinderGeometry(4.2, 4.4, 0.04, 64);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: 0x141721,
      roughness: 0.4,
      metalness: 0.8,
    });
    const podium = new THREE.Mesh(podiumGeo, podiumMat);
    podium.position.y = 0.02;
    podium.receiveShadow = true;
    scene.add(podium);

    // Glowing perimeter ring
    const ringGeo = new THREE.RingGeometry(4.18, 4.22, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff5500,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.042;
    scene.add(ring);

    // Concentric inner grid accent
    const innerRingGeo = new THREE.RingGeometry(2.48, 2.5, 48);
    const innerRing = new THREE.Mesh(innerRingGeo, new THREE.MeshBasicMaterial({ color: 0x252b3b, side: THREE.DoubleSide }));
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.042;
    scene.add(innerRing);

    // -----------------------------------------------------------
    // Add Supercar
    // -----------------------------------------------------------
    const supercar = createSupercarModel(config);
    carInstanceRef.current = supercar;
    scene.add(supercar.group);

    // -----------------------------------------------------------
    // Wind Tunnel Streamlines
    // -----------------------------------------------------------
    const lineCount = 120;
    const pointsPerLine = 24;
    const totalVertices = lineCount * (pointsPerLine - 1) * 2;
    const streamlinePositions = new Float32Array(totalVertices * 3);
    const streamlineColors = new Float32Array(totalVertices * 3);

    // Particle seeds for animation
    const lineSeeds: { x: number; y: number; zOffset: number; speed: number }[] = [];
    for (let i = 0; i < lineCount; i++) {
      lineSeeds.push({
        x: (Math.random() - 0.5) * 3.4,
        y: 0.2 + Math.random() * 1.5,
        zOffset: Math.random() * 12,
        speed: 8 + Math.random() * 6,
      });
    }

    const streamlineGeo = new THREE.BufferGeometry();
    streamlineGeo.setAttribute('position', new THREE.BufferAttribute(streamlinePositions, 3));
    streamlineGeo.setAttribute('color', new THREE.BufferAttribute(streamlineColors, 3));

    const streamlineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const windStreamlines = new THREE.LineSegments(streamlineGeo, streamlineMat);
    windStreamlines.visible = showWindTunnel;
    scene.add(windStreamlines);
    windStreamlinesRef.current = windStreamlines;

    // -----------------------------------------------------------
    // Animation Loop
    // -----------------------------------------------------------
    let animFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth camera interpolation
      const lerpFactor = 0.07;
      cameraSpherical.current.radius += (targetSpherical.current.radius - cameraSpherical.current.radius) * lerpFactor;
      cameraSpherical.current.theta += (targetSpherical.current.theta - cameraSpherical.current.theta) * lerpFactor;
      cameraSpherical.current.phi += (targetSpherical.current.phi - cameraSpherical.current.phi) * lerpFactor;
      cameraSpherical.current.target.lerp(targetSpherical.current.target, lerpFactor);

      if (autoRotate && !isDragging.current) {
        targetSpherical.current.theta += delta * 0.25;
      }

      // Convert spherical to Cartesian
      const r = cameraSpherical.current.radius;
      const th = cameraSpherical.current.theta;
      const ph = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, cameraSpherical.current.phi));
      const target = cameraSpherical.current.target;

      camera.position.x = target.x + r * Math.sin(ph) * Math.sin(th);
      camera.position.y = target.y + r * Math.cos(ph);
      camera.position.z = target.z + r * Math.sin(ph) * Math.cos(th);
      camera.lookAt(target);

      // Update car kinematics (door open/close smoothly)
      if (carInstanceRef.current) {
        carInstanceRef.current.update(config);
      }

      // Update Wind Tunnel particles if active
      if (windStreamlinesRef.current && showWindTunnel) {
        const posAttr = streamlineGeo.attributes.position as THREE.BufferAttribute;
        const colAttr = streamlineGeo.attributes.color as THREE.BufferAttribute;
        let vIdx = 0;

        for (let i = 0; i < lineCount; i++) {
          const seed = lineSeeds[i];
          const streamSpeed = windTunnelMode === 'lowdrag' ? seed.speed * 1.5 : seed.speed;
          const currentZHead = 6 - ((time * streamSpeed + seed.zOffset) % 14);

          for (let p = 0; p < pointsPerLine - 1; p++) {
            const z1 = currentZHead - p * 0.14;
            const z2 = currentZHead - (p + 1) * 0.14;

            // Flow deformation around the car body
            const getDeflectedY = (x: number, z: number, baseH: number) => {
              const inLength = z > -2.2 && z < 2.2;
              const inWidth = Math.abs(x) < 1.35;
              if (inLength && inWidth) {
                // Hood and roof curve deflection
                let heightOverCar = 0.45;
                if (z > 0.5 && z < 1.8) heightOverCar = 0.45 + (1.8 - z) * 0.25;
                if (z > -0.5 && z <= 0.5) heightOverCar = 1.05;
                if (z <= -0.5 && z > -2.0) {
                  // Rear wing downforce effect
                  heightOverCar = windTunnelMode === 'downforce' ? 1.15 : 0.85;
                }
                return Math.max(baseH, heightOverCar + 0.08);
              }
              return baseH;
            };

            const y1 = getDeflectedY(seed.x, z1, seed.y);
            const y2 = getDeflectedY(seed.x, z2, seed.y);

            // Segment 1
            posAttr.setXYZ(vIdx, seed.x, y1, z1);
            // Segment 2
            posAttr.setXYZ(vIdx + 1, seed.x, y2, z2);

            // Color gradient: cyan (low pressure/drag) to orange/red (high downforce pressure)
            const alpha = Math.max(0, 1 - p / pointsPerLine);
            if (windTunnelMode === 'downforce') {
              // Orange / Red high-downforce vectors
              colAttr.setXYZ(vIdx, 1.0 * alpha, 0.35 * alpha, 0.05 * alpha);
              colAttr.setXYZ(vIdx + 1, 1.0 * alpha, 0.35 * alpha, 0.05 * alpha);
            } else if (windTunnelMode === 'lowdrag') {
              // Electric Cyan low-drag laminar flow
              colAttr.setXYZ(vIdx, 0.1 * alpha, 0.75 * alpha, 1.0 * alpha);
              colAttr.setXYZ(vIdx + 1, 0.1 * alpha, 0.75 * alpha, 1.0 * alpha);
            } else {
              // Aero vectoring (split left/right)
              const isRight = seed.x > 0;
              colAttr.setXYZ(vIdx, isRight ? 1.0 * alpha : 0.1 * alpha, 0.5 * alpha, isRight ? 0.1 * alpha : 1.0 * alpha);
              colAttr.setXYZ(vIdx + 1, isRight ? 1.0 * alpha : 0.1 * alpha, 0.5 * alpha, isRight ? 0.1 * alpha : 1.0 * alpha);
            }

            vIdx += 2;
          }
        }
        posAttr.needsUpdate = true;
        colAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // -----------------------------------------------------------
    // Resize Handler
    // -----------------------------------------------------------
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
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [showWindTunnel, windTunnelMode]);

  // Pointer Orbit Controls
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };

    targetSpherical.current.theta -= deltaX * 0.007;
    targetSpherical.current.phi = Math.max(0.12, Math.min(Math.PI / 2 - 0.05, targetSpherical.current.phi - deltaY * 0.006));
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    targetSpherical.current.radius = Math.max(2.8, Math.min(12, targetSpherical.current.radius + e.deltaY * 0.004));
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none cursor-grab active:cursor-grabbing overflow-hidden ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* 3D Hotspot overlay buttons on screen */}
      {onSelectHotspot && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {SUPERCAR_HOTSPOTS.map((spot) => {
            const isSelected = activeHotspotId === spot.id;
            return (
              <button
                key={spot.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectHotspot(isSelected ? null : spot);
                }}
                className={`pointer-events-auto absolute p-1.5 flex items-center justify-center rounded-full transition-all duration-200 transform -translate-x-1/2 -translate-y-1/2 ${
                  isSelected
                    ? 'bg-[#ff5500] text-white scale-125 shadow-lg shadow-[#ff5500]/50 ring-4 ring-[#ff5500]/30'
                    : 'bg-black/70 text-slate-200 border border-white/20 hover:border-[#ff5500] hover:text-[#ff5500] hover:scale-110 backdrop-blur-sm'
                }`}
                style={{
                  // Approximate projected viewport positions for key angles
                  left:
                    spot.id === 'aero-splitter'
                      ? '42%'
                      : spot.id === 'scissor-doors'
                      ? '35%'
                      : spot.id === 'v12-engine'
                      ? '54%'
                      : spot.id === 'rear-wing'
                      ? '68%'
                      : '72%',
                  top:
                    spot.id === 'aero-splitter'
                      ? '68%'
                      : spot.id === 'scissor-doors'
                      ? '38%'
                      : spot.id === 'v12-engine'
                      ? '42%'
                      : spot.id === 'rear-wing'
                      ? '40%'
                      : '66%',
                }}
                title={spot.name}
              >
                <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-[#ff5500]'}`} />
                <span className="sr-only">{spot.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Orbit / Interaction Helper Pill */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-xs text-slate-400 pointer-events-none flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-pulse" />
        <span>Click &amp; drag to rotate 360° · Scroll to zoom</span>
      </div>
    </div>
  );
};
