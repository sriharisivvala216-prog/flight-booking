import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { 
  Plane, 
  Globe as GlobeIcon, 
  Compass, 
  Wind, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Sparkles, 
  Eye, 
  ShieldCheck, 
  Wifi, 
  Navigation,
  Sun,
  Moon,
  Zap,
  Luggage
} from 'lucide-react';

/* ── Global Airport Coordinates for 3D Globe Radar ────────────────────────── */
export const GLOBAL_HUBS = [
  { code: 'JFK', city: 'New York', country: 'United States', lat: 40.6413, lon: -73.7781, flag: '🇺🇸', activeFlights: 42 },
  { code: 'LHR', city: 'London', country: 'United Kingdom', lat: 51.4700, lon: -0.4543, flag: '🇬🇧', activeFlights: 38 },
  { code: 'DXB', city: 'Dubai', country: 'United Arab Emirates', lat: 25.2532, lon: 55.3657, flag: '🇦🇪', activeFlights: 54 },
  { code: 'HND', city: 'Tokyo', country: 'Japan', lat: 35.5494, lon: 139.7798, flag: '🇯🇵', activeFlights: 36 },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', lat: 1.3644, lon: 103.9915, flag: '🇸🇬', activeFlights: 31 },
  { code: 'CDG', city: 'Paris', country: 'France', lat: 49.0097, lon: 2.5479, flag: '🇫🇷', activeFlights: 29 },
  { code: 'SYD', city: 'Sydney', country: 'Australia', lat: -33.9399, lon: 151.1753, flag: '🇦🇺', activeFlights: 22 },
  { code: 'DEL', city: 'New Delhi', country: 'India', lat: 28.5562, lon: 77.1000, flag: '🇮🇳', activeFlights: 45 },
  { code: 'SFO', city: 'San Francisco', country: 'United States', lat: 37.6213, lon: -122.3790, flag: '🇺🇸', activeFlights: 27 },
];

export const FLIGHT_CONNECTIONS = [
  { from: 'JFK', to: 'DXB', color: 0x00f2fe, duration: '12h 45m', flightNo: 'AL-202' },
  { from: 'LHR', to: 'SIN', color: 0x38bdf8, duration: '13h 10m', flightNo: 'AL-317' },
  { from: 'SFO', to: 'HND', color: 0x818cf8, duration: '11h 20m', flightNo: 'AL-108' },
  { from: 'CDG', to: 'JFK', color: 0x00e5ff, duration: '08h 15m', flightNo: 'AL-007' },
  { from: 'HND', to: 'SYD', color: 0xf59e0b, duration: '09h 50m', flightNo: 'AL-884' },
  { from: 'DEL', to: 'DXB', color: 0x10b981, duration: '03h 40m', flightNo: 'AL-512' },
  { from: 'LHR', to: 'JFK', color: 0x38bdf8, duration: '07h 55m', flightNo: 'AL-101' },
];

// Helper to convert Lat/Lon to 3D Cartesian Vector on a sphere of radius R
function latLonToVector3(lat, lon, radius, alt = 0) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const r = radius + alt;
  const x = -(r * Math.sin(phi) * Math.cos(theta));
  const z = r * Math.sin(phi) * Math.sin(theta);
  const y = r * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

/**
 * Procedural Supersonic Commercial Jet (Fallback & High-Speed Cruiser)
 */
