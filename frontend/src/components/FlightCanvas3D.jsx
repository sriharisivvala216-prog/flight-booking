import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Procedural Realistic Commercial Passenger Jet (Boeing 787 / Airbus A350 inspired)
 * Includes detailed fuselage, cockpit windshield, wings with winglets, turbofan engines
 * with spinning fan blades, and a fully functional retractable landing gear system.
 */
function createCommercialAirlinerWithGear() {
  const plane = new THREE.Group();

  // Premium PBR Materials
  const fuselageMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.38,
    roughness: 0.22,
    envMapIntensity: 2.2,
  });

  const bellyMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.6,
    roughness: 0.25,
  });

  const airlineCyanMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Elegant airline cyan
    metalness: 0.55,
    roughness: 0.2,
  });

  const cockpitGlassMat = new THREE.MeshStandardMaterial({
    color: 0x081226,
    metalness: 0.95,
    roughness: 0.04,
    envMapIntensity: 2.5,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.92,
    roughness: 0.08,
  });

  const engineDarkMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.75,
    roughness: 0.35,
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.85,
    metalness: 0.1,
  });

  // 1. FUSELAGE
  // Main cylindrical cabin
  const bodyGeo = new THREE.CylinderGeometry(1.42, 1.42, 18, 36);
  bodyGeo.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, fuselageMat);
  body.position.z = -2;
  body.castShadow = true;
  body.receiveShadow = true;
  plane.add(body);

  // Aerodynamic Nose Cone (Smooth lofted dome)
  const noseGeo = new THREE.SphereGeometry(1.42, 36, 20, 0, Math.PI * 2, 0, Math.PI / 2);
  noseGeo.rotateX(Math.PI / 2);
  noseGeo.scale(1, 1, 2.5);
  const nose = new THREE.Mesh(noseGeo, fuselageMat);
  nose.position.z = 7;
  nose.castShadow = true;
  plane.add(nose);

  // Cockpit Glass Windshield
  const cockpitGeo = new THREE.CylinderGeometry(1.39, 1.44, 2.0, 24, 1, false, Math.PI * 0.72, Math.PI * 0.56);
  cockpitGeo.rotateX(Math.PI / 2);
  const cockpit = new THREE.Mesh(cockpitGeo, cockpitGlassMat);
  cockpit.position.set(0, 0.48, 6.2);
  cockpit.rotation.x = 0.28;
  plane.add(cockpit);

  // Fuselage lower belly paint
  const bellyGeo = new THREE.CylinderGeometry(1.43, 1.43, 16.5, 36, 1, false, Math.PI * 0.8, Math.PI * 0.4);
  bellyGeo.rotateX(Math.PI / 2);
  const belly = new THREE.Mesh(bellyGeo, bellyMat);
  belly.position.z = -1.2;
  plane.add(belly);

  // Passenger Cabin Windows
  const windowMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
  for (let i = 0; i < 18; i++) {
    const wz = 4.8 - i * 0.85;
    const winR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.38), windowMat);
    winR.position.set(1.41, 0.26, wz);
    plane.add(winR);

    const winL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.38), windowMat);
    winL.position.set(-1.41, 0.26, wz);
    plane.add(winL);
  }

  // Tapered Tail cone
  const tailConeGeo = new THREE.ConeGeometry(1.42, 7.5, 36);
  tailConeGeo.rotateX(Math.PI / 2);
  const tailCone = new THREE.Mesh(tailConeGeo, fuselageMat);
  tailCone.position.z = -14.8;
  tailCone.castShadow = true;
  plane.add(tailCone);

  // 2. MAIN WINGS (Swept-back with aerodynamic dihedral and winglets)
  const buildMainWing = (isRight) => {
    const wingGroup = new THREE.Group();
    const sign = isRight ? 1 : -1;

    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(13.5 * sign, -6.5);
    wingShape.lineTo(13.5 * sign, -8.2);
    wingShape.lineTo(0, -5.2);
    wingShape.closePath();

    const extrudeSettings = {
      depth: 0.3,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    };

    const wingGeom = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
    wingGeom.rotateX(Math.PI / 2);
    const wingMesh = new THREE.Mesh(wingGeom, fuselageMat);
    wingMesh.castShadow = true;
    wingMesh.receiveShadow = true;
    wingGroup.add(wingMesh);

    // Dynamic upward Winglet
    const wingletGeo = new THREE.BoxGeometry(0.12, 2.0, 1.5);
    const winglet = new THREE.Mesh(wingletGeo, airlineCyanMat);
    winglet.position.set(13.5 * sign, 0.95, -7.4);
    winglet.rotation.z = sign * -0.28;
    wingGroup.add(winglet);

    wingGroup.position.set(sign * 1.0, -0.25, 0.8);
    wingGroup.rotation.z = sign * -0.05; // Dihedral angle
    return wingGroup;
  };

  plane.add(buildMainWing(true));
  plane.add(buildMainWing(false));

  // 3. ENGINES WITH SPINNING FAN BLADES & SUBTLE HEAT REFRACTION
  const fanBlades = [];
  const engineExhausts = [];

  const buildEngine = (isRight) => {
    const engineGroup = new THREE.Group();
    const sign = isRight ? 1 : -1;

    // Pylon
    const pylonGeo = new THREE.BoxGeometry(0.22, 0.85, 2.8);
    const pylon = new THREE.Mesh(pylonGeo, chromeMat);
    pylon.position.set(0, 0.5, 0);
    engineGroup.add(pylon);

    // Nacelle Cowl
    const nacelleGeo = new THREE.CylinderGeometry(1.02, 0.92, 4.0, 36, 1, true);
    nacelleGeo.rotateX(Math.PI / 2);
    const nacelle = new THREE.Mesh(nacelleGeo, fuselageMat);
    nacelle.castShadow = true;
    engineGroup.add(nacelle);

    // Front intake lip ring (Polished Chrome)
    const intakeRingGeo = new THREE.TorusGeometry(1.02, 0.1, 16, 36);
    const intakeRing = new THREE.Mesh(intakeRingGeo, chromeMat);
    intakeRing.position.z = 2.0;
    engineGroup.add(intakeRing);

    // Spinner Cone
    const spinnerGeo = new THREE.ConeGeometry(0.38, 1.3, 24);
    spinnerGeo.rotateX(Math.PI / 2);
    const spinner = new THREE.Mesh(spinnerGeo, chromeMat);
    spinner.position.z = 1.35;
    engineGroup.add(spinner);

    // Spinning Turbine Fan Blades
    const fanGroup = new THREE.Group();
    const bladeGeo = new THREE.BoxGeometry(0.04, 0.9, 0.18);
    bladeGeo.rotateY(0.45);
    for (let b = 0; b < 20; b++) {
      const blade = new THREE.Mesh(bladeGeo, engineDarkMat);
      blade.rotation.z = (b / 20) * Math.PI * 2;
      blade.position.y = Math.sin((b / 20) * Math.PI * 2) * 0.48;
      blade.position.x = Math.cos((b / 20) * Math.PI * 2) * 0.48;
      fanGroup.add(blade);
    }
    fanGroup.position.z = 1.3;
    engineGroup.add(fanGroup);
    fanBlades.push(fanGroup);

    // Subtle Engine Exhaust Heat Core (Very subtle refraction glow, NO heavy smoke)
    const exhaustHeatMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.15,
    });
    const exhaustCone = new THREE.Mesh(new THREE.ConeGeometry(0.75, 4.5, 16, 1, true), exhaustHeatMat);
    exhaustCone.rotateX(-Math.PI / 2);
    exhaustCone.position.z = -4.2;
    engineGroup.add(exhaustCone);
    engineExhausts.push(exhaustCone);

    engineGroup.position.set(sign * 4.9, -1.2, 0.2);
    return engineGroup;
  };

  plane.add(buildEngine(true));
  plane.add(buildEngine(false));

  // 4. TAIL VERTICAL STABILIZER & HORIZONTAL WINGS
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);
  finShape.lineTo(0, 5.8);
  finShape.lineTo(-2.4, 5.3);
  finShape.lineTo(-4.6, 0);
  finShape.closePath();
  const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.26, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05 });
  finGeo.rotateY(Math.PI / 2);
  const fin = new THREE.Mesh(finGeo, airlineCyanMat);
  fin.position.set(-0.13, 1.25, -12.5);
  fin.castShadow = true;
  plane.add(fin);

  const rearWingR = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.14, 1.6), fuselageMat);
  rearWingR.position.set(2.4, 0.4, -15.5);
  rearWingR.rotation.y = 0.2;
  rearWingR.castShadow = true;
  plane.add(rearWingR);

  const rearWingL = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.14, 1.6), fuselageMat);
  rearWingL.position.set(-2.4, 0.4, -15.5);
  rearWingL.rotation.y = -0.2;
  rearWingL.castShadow = true;
  plane.add(rearWingL);

  // 5. RETRACTABLE LANDING GEAR SYSTEM
  // Nose Gear (Forward under fuselage)
  const noseGearRig = new THREE.Group();
  noseGearRig.position.set(0, -1.3, 5.8);

  const noseStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 12), chromeMat);
  noseStrut.position.y = -0.7;
  noseGearRig.add(noseStrut);

  const noseAxle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 12), chromeMat);
  noseAxle.rotateZ(Math.PI / 2);
  noseAxle.position.y = -1.35;
  noseGearRig.add(noseAxle);

  const noseWheelL = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.16, 20), tireMat);
  noseWheelL.rotateZ(Math.PI / 2);
  noseWheelL.position.set(-0.25, -1.35, 0);
  noseGearRig.add(noseWheelL);

  const noseWheelR = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.16, 20), tireMat);
  noseWheelR.rotateZ(Math.PI / 2);
  noseWheelR.position.set(0.25, -1.35, 0);
  noseGearRig.add(noseWheelR);

  plane.add(noseGearRig);

  // Main Landing Gear (Dual Left and Right under wings/belly)
  const createMainGear = (sign) => {
    const mainGearRig = new THREE.Group();
    mainGearRig.position.set(sign * 2.6, -1.2, -1.4);

    const mainStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.7, 12), chromeMat);
    mainStrut.position.y = -0.85;
    mainGearRig.add(mainStrut);

    // 4-wheel bogie
    const bogieBeam = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 1.1), chromeMat);
    bogieBeam.position.y = -1.65;
    mainGearRig.add(bogieBeam);

    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.2, 20);
    wheelGeo.rotateZ(Math.PI / 2);

    [-0.38, 0.38].forEach((zOff) => {
      const wL = new THREE.Mesh(wheelGeo, tireMat);
      wL.position.set(-0.26, -1.65, zOff);
      mainGearRig.add(wL);

      const wR = new THREE.Mesh(wheelGeo, tireMat);
      wR.position.set(0.26, -1.65, zOff);
      mainGearRig.add(wR);
    });

    return mainGearRig;
  };

  const mainGearLeft = createMainGear(-1);
  const mainGearRight = createMainGear(1);
  plane.add(mainGearLeft);
  plane.add(mainGearRight);

  // Scale plane to natural proportion
  plane.scale.set(0.62, 0.62, 0.62);

  return {
    plane,
    fanBlades,
    engineExhausts,
    noseGearRig,
    mainGearLeft,
    mainGearRight,
  };
}

