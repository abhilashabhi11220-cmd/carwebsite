import * as THREE from 'three';

export interface CarConfig {
  bodyColor: string;
  finishType: 'metallic' | 'matte' | 'gloss' | 'carbon';
  wheelColor: string;
  caliperColor: string;
  aeroPackage: 'svj' | 'touring' | 'track';
  doorAngle: number; // 0 (closed) to 1 (fully open scissor doors)
  headlightsOn: boolean;
  highBeamsOn: boolean;
  steerAngle?: number; // radians
  wheelRotation?: number; // radians
}

export interface SupercarInstance {
  group: THREE.Group;
  leftDoor: THREE.Group;
  rightDoor: THREE.Group;
  frontLeftWheel: THREE.Group;
  frontRightWheel: THREE.Group;
  rearLeftWheel: THREE.Group;
  rearRightWheel: THREE.Group;
  bodyMaterials: THREE.MeshPhysicalMaterial[];
  caliperMaterials: THREE.MeshStandardMaterial[];
  rimMaterials: THREE.MeshStandardMaterial[];
  headlightLeds: THREE.MeshBasicMaterial[];
  headlightCones: THREE.SpotLight[];
  wingGroup: THREE.Group;
  exhaustSparks: THREE.Points;
  update: (config: CarConfig) => void;
}