function createProceduralSupersonicJet() {
  const jetGroup = new THREE.Group();

  // Materials
  const titaniumHullMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.85,
    roughness: 0.18,
    envMapIntensity: 2.5,
  });

  const cyberBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    metalness: 0.7,
    roughness: 0.2,
  });

  const darkTrimMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    metalness: 0.9,
    roughness: 0.15,
  });

  const cockpitGlassMat = new THREE.MeshStandardMaterial({
    color: 0x031525,
    metalness: 0.98,
    roughness: 0.05,
    transparent: true,
    opacity: 0.88,
  });

  const glowPlasmaMat = new THREE.MeshBasicMaterial({
    color: 0x00f2fe,
  });

  // 1. Sleek Aerodynamic Fuselage
  const bodyGeo = new THREE.CylinderGeometry(1.2, 1.25, 22, 32);
  bodyGeo.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, titaniumHullMat);
  body.castShadow = true;
  jetGroup.add(body);

  // Sharp Supersonic Needle Nose
  const noseGeo = new THREE.ConeGeometry(1.2, 7.5, 32);
  noseGeo.rotateX(-Math.PI / 2);
  const nose = new THREE.Mesh(noseGeo, titaniumHullMat);
  nose.position.z = 14.75;
  nose.castShadow = true;
  jetGroup.add(nose);

  // Cockpit Canopy
  const canopyGeo = new THREE.CylinderGeometry(0.85, 1.15, 4.2, 24, 1, false, Math.PI * 0.75, Math.PI * 0.5);
  canopyGeo.rotateX(Math.PI / 2);
  const canopy = new THREE.Mesh(canopyGeo, cockpitGlassMat);
  canopy.position.set(0, 0.65, 10.8);
  canopy.rotation.x = 0.24;
  jetGroup.add(canopy);

  // Tapered Tail Conical Exhaust
  const tailGeo = new THREE.ConeGeometry(1.25, 6, 32);
  tailGeo.rotateX(Math.PI / 2);
  const tail = new THREE.Mesh(tailGeo, darkTrimMat);
  tail.position.z = -14;
  jetGroup.add(tail);

  // 2. Swept Delta-Crank Wings
  const buildWing = (isRight) => {
    const sign = isRight ? 1 : -1;
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 4);
    wingShape.lineTo(13.5 * sign, -4.5);
    wingShape.lineTo(13.5 * sign, -7.5);
    wingShape.lineTo(4.5 * sign, -8.0);
    wingShape.lineTo(0, -9.0);
    wingShape.closePath();

    const extrudeSettings = { depth: 0.24, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.06, bevelThickness: 0.06 };
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
    wingGeo.rotateX(Math.PI / 2);
    const wingMesh = new THREE.Mesh(wingGeo, titaniumHullMat);
    wingMesh.castShadow = true;
    wingMesh.position.y = -0.2;

    // Winglet
    const wingletGeo = new THREE.BoxGeometry(0.12, 1.8, 1.6);
    const winglet = new THREE.Mesh(wingletGeo, cyberBlueMat);
    winglet.position.set(13.5 * sign, 0.7, -6.0);
    winglet.rotation.z = sign * 0.25;
    wingMesh.add(winglet);

    return wingMesh;
  };

  jetGroup.add(buildWing(true));
  jetGroup.add(buildWing(false));

  // 3. Vertical Stabilizer Tail Fin
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);
  finShape.lineTo(0, 5.2);
  finShape.lineTo(-2.2, 5.0);
  finShape.lineTo(-5.5, 0);
  finShape.closePath();

  const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.2, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05 });
  const finMesh = new THREE.Mesh(finGeo, cyberBlueMat);
  finMesh.position.set(-0.1, 1.0, -8.5);
  finMesh.castShadow = true;
  jetGroup.add(finMesh);

  // Twin Horizontal Tail Elevators
  const elevGeo = new THREE.BoxGeometry(7.0, 0.15, 2.2);
  const elev = new THREE.Mesh(elevGeo, titaniumHullMat);
  elev.position.set(0, 0.3, -12.5);
  jetGroup.add(elev);

  // 4. Dual High-Bypass Turbofans / Afterburner Engines
  const engineExhaustCones = [];
  const engineBlades = [];

  [-3.8, 3.8].forEach((xPos) => {
    const nacelleGeo = new THREE.CylinderGeometry(1.05, 1.15, 6.5, 32);
    nacelleGeo.rotateX(Math.PI / 2);
    const nacelle = new THREE.Mesh(nacelleGeo, titaniumHullMat);
    nacelle.position.set(xPos, -0.9, -1.5);
    nacelle.castShadow = true;

    // Intake Rim Chrome
    const rimGeo = new THREE.TorusGeometry(1.05, 0.1, 16, 32);
    const rim = new THREE.Mesh(rimGeo, darkTrimMat);
    rim.position.z = 3.25;
    nacelle.add(rim);

    // Spinning Fan Blades
    const fanGroup = new THREE.Group();
    for (let b = 0; b < 16; b++) {
      const bladeGeo = new THREE.BoxGeometry(0.12, 0.95, 0.04);
      const blade = new THREE.Mesh(bladeGeo, darkTrimMat);
      blade.rotation.z = (b / 16) * Math.PI * 2;
      blade.position.y = 0.45;
      const bladeHolder = new THREE.Group();
      bladeHolder.rotation.z = (b / 16) * Math.PI * 2;
      bladeHolder.add(blade);
      fanGroup.add(bladeHolder);
    }
    fanGroup.position.z = 2.8;
    nacelle.add(fanGroup);
    engineBlades.push(fanGroup);

    // Glowing Afterburner Plasma Cone
    const exhaustGeo = new THREE.ConeGeometry(0.85, 4.0, 24, 1, true);
    exhaustGeo.rotateX(Math.PI / 2);
    const exhaustMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.85,
    });
    const exhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
    exhaust.position.z = -5.0;
    nacelle.add(exhaust);
    engineExhaustCones.push(exhaust);

    jetGroup.add(nacelle);
  });

  // 5. Supersonic Vapor Cone / Shockwave Ring (active during high Mach)
  const vaporGeo = new THREE.TorusGeometry(3.6, 0.15, 16, 48);
  const vaporMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide
  });
  const vaporRing = new THREE.Mesh(vaporGeo, vaporMat);
  vaporRing.position.set(0, 0, 4.0);
  jetGroup.add(vaporRing);

  // Passenger Cabin Windows Glow
  const winMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
  for (let i = 0; i < 14; i++) {
    const wz = 6.5 - i * 1.1;
    const wR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.42), winMat);
    wR.position.set(1.21, 0.25, wz);
    jetGroup.add(wR);

    const wL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.42), winMat);
    wL.position.set(-1.21, 0.25, wz);
    jetGroup.add(wL);
  }

  return {
    group: jetGroup,
    engineExhaustCones,
    engineBlades,
    vaporRing,
  };
}