export default function FlightCanvas3D({ onExplore, onSearchRoute }) {
  const containerRef = useRef(null);
  const [telemetry, setTelemetry] = useState({
    altitude: 0,
    speed: 0,
    phase: 'TAKEOFF ROLL',
    gearStatus: 'DOWN & LOCKED',
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    // Clean cinematic blue sky atmosphere with depth fog
    scene.background = new THREE.Color(0x38bdf8);
    scene.fog = new THREE.FogExp2(0x7dd3fc, 0.0035);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    // Initial camera positioned behind-left of the runway facing forward
    camera.position.set(0, 5, 24);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: window.innerWidth > 768,
      alpha: true,
      powerPreference: 'high-performance',
    });
    // Limit pixel ratio for performance on mobile
    const isMobile = window.innerWidth <= 768;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = !isMobile; // Disable shadows on mobile for performance
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);


    // --- Cinematic Sky & Sun Lighting ---
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 4.2);
    sunLight.position.set(60, 90, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 400;
    const shadowDist = 45;
    sunLight.shadow.camera.left = -shadowDist;
    sunLight.shadow.camera.right = shadowDist;
    sunLight.shadow.camera.top = shadowDist;
    sunLight.shadow.camera.bottom = -shadowDist;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const skyFillLight = new THREE.DirectionalLight(0x0284c7, 1.8);
    skyFillLight.position.set(-50, 40, -40);
    scene.add(skyFillLight);

    // Ground Bounce Light
    const groundBounce = new THREE.DirectionalLight(0xf8fafc, 1.2);
    groundBounce.position.set(0, -30, 20);
    scene.add(groundBounce);

    // --- Runway & Airport Ground Setup ---
    const groundGroup = new THREE.Group();
    scene.add(groundGroup);

    // Vast Green/Earth Surrounding Airfield
    const airfieldGeo = new THREE.PlaneGeometry(1600, 1600);
    airfieldGeo.rotateX(-Math.PI / 2);
    const airfieldMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.9,
      metalness: 0.1,
    });
    const airfield = new THREE.Mesh(airfieldGeo, airfieldMat);
    airfield.position.y = -0.05;
    airfield.receiveShadow = true;
    groundGroup.add(airfield);

    // Runway Tarmac Strip (Starts at bottom-center, stretches into distance)
    const runwayGeo = new THREE.PlaneGeometry(28, 400);
    runwayGeo.rotateX(-Math.PI / 2);
    const runwayMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.2,
    });
    const runway = new THREE.Mesh(runwayGeo, runwayMat);
    runway.position.set(0, 0, -120);
    runway.receiveShadow = true;
    groundGroup.add(runway);

    // Runway Centerline White Dashes
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let d = -280; d <= 40; d += 16) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 8), dashMat);
      dash.rotateX(-Math.PI / 2);
      dash.position.set(0, 0.02, d);
      groundGroup.add(dash);
    }

    // Runway Touchdown Threshold Stripes
    for (let s = -9; s <= 9; s += 2) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 14), dashMat);
      stripe.rotateX(-Math.PI / 2);
      stripe.position.set(s, 0.02, 28);
      groundGroup.add(stripe);
    }

    // Runway Edge Lights (Gleaming white/amber points)
    const lightMatWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lightMatAmber = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    for (let r = -280; r <= 40; r += 20) {
      const lampL = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), r > -80 ? lightMatWhite : lightMatAmber);
      lampL.position.set(-14.2, 0.25, r);
      groundGroup.add(lampL);

      const lampR = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), r > -80 ? lightMatWhite : lightMatAmber);
      lampR.position.set(14.2, 0.25, r);
      groundGroup.add(lampR);
    }

    // --- Soft Floating Cumulus Clouds in the Sky ---
    const cloudsGroup = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      metalness: 0.05,
      transparent: true,
      opacity: 0.85,
      flatShading: true,
    });

    const cloudPuffGeo = [
      new THREE.DodecahedronGeometry(8, 1),
      new THREE.DodecahedronGeometry(12, 1),
      new THREE.DodecahedronGeometry(16, 1),
    ];

    // Distant realistic clouds in the climb corridor
    for (let c = 0; c < 28; c++) {
      const cloudCluster = new THREE.Group();
      const numPuffs = 4 + Math.floor(Math.random() * 4);

      for (let p = 0; p < numPuffs; p++) {
        const geo = cloudPuffGeo[Math.floor(Math.random() * cloudPuffGeo.length)];
        const puff = new THREE.Mesh(geo, cloudMat);
        puff.position.set(
          (Math.random() - 0.5) * 25,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 25
        );
        const s = 0.8 + Math.random() * 0.7;
        puff.scale.set(s, s * 0.6, s);
        cloudCluster.add(puff);
      }

      cloudCluster.position.set(
        -80 + Math.random() * 320,
        35 + Math.random() * 70,
        -180 - Math.random() * 260
      );
      cloudsGroup.add(cloudCluster);
    }
    scene.add(cloudsGroup);

    // --- Build The 3D Commercial Airplane ---
    const airplaneData = createCommercialAirlinerWithGear();
    const {
      plane: airplaneRig,
      fanBlades,
      engineExhausts,
      noseGearRig,
      mainGearLeft,
      mainGearRight,
    } = airplaneData;
    scene.add(airplaneRig);

    // Beacons (Port red, Starboard green, Strobe)
    const redBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff0033 }));
    const greenBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), new THREE.MeshBasicMaterial({ color: 0x00ff66 }));
    const tailStrobe = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));

    airplaneRig.add(redBeacon);
    airplaneRig.add(greenBeacon);
    airplaneRig.add(tailStrobe);

    redBeacon.position.set(-10.2, 0.4, -4.2);
    greenBeacon.position.set(10.2, 0.4, -4.2);
    tailStrobe.position.set(0, 5.0, -10.5);

    // Initial position on the runway: bottom-center
    // On the runway ground, gear is touching the tarmac at Y ~ 1.85
    airplaneRig.position.set(0, 1.82, 35);
    airplaneRig.rotation.set(0, Math.PI, 0); // Facing down the runway (-Z)

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Cinematic Takeoff & Climb Animation Loop ---
    let frameId;
    const clock = new THREE.Clock();

    // Duration of full takeoff & climb cycle in seconds
    const CYCLE_DURATION = 14.0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Cycle progress from 0.0 to 1.0
      const cycleTime = elapsed % CYCLE_DURATION;
      const progress = cycleTime / CYCLE_DURATION;

      // 1. TAKEOFF TIMELINE STAGES:
      // - 0.0 to 0.28: Ground roll & acceleration at bottom-center
      // - 0.28 to 0.42: Nose rotation (Vr) & liftoff
      // - 0.42 to 0.65: Initial climb, gear retraction, rightward bank
      // - 0.65 to 0.90: Soaring climb toward upper-right into clouds
      // - 0.90 to 1.00: Smooth transition / reset

      let planeX = 0;
      let planeY = 1.82;
      let planeZ = 35;
      let pitchDeg = 0;
      let bankDeg = 0;
      let yawRad = Math.PI; // Heading down-runway (-Z)
      let gearRetractAmount = 0; // 0 = Down, 1 = Retracted
      let currentPhase = 'TAKEOFF ROLL';
      let speedKnots = 0;
      let altFeet = 0;

      if (progress < 0.28) {
        // --- PHASE 1: GROUND ROLL & ACCELERATION ---
        const t = progress / 0.28;
        // Smooth quadratic acceleration
        const groundDist = Math.pow(t, 2) * 85;
        planeZ = 35 - groundDist;
        planeX = 0;
        planeY = 1.82;

        pitchDeg = 0;
        bankDeg = 0;
        gearRetractAmount = 0;
        currentPhase = 'TAKEOFF ROLL • ACCELERATING';
        speedKnots = Math.round(t * 145);
        altFeet = 0;

      } else if (progress < 0.42) {
        // --- PHASE 2: ROTATION (Vr) & LIFTOFF ---
        const t = (progress - 0.28) / 0.14;
        // Smooth ease-out pitch up
        const easePitch = Math.sin(t * (Math.PI / 2));
        pitchDeg = easePitch * 11.5; // Rotate nose up 11.5 degrees

        // Liftoff begins halfway through rotation
        const liftOffProgress = Math.max(0, (t - 0.4) / 0.6);
        const climbEase = Math.pow(liftOffProgress, 1.8);

        planeZ = -50 - t * 45;
        planeY = 1.82 + climbEase * 8.5;
        planeX = Math.pow(liftOffProgress, 1.5) * 4.5;

        // Slight rightward bank as climb starts
        bankDeg = liftOffProgress * 5.0;
        gearRetractAmount = 0;
        currentPhase = liftOffProgress > 0 ? 'ROTATION & LIFTOFF (V2)' : 'ROTATION (Vr)';
        speedKnots = Math.round(145 + t * 40);
        altFeet = Math.round(climbEase * 480);

      } else if (progress < 0.70) {
        // --- PHASE 3: CLIMB & GEAR RETRACTION ---
        const t = (progress - 0.42) / 0.28;
        // Ascending diagonally toward upper-right
        planeZ = -95 - t * 110;
        planeY = 10.32 + t * 42.0;
        planeX = 4.5 + t * 38.0;

        // Smooth aerodynamic banking toward the upper-right
        bankDeg = 5.0 + Math.sin(t * Math.PI) * 11.0; // Bank up to 16 degrees
        pitchDeg = 11.5 - t * 2.5; // Stable 9-11 deg climb pitch
        yawRad = Math.PI - (t * 0.22); // Turn towards upper-right

        // Gear retracts smoothly after liftoff (from t=0.15 to 0.7)
        gearRetractAmount = Math.min(1, Math.max(0, (t - 0.15) / 0.55));
        currentPhase = gearRetractAmount >= 1 ? 'POSITIVE CLIMB • GEAR UP' : 'GEAR RETRACTING';
        speedKnots = Math.round(185 + t * 90);
        altFeet = Math.round(480 + t * 3200);

      } else if (progress < 0.92) {
        // --- PHASE 4: HIGH-ALTITUDE CLIMB TOWARD UPPER-RIGHT ---
        const t = (progress - 0.70) / 0.22;
        planeZ = -205 - t * 120;
        planeY = 52.32 + t * 38.0;
        planeX = 42.5 + t * 40.0;

        // Leveling out wings from the bank
        bankDeg = 14.0 * (1 - t * 0.7);
        pitchDeg = 9.0 - t * 1.5;
        yawRad = Math.PI - 0.22;

        gearRetractAmount = 1;
        currentPhase = 'CRUISE CLIMB • UPPER-RIGHT SKY';
        speedKnots = Math.round(275 + t * 85);
        altFeet = Math.round(3680 + t * 5200);

      } else {
        // --- PHASE 5: SMOOTH LOOP RESET ---
        const t = (progress - 0.92) / 0.08;
        const fadeOut = 1 - t;
        planeZ = -325 - t * 40;
        planeY = 90.32 + t * 10.0;
        planeX = 82.5 + t * 12.0;

        airplaneRig.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.transparent = true;
            child.material.opacity = Math.max(0.05, fadeOut);
          }
        });

        gearRetractAmount = 1;
        currentPhase = 'CIRCLING AIRFIELD';
        speedKnots = 360;
        altFeet = 9200;
      }

      // Reset opacity when starting fresh cycle
      if (progress < 0.05) {
        airplaneRig.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.opacity = 1.0;
          }
        });
      }

      // Apply Plane Position
      airplaneRig.position.set(planeX, planeY, planeZ);

      // Apply Plane Orientation (Pitch up, Bank roll, Heading yaw)
      airplaneRig.rotation.y = yawRad;
      airplaneRig.rotation.x = (pitchDeg * Math.PI) / 180;
      airplaneRig.rotation.z = (-bankDeg * Math.PI) / 180;

      // 2. RETRACTABLE GEAR ANIMATION:
      // Struts pivot smoothly inwards and fold up into wheel bay
      const retractAngle = (gearRetractAmount * (Math.PI / 2));
      noseGearRig.rotation.x = -retractAngle;
      noseGearRig.position.y = -1.3 + gearRetractAmount * 0.6;
      mainGearLeft.rotation.z = retractAngle;
      mainGearRight.rotation.z = -retractAngle;

      // 3. ENGINE TURBINE SPINNING:
      const fanSpeed = 0.5 + (speedKnots / 360) * 0.6;
      fanBlades.forEach((fan) => {
        fan.rotation.z += fanSpeed;
      });

      // Subtle heat exhaust shimmer expansion with thrust
      engineExhausts.forEach((cone) => {
        const pulse = 1.0 + Math.sin(elapsed * 24) * 0.15;
        cone.scale.set(pulse, pulse, 1.0 + (speedKnots / 360) * 0.8);
      });

      // 4. BEACONS FLASHING:
      const beaconOn = Math.floor(elapsed * 2) % 2 === 0;
      const strobeOn = Math.sin(elapsed * 8) > 0.86;
      redBeacon.visible = beaconOn;
      greenBeacon.visible = beaconOn;
      tailStrobe.visible = strobeOn;

      // 5. DYNAMIC CAMERA TRACKING:
      // Camera smoothly follows the airplane from the runway up into the sky
      if (progress < 0.28) {
        // Ground camera tracking alongside acceleration
        camera.position.set(
          planeX * 0.4 - 3,
          4.5,
          planeZ + 22
        );
        camera.lookAt(planeX, planeY + 1.2, planeZ - 12);
      } else {
        // Ascending cinematic chase camera tracking the climb to the upper-right
        const targetCamX = planeX * 0.65 - 12;
        const targetCamY = planeY * 0.75 + 6.5;
        const targetCamZ = planeZ + 24;

        camera.position.x += (targetCamX - camera.position.x) * 0.06;
        camera.position.y += (targetCamY - camera.position.y) * 0.06;
        camera.position.z += (targetCamZ - camera.position.z) * 0.06;

        camera.lookAt(
          planeX + 4.0,
          planeY + 1.5,
          planeZ - 8.0
        );
      }

      // Render
      renderer.render(scene, camera);

      // 6. UPDATE FLIGHT TELEMETRY HUD
      setTelemetry({
        altitude: altFeet,
        speed: speedKnots,
        phase: currentPhase,
        gearStatus: gearRetractAmount >= 1 ? 'UP & RETRACTED' : gearRetractAmount > 0 ? 'RETRACTING...' : 'DOWN & LOCKED',
      });
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="takeoff-3d-stage">
      {/* 3D WebGL Takeoff Canvas */}
      <div ref={containerRef} className="flight-3d-canvas" />

      {/* Atmospheric Horizon Gradient (Soft sky fade) */}
      <div className="takeoff-sky-gradient" />

      {/* Real-time Avionics HUD (Top-Right) */}
      <div className="flight-hud takeoff-hud">
        <div className="hud-header">
          <span className="hud-blip" />
          <span className="hud-title">REAL-TIME TAKEOFF & CLIMB TELEMETRY</span>
        </div>
        <div className="hud-grid">
          <div className="hud-metric">
            <span className="hud-label">AIRSPEED (IAS)</span>
            <span className="hud-value">{telemetry.speed} KTS</span>
          </div>
          <div className="hud-metric">
            <span className="hud-label">ALTITUDE</span>
            <span className="hud-value">{telemetry.altitude.toLocaleString()} FT</span>
          </div>
          <div className="hud-metric">
            <span className="hud-label">LANDING GEAR</span>
            <span className="hud-value hud-gear">{telemetry.gearStatus}</span>
          </div>
          <div className="hud-metric">
            <span className="hud-label">FLIGHT VECTOR</span>
            <span className="hud-value">CLIMB ➔ UPPER-RIGHT</span>
          </div>
        </div>
        <div className="hud-footer">
          <span className="hud-route">{telemetry.phase}</span>
          <span className="hud-badge takeoff-badge">
            {telemetry.altitude > 0 ? 'ROTATION COMPLETED • CLIMBING' : 'RUNWAY 09L • ROLLING'}
          </span>
        </div>
      </div>

      {/* Subtext Tag (Bottom-Right) */}
      <div className="hud-hint">
        <span className="hint-icon">✈</span>
        Smooth continuous runway takeoff & diagonal climb toward upper-right
      </div>
    </div>
  );
}