export function createSupercarModel(initialConfig: CarConfig): SupercarInstance {
  const carGroup = new THREE.Group();
  carGroup.name = 'Supercar';

  const bodyMaterials: THREE.MeshPhysicalMaterial[] = [];
  const caliperMaterials: THREE.MeshStandardMaterial[] = [];
  const rimMaterials: THREE.MeshStandardMaterial[] = [];
  const headlightLeds: THREE.MeshBasicMaterial[] = [];
  const headlightCones: THREE.SpotLight[] = [];

  // Helper function to create paint material
  function createPaintMaterial(color: string, finish: CarConfig['finishType']) {
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      metalness: finish === 'matte' ? 0.2 : finish === 'carbon' ? 0.7 : 0.85,
      roughness: finish === 'matte' ? 0.65 : finish === 'gloss' ? 0.12 : 0.25,
      clearcoat: finish === 'matte' ? 0.0 : 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    });
    bodyMaterials.push(mat);
    return mat;
  }

  const paintMat = createPaintMaterial(initialConfig.bodyColor, initialConfig.finishType);

  // Carbon fiber / black aerodynamic accents material
  const carbonMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x111317),
    roughness: 0.35,
    metalness: 0.75,
  });

  // Dark tinted glass material
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x0a0c10),
    transmission: 0.65,
    opacity: 0.9,
    transparent: true,
    roughness: 0.05,
    ior: 1.52,
  });

  // Wheel rim material
  const rimMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialConfig.wheelColor),
    roughness: 0.3,
    metalness: 0.9,
  });
  rimMaterials.push(rimMat);

  // Brake Caliper material
  const caliperMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialConfig.caliperColor),
    roughness: 0.2,
    metalness: 0.6,
  });
  caliperMaterials.push(caliperMat);

  // Tire rubber material
  const tireMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x18181b),
    roughness: 0.85,
    metalness: 0.05,
  });

  // Brake rotor material
  const rotorMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x6b7280),
    roughness: 0.25,
    metalness: 0.95,
  });

  // Emissive Headlight LED material (Y-shape signature)
  const ledHeadlightMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(initialConfig.headlightsOn ? 0xf8fafc : 0x334155),
  });
  headlightLeds.push(ledHeadlightMat);

  // Emissive Tail Light LED material
  const ledTailMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xff0033),
  });

  // -------------------------------------------------------------
  // 1. MAIN CHASSIS & MONOCOQUE (Aggressive low-slung wedge)
  // -------------------------------------------------------------
  const chassisGroup = new THREE.Group();

  // Lower chassis tub / floor
  const floorGeo = new THREE.BoxGeometry(1.9, 0.15, 4.3);
  const floorMesh = new THREE.Mesh(floorGeo, carbonMat);
  floorMesh.position.set(0, 0.22, 0);
  floorMesh.castShadow = true;
  floorMesh.receiveShadow = true;
  chassisGroup.add(floorMesh);

  // Front wedge / hood (slanted low nose)
  const noseShape = new THREE.Shape();
  noseShape.moveTo(-0.92, -0.4);
  noseShape.lineTo(0.92, -0.4);
  noseShape.lineTo(0.72, 1.4);
  noseShape.lineTo(-0.72, 1.4);
  noseShape.closePath();

  // Front Hood geometry
  const hoodGeo = new THREE.BufferGeometry();
  // We use custom box and wedge composites for sharp supercar angularity
  const hoodBoxGeo = new THREE.BoxGeometry(1.82, 0.22, 1.5);
  const hoodBox = new THREE.Mesh(hoodBoxGeo, paintMat);
  hoodBox.position.set(0, 0.42, 1.15);
  hoodBox.rotation.x = -0.14; // sloped down to the front
  hoodBox.castShadow = true;
  chassisGroup.add(hoodBox);

  // Front pointy nose cone
  const noseConeGeo = new THREE.CylinderGeometry(0.68, 0.92, 0.4, 4);
  const noseCone = new THREE.Mesh(noseConeGeo, paintMat);
  noseCone.rotation.y = Math.PI / 4;
  noseCone.rotation.x = Math.PI / 2 + 0.1;
  noseCone.position.set(0, 0.32, 1.95);
  noseCone.scale.set(1.1, 1, 0.45);
  chassisGroup.add(noseCone);

  // Front Carbon Aero Splitter (SVJ dual channel)
  const splitterGeo = new THREE.BoxGeometry(1.98, 0.05, 0.7);
  const splitter = new THREE.Mesh(splitterGeo, carbonMat);
  splitter.position.set(0, 0.14, 1.95);
  splitter.castShadow = true;
  chassisGroup.add(splitter);

  // Front Aero Winglets (Canards on bumper corners)
  const canardGeo = new THREE.BoxGeometry(0.2, 0.04, 0.35);
  const leftCanard = new THREE.Mesh(canardGeo, carbonMat);
  leftCanard.position.set(-0.95, 0.28, 1.85);
  leftCanard.rotation.z = -0.3;
  leftCanard.rotation.y = 0.2;
  const rightCanard = new THREE.Mesh(canardGeo, carbonMat);
  rightCanard.position.set(0.95, 0.28, 1.85);
  rightCanard.rotation.z = 0.3;
  rightCanard.rotation.y = -0.2;
  chassisGroup.add(leftCanard, rightCanard);

  // Front Headlight Housings with Y-shaped DRLs
  const createHeadlightAssembly = (isLeft: boolean) => {
    const hlGroup = new THREE.Group();
    const xMult = isLeft ? -1 : 1;

    // Headlight glass housing
    const hHousingGeo = new THREE.BoxGeometry(0.38, 0.12, 0.45);
    const hHousing = new THREE.Mesh(hHousingGeo, carbonMat);
    hlGroup.add(hHousing);

    // Y-shaped DRL LED light guide (iconic Lamborghini signature)
    const yStemGeo = new THREE.BoxGeometry(0.03, 0.03, 0.22);
    const yStem = new THREE.Mesh(yStemGeo, ledHeadlightMat);
    yStem.position.set(0, 0.02, 0.05);

    const yFork1 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.14), ledHeadlightMat);
    yFork1.position.set(0.04 * xMult, 0.02, 0.16);
    yFork1.rotation.y = 0.5 * xMult;

    const yFork2 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.14), ledHeadlightMat);
    yFork2.position.set(-0.04 * xMult, 0.02, 0.16);
    yFork2.rotation.y = -0.5 * xMult;

    hlGroup.add(yStem, yFork1, yFork2);

    // Main projector bulb
    const projectorGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const projector = new THREE.Mesh(projectorGeo, ledHeadlightMat);
    projector.position.set(0, 0, -0.05);
    hlGroup.add(projector);

    // Spotlight beam forward
    const spot = new THREE.SpotLight(0xffffff, initialConfig.headlightsOn ? 3.5 : 0);
    spot.position.set(0, 0, 0.2);
    const target = new THREE.Object3D();
    target.position.set(0.1 * xMult, -0.2, 10);
    hlGroup.add(target);
    spot.target = target;
    spot.angle = 0.45;
    spot.penumbra = 0.4;
    spot.distance = 25;
    hlGroup.add(spot);
    headlightCones.push(spot);

    hlGroup.position.set(0.68 * xMult, 0.46, 1.62);
    hlGroup.rotation.y = -0.18 * xMult;
    hlGroup.rotation.x = -0.15;
    return hlGroup;
  };

  chassisGroup.add(createHeadlightAssembly(true));
  chassisGroup.add(createHeadlightAssembly(false));

  // Cockpit Greenhouse / Roof & Windshield
  const cabinBoxGeo = new THREE.BoxGeometry(1.5, 0.52, 1.8);
  const cabin = new THREE.Mesh(cabinBoxGeo, carbonMat);
  cabin.position.set(0, 0.78, -0.1);
  chassisGroup.add(cabin);

  // Slanted windshield
  const windshieldGeo = new THREE.BoxGeometry(1.42, 0.04, 1.25);
  const windshield = new THREE.Mesh(windshieldGeo, glassMat);
  windshield.position.set(0, 0.76, 0.58);
  windshield.rotation.x = -0.58;
  chassisGroup.add(windshield);

  // Roof panel (in carbon fiber)
  const roofGeo = new THREE.BoxGeometry(1.36, 0.05, 1.05);
  const roof = new THREE.Mesh(roofGeo, carbonMat);
  roof.position.set(0, 1.04, -0.12);
  chassisGroup.add(roof);

  // Rear Engine Deck & Louvers (Covering the V12)
  const engineCoverGeo = new THREE.BoxGeometry(1.45, 0.08, 1.35);
  const engineCover = new THREE.Mesh(engineCoverGeo, glassMat);
  engineCover.position.set(0, 0.82, -1.05);
  engineCover.rotation.x = 0.28;
  chassisGroup.add(engineCover);

  // Louver slats in black carbon
  for (let i = 0; i < 4; i++) {
    const louverGeo = new THREE.BoxGeometry(1.28, 0.03, 0.12);
    const louver = new THREE.Mesh(louverGeo, carbonMat);
    louver.position.set(0, 0.88 - i * 0.06, -0.65 - i * 0.26);
    louver.rotation.x = 0.35;
    chassisGroup.add(louver);
  }

  // Exposed V12 Engine underneath glass!
  const v12Group = new THREE.Group();
  const engineBlockMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.8, roughness: 0.4 });
  const manifoldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 }); // Bronze/gold manifolds
  const engineBlock = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 0.9), engineBlockMat);
  const leftManifold = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.75, 8), manifoldMat);
  leftManifold.rotation.x = Math.PI / 2;
  leftManifold.position.set(-0.24, 0.18, 0);
  const rightManifold = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.75, 8), manifoldMat);
  rightManifold.rotation.x = Math.PI / 2;
  rightManifold.position.set(0.24, 0.18, 0);

  // Carbon X-Brace over engine
  const braceMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.3, metalness: 0.8 });
  const xBrace1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.1), braceMat);
  xBrace1.rotation.z = 0.65;
  xBrace1.rotation.x = 0.25;
  const xBrace2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.1), braceMat);
  xBrace2.rotation.z = -0.65;
  xBrace2.rotation.x = 0.25;

  v12Group.add(engineBlock, leftManifold, rightManifold, xBrace1, xBrace2);
  v12Group.position.set(0, 0.55, -0.95);
  chassisGroup.add(v12Group);

  // Rear Quarter Panels & Muscular Fenders
  const rearFenderGeo = new THREE.BoxGeometry(0.48, 0.46, 1.6);
  const leftRearFender = new THREE.Mesh(rearFenderGeo, paintMat);
  leftRearFender.position.set(-0.84, 0.52, -1.05);
  leftRearFender.castShadow = true;
  const rightRearFender = new THREE.Mesh(rearFenderGeo, paintMat);
  rightRearFender.position.set(0.84, 0.52, -1.05);
  rightRearFender.castShadow = true;
  chassisGroup.add(leftRearFender, rightRearFender);

  // Front Fenders
  const frontFenderGeo = new THREE.BoxGeometry(0.44, 0.42, 1.35);
  const leftFrontFender = new THREE.Mesh(frontFenderGeo, paintMat);
  leftFrontFender.position.set(-0.84, 0.46, 1.12);
  leftFrontFender.castShadow = true;
  const rightFrontFender = new THREE.Mesh(frontFenderGeo, paintMat);
  rightFrontFender.position.set(0.84, 0.46, 1.12);
  rightFrontFender.castShadow = true;
  chassisGroup.add(leftFrontFender, rightFrontFender);

  // Rear Fascia & Diffuser
  const rearDiffuserGeo = new THREE.BoxGeometry(1.92, 0.38, 0.5);
  const rearDiffuser = new THREE.Mesh(rearDiffuserGeo, carbonMat);
  rearDiffuser.position.set(0, 0.25, -2.05);
  rearDiffuser.castShadow = true;
  chassisGroup.add(rearDiffuser);

  // Diffuser vertical aero fins
  for (let i = -3; i <= 3; i++) {
    const finGeo = new THREE.BoxGeometry(0.04, 0.22, 0.42);
    const fin = new THREE.Mesh(finGeo, carbonMat);
    fin.position.set(i * 0.26, 0.16, -2.1);
    chassisGroup.add(fin);
  }

  // Dual Central High-Mounted Titanium Exhaust Pipes (SVJ style)
  const exhaustMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8, // Titanium heat-treated blue tip
    roughness: 0.2,
    metalness: 0.95,
  });
  const leftExhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 16), exhaustMat);
  leftExhaust.rotation.x = Math.PI / 2;
  leftExhaust.position.set(-0.14, 0.52, -2.05);
  const rightExhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 16), exhaustMat);
  rightExhaust.rotation.x = Math.PI / 2;
  rightExhaust.position.set(0.14, 0.52, -2.05);
  chassisGroup.add(leftExhaust, rightExhaust);

  // Rear Tail Lights (Horizontal Y-arrow cluster)
  const rearTailGroup = new THREE.Group();
  const createTailLight = (isLeft: boolean) => {
    const tl = new THREE.Group();
    const xMult = isLeft ? -1 : 1;
    const bar1 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.02), ledTailMat);
    bar1.position.set(0.65 * xMult, 0.58, -2.06);
    bar1.rotation.z = 0.1 * xMult;
    const bar2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.02), ledTailMat);
    bar2.position.set(0.48 * xMult, 0.55, -2.06);
    tl.add(bar1, bar2);
    return tl;
  };
  rearTailGroup.add(createTailLight(true));
  rearTailGroup.add(createTailLight(false));
  chassisGroup.add(rearTailGroup);

  // Active Rear Wing (SVJ Carbon Fiber ALA 2.0 Wing)
  const wingGroup = new THREE.Group();
  const wingBladeGeo = new THREE.BoxGeometry(2.1, 0.04, 0.42);
  const wingBlade = new THREE.Mesh(wingBladeGeo, carbonMat);
  wingBlade.position.set(0, 1.08, -1.98);
  wingBlade.rotation.x = 0.08;
  wingBlade.castShadow = true;

  // Central ALA pylon / spine (aerodynamic feed channel)
  const pylonCenter = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.48, 0.28), carbonMat);
  pylonCenter.position.set(0, 0.82, -1.94);

  // Outer Wing Stanchions / Struts
  const leftStrut = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, 0.22), carbonMat);
  leftStrut.position.set(-0.65, 0.84, -1.95);
  leftStrut.rotation.z = 0.12;

  const rightStrut = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, 0.22), carbonMat);
  rightStrut.position.set(0.65, 0.84, -1.95);
  rightStrut.rotation.z = -0.12;

  // Wing Endplates
  const leftEndplate = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.25, 0.46), carbonMat);
  leftEndplate.position.set(-1.06, 1.08, -1.98);
  const rightEndplate = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.25, 0.46), carbonMat);
  rightEndplate.position.set(1.06, 1.08, -1.98);

  wingGroup.add(wingBlade, pylonCenter, leftStrut, rightStrut, leftEndplate, rightEndplate);
  chassisGroup.add(wingGroup);

  // Interior Cockpit Elements
  const interiorGroup = new THREE.Group();
  const alcantaraMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
  const accentStitchMat = new THREE.MeshStandardMaterial({ color: 0xff5500, roughness: 0.5 }); // Orange stitching

  // Dashboard
  const dash = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.25, 0.55), alcantaraMat);
  dash.position.set(0, 0.65, 0.35);
  interiorGroup.add(dash);

  // Digital Instrument Cluster Display
  const clusterMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
  const cluster = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.02), clusterMat);
  cluster.position.set(-0.35, 0.72, 0.16);
  cluster.rotation.x = -0.3;
  interiorGroup.add(cluster);

  // Steering Wheel
  const steeringWheelGroup = new THREE.Group();
  const wheelRim = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.022, 12, 24), alcantaraMat);
  const centerHub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 16), carbonMat);
  centerHub.rotation.x = Math.PI / 2;
  const centerStripe = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.03), accentStitchMat);
  centerStripe.position.set(0, 0.14, 0);
  steeringWheelGroup.add(wheelRim, centerHub, centerStripe);
  steeringWheelGroup.position.set(-0.35, 0.68, 0.08);
  steeringWheelGroup.rotation.x = -0.4;
  interiorGroup.add(steeringWheelGroup);

  // Carbon Racing Bucket Seats
  const createSeat = (isLeft: boolean) => {
    const seat = new THREE.Group();
    const x = isLeft ? -0.35 : 0.35;
    // Seat base
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.14, 0.55), alcantaraMat);
    base.position.set(x, 0.35, -0.22);
    // Seat back
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.62, 0.12), alcantaraMat);
    back.position.set(x, 0.65, -0.48);
    back.rotation.x = 0.22;
    // Orange central racing stripe
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.58, 0.02), accentStitchMat);
    stripe.position.set(x, 0.65, -0.41);
    stripe.rotation.x = 0.22;
    seat.add(base, back, stripe);
    return seat;
  };
  interiorGroup.add(createSeat(true));
  interiorGroup.add(createSeat(false));

  chassisGroup.add(interiorGroup);
  carGroup.add(chassisGroup);

  // -------------------------------------------------------------
  // 2. SCISSOR DOORS (Left and Right - Pivoting upwards!)
  // -------------------------------------------------------------
  // Left Scissor Door
  const leftDoor = new THREE.Group();
  // Pivot placed at front A-pillar
  leftDoor.position.set(-0.92, 0.55, 0.65);

  const leftDoorSkin = new THREE.Group();
  const leftDoorPanel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 1.15), paintMat);
  leftDoorPanel.position.set(0, -0.05, -0.55);
  leftDoorPanel.castShadow = true;

  // Door window
  const leftWindow = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.32, 0.95), glassMat);
  leftWindow.position.set(0.02, 0.26, -0.52);

  // Side intake scoop contour on door
  const leftScoop = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.35), carbonMat);
  leftScoop.position.set(-0.04, -0.06, -0.85);
  leftScoop.rotation.y = 0.2;

  // Side rearview mirror (in carbon fiber)
  const leftMirror = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.12), carbonMat);
  leftMirror.position.set(-0.16, 0.22, -0.15);
  leftMirror.rotation.y = -0.2;

  leftDoorSkin.add(leftDoorPanel, leftWindow, leftScoop, leftMirror);
  leftDoor.add(leftDoorSkin);
  carGroup.add(leftDoor);

  // Right Scissor Door
  const rightDoor = new THREE.Group();
  rightDoor.position.set(0.92, 0.55, 0.65);

  const rightDoorSkin = new THREE.Group();
  const rightDoorPanel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 1.15), paintMat);
  rightDoorPanel.position.set(0, -0.05, -0.55);
  rightDoorPanel.castShadow = true;

  const rightWindow = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.32, 0.95), glassMat);
  rightWindow.position.set(-0.02, 0.26, -0.52);

  const rightScoop = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.35), carbonMat);
  rightScoop.position.set(0.04, -0.06, -0.85);
  rightScoop.rotation.y = -0.2;

  const rightMirror = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.12), carbonMat);
  rightMirror.position.set(0.16, 0.22, -0.15);
  rightMirror.rotation.y = 0.2;

  rightDoorSkin.add(rightDoorPanel, rightWindow, rightScoop, rightMirror);
  rightDoor.add(rightDoorSkin);
  carGroup.add(rightDoor);

  // -------------------------------------------------------------
  // 3. WHEELS, RIMS & BRAKE CALIPERS
  // -------------------------------------------------------------
  function buildWheelAssembly(isFront: boolean, isLeft: boolean) {
    const wheelGroup = new THREE.Group();
    const radius = isFront ? 0.36 : 0.38;
    const width = isFront ? 0.26 : 0.32;

    // Tire tread
    const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 28);
    tireGeo.rotateZ(Math.PI / 2);
    const tireMesh = new THREE.Mesh(tireGeo, tireMat);
    tireMesh.castShadow = true;
    wheelGroup.add(tireMesh);

    // Rim outer barrel
    const rimBarrelGeo = new THREE.CylinderGeometry(radius * 0.78, radius * 0.78, width * 0.95, 24, 1, true);
    rimBarrelGeo.rotateZ(Math.PI / 2);
    const rimBarrel = new THREE.Mesh(rimBarrelGeo, rimMat);
    wheelGroup.add(rimBarrel);

    // Forged Y-Spokes (10 spokes / 5 pairs)
    const spokeCount = 5;
    for (let i = 0; i < spokeCount; i++) {
      const angle = (i * Math.PI * 2) / spokeCount;
      const spokeGroup = new THREE.Group();

      const spoke1 = new THREE.Mesh(new THREE.BoxGeometry(width * 0.9, radius * 0.65, 0.03), rimMat);
      spoke1.position.set(0, radius * 0.35, 0.02);
      spoke1.rotation.z = 0.08;

      const spoke2 = new THREE.Mesh(new THREE.BoxGeometry(width * 0.9, radius * 0.65, 0.03), rimMat);
      spoke2.position.set(0, radius * 0.35, -0.02);
      spoke2.rotation.z = -0.08;

      spokeGroup.add(spoke1, spoke2);
      spokeGroup.rotation.x = angle;
      wheelGroup.add(spokeGroup);
    }

    // Center lock nut
    const centerNut = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, width * 1.02, 6), carbonMat);
    centerNut.rotateZ(Math.PI / 2);
    wheelGroup.add(centerNut);

    // Drilled Brake Rotor (Carbon Ceramic CCB)
    const rotorGeo = new THREE.CylinderGeometry(radius * 0.68, radius * 0.68, 0.025, 24);
    rotorGeo.rotateZ(Math.PI / 2);
    const rotor = new THREE.Mesh(rotorGeo, rotorMat);
    rotor.position.set(isLeft ? 0.02 : -0.02, 0, 0);
    wheelGroup.add(rotor);

    // Monobloc Brake Caliper (SVJ 6-piston front / 4-piston rear)
    const caliperGeo = new THREE.BoxGeometry(0.06, 0.16, 0.09);
    const caliper = new THREE.Mesh(caliperGeo, caliperMat);
    caliper.position.set(isLeft ? -0.05 : 0.05, radius * 0.42, 0.08);
    caliper.rotation.x = -0.4;
    wheelGroup.add(caliper);

    return wheelGroup;
  }

  // Front wheel steering knuckles
  const frontLeftKnuckle = new THREE.Group();
  frontLeftKnuckle.position.set(-0.95, 0.36, 1.35);
  const frontLeftWheel = buildWheelAssembly(true, true);
  frontLeftKnuckle.add(frontLeftWheel);
  carGroup.add(frontLeftKnuckle);

  const frontRightKnuckle = new THREE.Group();
  frontRightKnuckle.position.set(0.95, 0.36, 1.35);
  const frontRightWheel = buildWheelAssembly(true, false);
  frontRightKnuckle.add(frontRightWheel);
  carGroup.add(frontRightKnuckle);

  // Rear wheels
  const rearLeftWheel = buildWheelAssembly(false, true);
  rearLeftWheel.position.set(-0.98, 0.38, -1.35);
  carGroup.add(rearLeftWheel);

  const rearRightWheel = buildWheelAssembly(false, false);
  rearRightWheel.position.set(0.98, 0.38, -1.35);
  carGroup.add(rearRightWheel);

  // -------------------------------------------------------------
  // 4. EXHAUST FLAME BURST PARTICLES (On throttle rev)
  // -------------------------------------------------------------
  const sparkCount = 40;
  const sparkGeo = new THREE.BufferGeometry();
  const sparkPositions = new Float32Array(sparkCount * 3);
  for (let i = 0; i < sparkCount * 3; i++) {
    sparkPositions[i] = 0;
  }
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
  const sparkMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.08,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  });
  const exhaustSparks = new THREE.Points(sparkGeo, sparkMat);
  exhaustSparks.position.set(0, 0.52, -2.15);
  carGroup.add(exhaustSparks);

  // -------------------------------------------------------------
  // UPDATE / ANIMATE CONFIG FUNCTION
  // -------------------------------------------------------------
  const update = (config: CarConfig) => {
    // 1. Paint Color & Finish
    const col = new THREE.Color(config.bodyColor);
    bodyMaterials.forEach((m) => {
      m.color.copy(col);
      m.metalness = config.finishType === 'matte' ? 0.2 : config.finishType === 'carbon' ? 0.75 : 0.88;
      m.roughness = config.finishType === 'matte' ? 0.65 : config.finishType === 'gloss' ? 0.1 : 0.22;
      m.clearcoat = config.finishType === 'matte' ? 0.0 : 1.0;
    });

    // 2. Wheel Rims Color
    const rimCol = new THREE.Color(config.wheelColor);
    rimMaterials.forEach((m) => m.color.copy(rimCol));

    // 3. Brake Caliper Color
    const calCol = new THREE.Color(config.caliperColor);
    caliperMaterials.forEach((m) => m.color.copy(calCol));

    // 4. Scissor Doors Kinematics (Up & Outward pivot)
    // When config.doorAngle = 0 -> door is closed.
    // When config.doorAngle = 1 -> door rotates up by ~65° (1.1 rad) and swings out by 10° (0.17 rad).
    const targetAngle = config.doorAngle;
    const currentAngle = leftDoor.rotation.x;
    const doorSpeed = 0.15;
    const newAngle = currentAngle + (targetAngle * 1.15 - currentAngle) * doorSpeed;

    leftDoor.rotation.x = newAngle;
    leftDoor.rotation.y = newAngle * 0.18;
    leftDoor.rotation.z = -newAngle * 0.12;

    rightDoor.rotation.x = newAngle;
    rightDoor.rotation.y = -newAngle * 0.18;
    rightDoor.rotation.z = newAngle * 0.12;

    // 5. Headlights State
    const hlColor = config.headlightsOn
      ? config.highBeamsOn
        ? 0xffffff
        : 0x93c5fd
      : 0x334155;
    headlightLeds.forEach((l) => l.color.setHex(hlColor));
    headlightCones.forEach((cone) => {
      cone.intensity = config.headlightsOn ? (config.highBeamsOn ? 6.0 : 3.0) : 0;
    });

    // 6. Aero package active wing angle
    if (config.aeroPackage === 'svj') {
      wingBlade.rotation.x = 0.12; // High downforce
      wingGroup.visible = true;
    } else if (config.aeroPackage === 'track') {
      wingBlade.rotation.x = 0.22; // Extreme track downforce
      wingGroup.visible = true;
    } else {
      wingBlade.rotation.x = 0.02; // Low drag touring
      wingGroup.visible = true;
    }

    // 7. Steering angle
    if (typeof config.steerAngle === 'number') {
      frontLeftKnuckle.rotation.y = config.steerAngle;
      frontRightKnuckle.rotation.y = config.steerAngle;
    }

    // 8. Wheel roll rotation (when driving)
    if (typeof config.wheelRotation === 'number') {
      frontLeftWheel.rotation.x = config.wheelRotation;
      frontRightWheel.rotation.x = config.wheelRotation;
      rearLeftWheel.rotation.x = config.wheelRotation;
      rearRightWheel.rotation.x = config.wheelRotation;
    }
  };

  return {
    group: carGroup,
    leftDoor,
    rightDoor,
    frontLeftWheel,
    frontRightWheel,
    rearLeftWheel,
    rearRightWheel,
    bodyMaterials,
    caliperMaterials,
    rimMaterials,
    headlightLeds,
    headlightCones,
    wingGroup,
    exhaustSparks,
    update,
  };
}