export default function FlightCanvas3D({ 
  mode = 'jet', // 'jet' | 'globe'
  onModeChange,
  activeCity = 'DXB',
  onSelectCity,
  onExplore,
  speedSetting = 1.0 // 1.0 (subsonic Mach 0.85) to 2.5 (hypersonic Mach 2.4)
}) {
  const containerRef = useRef(null);
  const [internalMode, setInternalMode] = useState(mode);
  const [activeSpeed, setActiveSpeed] = useState(speedSetting);
  const [cameraPreset, setCameraPreset] = useState('orbit'); // 'orbit', 'chase', 'cockpit'
  const [themeEnv, setThemeEnv] = useState('midnight'); // 'midnight', 'sunset', 'aurora'
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [telemetry, setTelemetry] = useState({
    mach: 0.85,
    altitude: 38500,
    heading: '084° ENE',
    gForce: 1.02,
    cabinPressure: '8,000 FT',
    rfidLuggageSync: 'ACTIVE (4/4 BAGS)',
    status: 'OPTIMAL HYPERCRUISE',
  });

  // Audio Context Ref for Synthesized Jet Hum
  const audioContextRef = useRef(null);
  const osc1Ref = useRef(null);
  const osc2Ref = useRef(null);
  const gainNodeRef = useRef(null);

  // Sync mode prop
  useEffect(() => {
    if (mode && mode !== internalMode) {
      setInternalMode(mode);
    }
  }, [mode]);

  const handleSwitchMode = (newMode) => {
    setInternalMode(newMode);
    if (onModeChange) onModeChange(newMode);
  };

  // Synthesized Subsonic Jet Engine Audio with Web Audio API (100% offline, zero external dependencies)
  const toggleSound = () => {
    if (!soundEnabled) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        // Subsonic Low Rumble Oscillator
        const osc1 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(48, ctx.currentTime);

        // High Altitude Turbine Whine Oscillator
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(320, ctx.currentTime);

        // Lowpass Filter for that deep airliner cabin acoustic
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.08, ctx.currentTime); // Comfortable, relaxing volume

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();

        osc1Ref.current = osc1;
        osc2Ref.current = osc2;
        gainNodeRef.current = gain;
        setSoundEnabled(true);
      } catch (e) {
        console.warn('AudioContext error:', e);
      }
    } else {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      setSoundEnabled(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Update sound pitch when speed changes
  useEffect(() => {
    if (soundEnabled && osc1Ref.current && osc2Ref.current) {
      const targetBase = 48 + (activeSpeed - 1.0) * 35;
      const targetWhine = 320 + (activeSpeed - 1.0) * 180;
      osc1Ref.current.frequency.setTargetAtTime(targetBase, audioContextRef.current.currentTime, 0.2);
      osc2Ref.current.frequency.setTargetAtTime(targetWhine, audioContextRef.current.currentTime, 0.2);
    }
  }, [activeSpeed, soundEnabled]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050b18, 0.0035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(22, 12, 34);

    // 2. High-Performance Antialiased WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. OrbitControls for interactive 360 drag, zoom, pan
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 180;
    controls.minDistance = 6;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.7;

    // 4. Dynamic Lighting System
    const ambientLight = new THREE.AmbientLight(0x0f1c3f, 1.8);
    scene.add(ambientLight);

    const keySunLight = new THREE.DirectionalLight(0xe0f2fe, 3.2);
    keySunLight.position.set(40, 60, 30);
    keySunLight.castShadow = true;
    scene.add(keySunLight);

    const rimBlueLight = new THREE.DirectionalLight(0x00f2fe, 2.5);
    rimBlueLight.position.set(-35, -20, -35);
    scene.add(rimBlueLight);

    const neonAccentLight = new THREE.PointLight(0x7928ca, 2.8, 120);
    neonAccentLight.position.set(0, -10, 15);
    scene.add(neonAccentLight);

    // 5. Starfield / Atmospheric Particle Dust Field
    const starCount = 1800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      starPos[idx] = (Math.random() - 0.5) * 600;
      starPos[idx + 1] = (Math.random() - 0.5) * 400 + 40;
      starPos[idx + 2] = (Math.random() - 0.5) * 600;

      // Tint stars (cyan, white, gold)
      const rVal = Math.random();
      if (rVal > 0.6) {
        starColors[idx] = 0.2; starColors[idx + 1] = 0.9; starColors[idx + 2] = 1.0; // Cyan
      } else if (rVal > 0.3) {
        starColors[idx] = 1.0; starColors[idx + 1] = 0.8; starColors[idx + 2] = 0.4; // Gold
      } else {
        starColors[idx] = 1.0; starColors[idx + 1] = 1.0; starColors[idx + 2] = 1.0; // White
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 1.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Volumetric Stratospheric Cloud Layer (for Jet Cruise Mode)
    const cloudsGroup = new THREE.Group();
    const cloudGeo = new THREE.DodecahedronGeometry(14, 1);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.22,
      roughness: 0.9,
    });
    for (let c = 0; c < 24; c++) {
      const cMesh = new THREE.Mesh(cloudGeo, cloudMat);
      cMesh.position.set((Math.random() - 0.5) * 350, -22 + Math.random() * 8, (Math.random() - 0.5) * 350);
      cMesh.scale.set(1.5 + Math.random() * 2, 0.4 + Math.random() * 0.4, 1.5 + Math.random() * 2);
      cloudsGroup.add(cMesh);
    }
    scene.add(cloudsGroup);

    // ── STAGE A: JET MODE OBJECTS ──────────────────────────────────────────
    const jetContainer = new THREE.Group();
    scene.add(jetContainer);

    const proceduralJet = createProceduralSupersonicJet();
    let activeJetMesh = proceduralJet.group;
    jetContainer.add(activeJetMesh);

    // Try to load /airplane.glb model if available!
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      '/airplane.glb',
      (gltf) => {
        const loadedModel = gltf.scene;
        // Compute bounding box to normalize scale
        const box = new THREE.Box3().setFromObject(loadedModel);
        const size = box.getSize(new THREE.Vector3());
        const maxAxis = Math.max(size.x, size.y, size.z);
        const targetScale = 22.0 / maxAxis;
        loadedModel.scale.set(targetScale, targetScale, targetScale);

        // Center model
        const center = box.getCenter(new THREE.Vector3());
        loadedModel.position.set(-center.x * targetScale, -center.y * targetScale, -center.z * targetScale);

        // Enhance materials
        loadedModel.traverse((child) => {
          if (child.isMesh && child.material) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material.metalness !== undefined) {
              child.material.metalness = 0.85;
              child.material.roughness = 0.2;
            }
          }
        });

        // Replace procedural body with loaded GLTF, but keep the thrusters and effects!
        jetContainer.remove(proceduralJet.group);
        const combinedGroup = new THREE.Group();
        combinedGroup.add(loadedModel);
        combinedGroup.add(proceduralJet.vaporRing);
        proceduralJet.engineExhaustCones.forEach((cone) => combinedGroup.add(cone));
        jetContainer.add(combinedGroup);
        activeJetMesh = combinedGroup;
      },
      undefined,
      (err) => {
        console.log('Using procedural supersonic jet model:', err);
      }
    );

    // ── STAGE B: HOLOGRAPHIC 3D GLOBE RADAR OBJECTS ────────────────────────
    const globeContainer = new THREE.Group();
    globeContainer.position.set(0, 0, 0);
    scene.add(globeContainer);

    const GLOBE_RADIUS = 16.0;

    // Base Earth Core Sphere
    const earthGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 48);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x051329,
      roughness: 0.65,
      metalness: 0.45,
      wireframe: false,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeContainer.add(earthMesh);

    // Atmospheric Glowing Rim Layer
    const atmosGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.045, 48, 36);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    globeContainer.add(atmosMesh);

    // Latitude & Longitude Wireframe Grid Rings
    const wireGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(GLOBE_RADIUS * 1.002, 32, 20));
    const wireMat = new THREE.LineBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.2 });
    const wireGrid = new THREE.LineSegments(wireGeo, wireMat);
    globeContainer.add(wireGrid);

    // Airport City Markers on Globe
    const cityPins = [];
    GLOBAL_HUBS.forEach((hub) => {
      const pinPos = latLonToVector3(hub.lat, hub.lon, GLOBE_RADIUS, 0.2);

      // Glowing Base Disc
      const discGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 16);
      discGeo.rotateX(Math.PI / 2);
      const discMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.copy(pinPos);
      disc.lookAt(pinPos.clone().multiplyScalar(2));
      globeContainer.add(disc);

      // Pulsing Radar Ring
      const ringGeo = new THREE.RingGeometry(0.4, 0.75, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pinPos);
      ring.lookAt(pinPos.clone().multiplyScalar(2));
      globeContainer.add(ring);

      cityPins.push({ hub, pinPos, ring, disc });
    });

    // 3D Bezier Great Circle Flight Arcs
    const flightArcMeshes = [];
    const flightBlips = [];

    FLIGHT_CONNECTIONS.forEach((route) => {
      const fromHub = GLOBAL_HUBS.find((h) => h.code === route.from);
      const toHub = GLOBAL_HUBS.find((h) => h.code === route.to);
      if (!fromHub || !toHub) return;

      const p1 = latLonToVector3(fromHub.lat, fromHub.lon, GLOBE_RADIUS, 0.2);
      const p2 = latLonToVector3(toHub.lat, toHub.lon, GLOBE_RADIUS, 0.2);

      // Midpoint pulled outward to form a majestic great-circle arch
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const distance = p1.distanceTo(p2);
      const arcAltitude = Math.min(distance * 0.32, 6.5);
      mid.normalize().multiplyScalar(GLOBE_RADIUS + arcAltitude);

      // Quadratic Bezier Curve
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(50);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);

      const curveMat = new THREE.LineBasicMaterial({
        color: route.color || 0x00f2fe,
        transparent: true,
        opacity: 0.65,
        linewidth: 2,
      });
      const arcLine = new THREE.Line(curveGeo, curveMat);
      globeContainer.add(arcLine);
      flightArcMeshes.push(arcLine);

      // Animated Photon Blip along route
      const blipGeo = new THREE.SphereGeometry(0.24, 12, 12);
      const blipMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const blip = new THREE.Mesh(blipGeo, blipMat);
      globeContainer.add(blip);

      flightBlips.push({ blip, curve, progress: Math.random(), speed: 0.003 + Math.random() * 0.002 });
    });

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // ── MAIN ANIMATION LOOP ───────────────────────────────────────────────
    let animId;
    const clock = new THREE.Clock();

    const render = () => {
      animId = requestAnimationFrame(render);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Controls update
      controls.update();

      // Environment Light Colors based on theme
      if (themeEnv === 'sunset') {
        keySunLight.color.setHex(0xfb923c);
        scene.fog.color.setHex(0x180d24);
      } else if (themeEnv === 'aurora') {
        keySunLight.color.setHex(0x10b981);
        scene.fog.color.setHex(0x04181c);
      } else {
        keySunLight.color.setHex(0xe0f2fe);
        scene.fog.color.setHex(0x050b18);
      }

      // Visibility toggle between Modes
      const isJetMode = internalMode === 'jet';
      jetContainer.visible = isJetMode;
      cloudsGroup.visible = isJetMode;
      globeContainer.visible = !isJetMode;

      if (isJetMode) {
        // --- 1. JET FLIGHT DYNAMICS ---
        const effectiveSpeed = activeSpeed;
        const pitchWave = Math.sin(elapsed * 1.4) * 0.04;
        const bankWave = Math.cos(elapsed * 0.9) * 0.06;
        const altitudeHover = Math.sin(elapsed * 1.8) * 0.45;

        activeJetMesh.position.y = altitudeHover;
        activeJetMesh.rotation.x = pitchWave;
        activeJetMesh.rotation.z = bankWave;

        // Spin turbofan blades
        proceduralJet.engineBlades.forEach((fan) => {
          fan.rotation.z += 0.45 * effectiveSpeed;
        });

        // Exhaust flame pulsation & scale with throttle
        proceduralJet.engineExhaustCones.forEach((exhaust) => {
          const flamePulse = 1.0 + Math.sin(elapsed * 32) * 0.18;
          exhaust.scale.set(flamePulse, flamePulse, 1.0 + (effectiveSpeed - 1.0) * 1.6);
          // Color shift to plasma violet/white when hypersonic
          if (effectiveSpeed > 1.8) {
            exhaust.material.color.setHex(0x9333ea);
          } else {
            exhaust.material.color.setHex(0x00f2fe);
          }
        });

        // Supersonic vapor cone activation
        if (effectiveSpeed >= 1.4) {
          const vaporPulse = Math.sin(elapsed * 12) * 0.15;
          proceduralJet.vaporRing.scale.set(1.0 + vaporPulse, 1.0 + vaporPulse, 1.0);
          proceduralJet.vaporRing.material.opacity = THREE.MathUtils.lerp(
            proceduralJet.vaporRing.material.opacity,
            Math.min(0.65, (effectiveSpeed - 1.4) * 0.8),
            0.1
          );
        } else {
          proceduralJet.vaporRing.material.opacity = THREE.MathUtils.lerp(
            proceduralJet.vaporRing.material.opacity,
            0.0,
            0.15
          );
        }

        // Drifting clouds backward to give sensation of massive forward velocity
        cloudsGroup.children.forEach((c) => {
          c.position.z += 0.8 * effectiveSpeed;
          if (c.position.z > 180) c.position.z = -180;
        });

        // Starfield subtle backward drift
        starField.rotation.y = elapsed * 0.015;

        // Dynamic Camera presets for Jet
        if (cameraPreset === 'chase') {
          camera.position.lerp(new THREE.Vector3(0, 5, 28), 0.05);
          controls.target.lerp(new THREE.Vector3(0, 0, -8), 0.05);
        } else if (cameraPreset === 'cockpit') {
          camera.position.lerp(new THREE.Vector3(0, 1.2, 10), 0.05);
          controls.target.lerp(new THREE.Vector3(0, 1.2, 35), 0.05);
        }

        // Real-time Telemetry Updates
        const currentMach = Number((0.85 + (effectiveSpeed - 1.0) * 1.15).toFixed(2));
        const currentAlt = Math.round(38500 + (effectiveSpeed - 1.0) * 8500 + altitudeHover * 200);
        setTelemetry((prev) => ({
          ...prev,
          mach: currentMach,
          altitude: currentAlt,
          gForce: Number((1.0 + (effectiveSpeed - 1.0) * 0.35 + Math.abs(bankWave)).toFixed(2)),
          status: currentMach >= 1.0 ? '⚡ SUPERSONIC CRUISE' : '✈️ HIGH-ALTITUDE CRUISE',
        }));

      } else {
        // --- 2. 3D GLOBE FLIGHT RADAR DYNAMICS ---
        // Slowly rotate Earth
        globeContainer.rotation.y += 0.002;

        // Pulsing airport radar rings
        cityPins.forEach(({ ring, hub }) => {
          const isSelected = hub.code === activeCity;
          const scale = isSelected ? 1.0 + Math.sin(elapsed * 5) * 0.4 : 1.0 + Math.sin(elapsed * 2.5) * 0.2;
          ring.scale.set(scale, scale, 1);
          ring.material.opacity = isSelected ? 0.95 : 0.6;
        });

        // Animate flight blips along their bezier flight paths
        flightBlips.forEach((item) => {
          item.progress = (item.progress + item.speed) % 1.0;
          const pos = item.curve.getPointAt(item.progress);
          item.blip.position.copy(pos);
        });

        // Focus camera on selected city if activeCity changes
        const selectedHub = GLOBAL_HUBS.find((h) => h.code === activeCity);
        if (selectedHub && cameraPreset === 'orbit') {
          const targetPos = latLonToVector3(selectedHub.lat, selectedHub.lon, GLOBE_RADIUS, 28);
          camera.position.lerp(targetPos, 0.03);
          controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
        }

        setTelemetry((prev) => ({
          ...prev,
          mach: 0.85,
          altitude: 41000,
          status: `RADAR ACTIVE • ${GLOBAL_HUBS.length} GLOBAL HUBS`,
        }));
      }

      renderer.render(scene, camera);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [internalMode, activeSpeed, cameraPreset, themeEnv, activeCity]);

  return (
    <div className="flight-3d-stage-wrapper">
      {/* Three.js WebGL Canvas Mount */}
      <div ref={containerRef} className="flight-3d-canvas-mount" />

      {/* Atmospheric Vignette & Depth Mask */}
      <div className="flight-3d-vignette" />

      {/* ── TOP HUD CONTROLS BAR ── */}
      <div className="stage-controls-overlay">
        {/* Mode Switcher Pill */}
        <div className="stage-mode-pill">
          <button 
            type="button"
            className={`mode-btn ${internalMode === 'jet' ? 'active' : ''}`}
            onClick={() => handleSwitchMode('jet')}
          >
            <Plane size={15} />
            <span className="mode-btn-full">3D Jet Simulation</span>
            <span className="mode-btn-short">3D Jet</span>
          </button>
          <button 
            type="button"
            className={`mode-btn ${internalMode === 'globe' ? 'active' : ''}`}
            onClick={() => handleSwitchMode('globe')}
          >
            <GlobeIcon size={15} />
            <span className="mode-btn-full">3D Global Radar</span>
            <span className="mode-btn-short">3D Globe</span>
          </button>
        </div>

        {/* Camera Angles (For Jet) / Atmosphere Selector */}
        <div className="stage-settings-group">
          {internalMode === 'jet' && (
            <div className="camera-presets-pill">
              <button 
                type="button"
                className={`preset-btn ${cameraPreset === 'orbit' ? 'active' : ''}`} 
                onClick={() => setCameraPreset('orbit')}
                title="Free 360 Orbit"
              >
                <Maximize2 size={13} />
                <span className="preset-text">Orbit</span>
              </button>
              <button 
                type="button"
                className={`preset-btn ${cameraPreset === 'chase' ? 'active' : ''}`} 
                onClick={() => setCameraPreset('chase')}
                title="Chase Camera"
              >
                <Navigation size={13} />
                <span className="preset-text">Chase</span>
              </button>
              <button 
                type="button"
                className={`preset-btn ${cameraPreset === 'cockpit' ? 'active' : ''}`} 
                onClick={() => setCameraPreset('cockpit')}
                title="Pilot Cockpit View"
              >
                <Eye size={13} />
                <span className="preset-text">Cockpit</span>
              </button>
            </div>
          )}

          {/* Time of Day Atmosphere */}
          <div className="theme-env-pill">
            <button 
              type="button"
              className={`env-btn ${themeEnv === 'midnight' ? 'active' : ''}`} 
              onClick={() => setThemeEnv('midnight')}
              title="Midnight Cyber"
            >
              <Moon size={14} />
            </button>
            <button 
              type="button"
              className={`env-btn ${themeEnv === 'sunset' ? 'active' : ''}`} 
              onClick={() => setThemeEnv('sunset')}
              title="Sunset Golden Hour"
            >
              <Sun size={14} />
            </button>
            <button 
              type="button"
              className={`env-btn ${themeEnv === 'aurora' ? 'active' : ''}`} 
              onClick={() => setThemeEnv('aurora')}
              title="Aurora Borealis"
            >
              <Zap size={14} />
            </button>
          </div>

          {/* Ambient Subsonic Jet Engine Audio Toggle */}
          <button 
            type="button"
            className={`audio-toggle-btn ${soundEnabled ? 'active' : ''}`} 
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Cabin Engine Sound' : 'Enable Subsonic Jet Sound'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span className="audio-btn-text">{soundEnabled ? 'ON' : 'Audio'}</span>
          </button>
        </div>
      </div>

      {/* ── TOP-RIGHT AVIONICS TELEMETRY HUD ── */}
      <div className="avionics-telemetry-hud">
        <div className="telemetry-header">
          <span className="telemetry-radar-dot" />
          <span className="telemetry-title">AVIONICS TELEMETRY • LIVE</span>
        </div>
        <div className="telemetry-grid">
          <div className="telemetry-cell">
            <span className="cell-label">MACH SPEED</span>
            <span className="cell-val mach-val">Mach {telemetry.mach}</span>
          </div>
          <div className="telemetry-cell">
            <span className="cell-label">ALTITUDE</span>
            <span className="cell-val">{telemetry.altitude.toLocaleString()} FT</span>
          </div>
          <div className="telemetry-cell">
            <span className="cell-label">SMART LUGGAGE</span>
            <span className="cell-val luggage-val">
              <Luggage size={12} className="cell-icon" />
              <span>RFID SYNCED</span>
            </span>
          </div>
          <div className="telemetry-cell">
            <span className="cell-label">G-FORCE / STAT</span>
            <span className="cell-val">{telemetry.gForce}G • STABLE</span>
          </div>
        </div>
        <div className="telemetry-footer">
          <span className="telemetry-status-tag">{telemetry.status}</span>
          <span className="telemetry-link-tag">
            <Wifi size={11} />
            <span>SAT-LINK 99.98%</span>
          </span>
        </div>
      </div>

      {/* ── BOTTOM-LEFT THROTTLE & SPEED CONTROLLER ── */}
      {internalMode === 'jet' && (
        <div className="stage-throttle-card">
          <div className="throttle-label-row">
            <span className="throttle-label">
              <Wind size={13} />
              <span>THROTTLE / MACH CONTROL</span>
            </span>
            <span className="throttle-val">
              {activeSpeed < 1.3 ? 'CRUISE 0.85M' : activeSpeed < 2.0 ? 'SUPERSONIC 1.6M' : 'HYPERSONIC 2.4M ⚡'}
            </span>
          </div>
          <div className="throttle-slider-row">
            <span className="speed-step-tag">0.85M</span>
            <input 
              type="range" 
              min="1.0" 
              max="2.5" 
              step="0.05"
              value={activeSpeed}
              onChange={(e) => setActiveSpeed(parseFloat(e.target.value))}
              className="throttle-range-slider"
            />
            <span className="speed-step-tag hyper">2.4M ⚡</span>
          </div>
        </div>
      )}

      {/* ── 3D INTERACTIVE DRAG HINT ── */}
      <div className="stage-interactive-hint">
        <Compass size={14} className="compass-icon spin" />
        <span>Click & drag to rotate 3D view • Scroll to zoom</span>
      </div>
    </div>
  );
}
