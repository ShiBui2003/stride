'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// --- Types ---
interface HexCell {
  q: number;
  r: number;
  s: number;
  x: number;
  z: number;
  type: 'building' | 'park' | 'water' | 'road';
  noiseValue: number;
  height: number;
  teamId: number;
  captured: boolean;
  buildingIndex?: number;
}

interface Team {
  id: number;
  name: string;
  color: string;
}

interface CaptureEvent {
  group: THREE.Group;
  ring: THREE.Mesh;
  particles: THREE.Points;
  particlePositions: Float32Array;
  startTime: number;
  duration: number;
  nearbyCells: HexCell[];
  currentCellIndex: number;
  teamId: number;
  centerCell: HexCell;
  id: number;
  polygon?: THREE.Group;
}

interface RunnerPath {
  curve: THREE.CatmullRomCurve3;
  progress: number;
  teamId: number;
  dot: THREE.Mesh;
  line: THREE.Line;
  trailParticles: THREE.Mesh[];
}

// --- Constants ---
const TEAMS: Team[] = [
  { id: 0, name: 'Red', color: '#FF4D4D' },
  { id: 1, name: 'Cyan', color: '#00E5FF' },
  { id: 2, name: 'Lime', color: '#C7FF3D' },
  { id: 3, name: 'Purple', color: '#8B5CF6' },
  { id: 4, name: 'Orange', color: '#FFAA00' },
];

const TERRITORY_FILL_OPACITY = 0.35;
const TERRITORY_BORDER_OPACITY = 0.8;
const HEX_SIZE = 3;
const GRID_RADIUS = 10;

// --- Simple seeded noise ---
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function createNoise(seed: number) {
  const rand = seededRandom(seed);
  const perm: number[] = [];
  for (let i = 0; i < 256; i++) perm[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const p = [...perm, ...perm];
  function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(a: number, b: number, t: number) { return a + t * (b - a); }
  function grad(hash: number, x: number, y: number) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
  return (x: number, y: number) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);
    const aa = p[p[X] + Y];
    const ab = p[p[X] + Y + 1];
    const ba = p[p[X + 1] + Y];
    const bb = p[p[X + 1] + Y + 1];
    return lerp(
      lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
      lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
      v
    );
  };
}

// --- Hex math ---
function hexToWorld(q: number, r: number): [number, number] {
  const x = q * (HEX_SIZE * 1.5);
  const z = q * (HEX_SIZE * Math.sqrt(3) / 2) + r * (HEX_SIZE * Math.sqrt(3));
  return [x, z];
}

export default function CityMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    cleanup: () => void;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current || sceneRef.current) return;

    const container = containerRef.current;
    const noise = createNoise(42);

    // --- Scene setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.Fog(0x050505, 10, 120);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.set(30, 60, 40);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x050505);
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0x8899ff, 0.4);
    sunLight.position.set(50, 80, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0x88aadd, 0x443322, 0.3);
    scene.add(hemiLight);

    // --- Grid generation ---
    const grid: HexCell[] = [];
    for (let q = -GRID_RADIUS; q <= GRID_RADIUS; q++) {
      for (let r = -GRID_RADIUS; r <= GRID_RADIUS; r++) {
        if (Math.abs(q + r) > GRID_RADIUS) continue;
        const s = -q - r;
        const [x, z] = hexToWorld(q, r);
        const noiseVal = noise(x * 0.03, z * 0.03) + noise(x * 0.08, z * 0.08) * 0.3;
        let type: HexCell['type'];
        if (noiseVal < -0.1) type = 'water';
        else if (noiseVal < 0.05) type = 'park';
        else if (noiseVal < 0.3) type = 'road';
        else type = 'building';
        const height = Math.max(2, Math.min(15, (noiseVal * 20) + 2));
        grid.push({
          q, r, s, x, z, type, noiseValue: noiseVal,
          height: type === 'building' ? height : 0,
          teamId: -1, captured: false,
        });
      }
    }

    // --- City rendering ---
    const buildingsGroup = new THREE.Group();
    scene.add(buildingsGroup);

    const buildingCount = grid.filter(c => c.type === 'building').length;
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x13151a,
      roughness: 0.8,
    });
    const buildingMesh = new THREE.InstancedMesh(boxGeo, buildingMat, buildingCount);
    buildingsGroup.add(buildingMesh);

    const roadsGroup = new THREE.Group();
    scene.add(roadsGroup);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0c });

    const decorationsGroup = new THREE.Group();
    scene.add(decorationsGroup);

    const parkMat = new THREE.MeshStandardMaterial({ color: 0x1a2e1a });
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x112244, transparent: true, opacity: 0.8,
    });

    let bIdx = 0;
    for (const cell of grid) {
      if (cell.type === 'building') {
        const matrix = new THREE.Matrix4();
        matrix.makeScale(HEX_SIZE * 0.9, cell.height, HEX_SIZE * 0.9);
        matrix.setPosition(cell.x, cell.height / 2, cell.z);
        buildingMesh.setMatrixAt(bIdx, matrix);
        buildingMesh.setColorAt(bIdx, new THREE.Color(0x1e2028));
        cell.buildingIndex = bIdx;
        bIdx++;
      } else if (cell.type === 'road') {
        const road = new THREE.Mesh(
          new THREE.CylinderGeometry(HEX_SIZE * 0.9, HEX_SIZE * 0.9, 0.1, 6),
          roadMat
        );
        road.position.set(cell.x, 0.05, cell.z);
        roadsGroup.add(road);
      } else if (cell.type === 'park') {
        const park = new THREE.Mesh(
          new THREE.CylinderGeometry(HEX_SIZE * 0.8, HEX_SIZE * 0.8, 0.2, 6),
          parkMat
        );
        park.position.set(cell.x, 0.1, cell.z);
        decorationsGroup.add(park);
      } else if (cell.type === 'water') {
        const water = new THREE.Mesh(
          new THREE.CylinderGeometry(HEX_SIZE, HEX_SIZE, 0.5, 6),
          waterMat
        );
        water.position.set(cell.x, -0.2, cell.z);
        decorationsGroup.add(water);
      }
    }
    buildingMesh.instanceMatrix.needsUpdate = true;
    if (buildingMesh.instanceColor) buildingMesh.instanceColor.needsUpdate = true;

    // --- Territory system ---
    const activeCaptures: CaptureEvent[] = [];
    const territoryPolygons: THREE.Group[] = [];
    const runnerPaths: RunnerPath[] = [];

    function createTerritoryPolygon(cells: HexCell[], teamId: number): THREE.Group {
      const team = TEAMS[teamId];
      const group = new THREE.Group();
      const avgX = cells.reduce((s, c) => s + c.x, 0) / cells.length;
      const avgZ = cells.reduce((s, c) => s + c.z, 0) / cells.length;
      const avgY = 0.1;

      const shapePoints = cells.map(c => new THREE.Vector2(c.x - avgX, c.z - avgZ));
      const shape = new THREE.Shape(shapePoints);
      const shapeGeom = new THREE.ShapeGeometry(shape);
      const shapeMesh = new THREE.Mesh(
        shapeGeom,
        new THREE.MeshBasicMaterial({
          color: team.color, transparent: true, opacity: TERRITORY_FILL_OPACITY,
          side: THREE.DoubleSide, depthWrite: false,
        })
      );
      shapeMesh.position.set(avgX, avgY, avgZ);
      shapeMesh.rotation.x = -Math.PI / 2;
      group.add(shapeMesh);

      const edgesGeom = new THREE.EdgesGeometry(shapeGeom);
      const edgesLine = new THREE.LineSegments(
        edgesGeom,
        new THREE.LineBasicMaterial({
          color: team.color, transparent: true, opacity: TERRITORY_BORDER_OPACITY,
        })
      );
      edgesLine.position.set(avgX, avgY, avgZ);
      edgesLine.rotation.x = -Math.PI / 2;
      group.add(edgesLine);

      const beacon = new THREE.Mesh(
        new THREE.ConeGeometry(0.8, 3, 4),
        new THREE.MeshBasicMaterial({ color: team.color, transparent: true, opacity: 0.9 })
      );
      beacon.position.set(avgX, 4, avgZ);
      group.add(beacon);

      return group;
    }

    function triggerCaptureEvent(centerCell: HexCell) {
      const teamId = Math.floor(Math.random() * TEAMS.length);
      const team = TEAMS[teamId];
      const eventGroup = new THREE.Group();
      eventGroup.position.set(centerCell.x, 0, centerCell.z);

      const ringGeom = new THREE.RingGeometry(0.1, 0.5, 32);
      const ringMesh = new THREE.Mesh(
        ringGeom,
        new THREE.MeshBasicMaterial({
          color: team.color, transparent: true, opacity: 0.8, side: THREE.DoubleSide,
        })
      );
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.2;
      eventGroup.add(ringMesh);

      const particleCount = 50;
      const particlePositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * 8;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i * 3 + 1] = radius * Math.cos(phi) + 3;
        particlePositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      }
      const particleGeom = new THREE.BufferGeometry();
      particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const particleSystem = new THREE.Points(
        particleGeom,
        new THREE.PointsMaterial({ color: team.color, size: 0.4, transparent: true, opacity: 1 })
      );
      eventGroup.add(particleSystem);

      const nearbyCells = grid.filter(c => {
        const dx = c.x - centerCell.x;
        const dz = c.z - centerCell.z;
        return Math.sqrt(dx * dx + dz * dz) < 12 && c.type !== 'water';
      });

      activeCaptures.push({
        group: eventGroup,
        ring: ringMesh,
        particles: particleSystem,
        particlePositions: particlePositions,
        startTime: performance.now(),
        duration: 3000,
        nearbyCells,
        currentCellIndex: 0,
        teamId,
        centerCell,
        id: Math.random(),
      });

      scene.add(eventGroup);
    }

    function updateCapture(capture: CaptureEvent): boolean {
      const now = performance.now();
      const elapsed = now - capture.startTime;
      const progress = Math.min(elapsed / capture.duration, 1);

      // Ring expansion
      const scale = 1 + progress * 15;
      capture.ring.scale.set(scale, scale, 1);
      (capture.ring.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - progress);

      // Particle explosion
      const positions = capture.particles.geometry.attributes.position.array as Float32Array;
      const expansion = 1 + progress * 3;
      for (let i = 0; i < 50; i++) {
        const idx = i * 3;
        positions[idx] *= expansion;
        positions[idx + 1] *= expansion;
        positions[idx + 2] *= expansion;
      }
      (capture.particles.material as THREE.PointsMaterial).opacity = 1 - progress;
      capture.particles.geometry.attributes.position.needsUpdate = true;

      // Territory spread
      const cellsToFill = Math.floor(progress * capture.nearbyCells.length);
      const team = TEAMS[capture.teamId];
      while (capture.currentCellIndex < cellsToFill) {
        const cell = capture.nearbyCells[capture.currentCellIndex];
        if (cell.type !== 'water') {
          if (!capture.polygon && capture.currentCellIndex > 0) {
            const filledCells = capture.nearbyCells.slice(0, cellsToFill);
            capture.polygon = createTerritoryPolygon(filledCells, capture.teamId);
            capture.polygon.position.y = 0.2;
            scene.add(capture.polygon);
            territoryPolygons.push(capture.polygon);
          }
          cell.teamId = capture.teamId;
          cell.captured = true;
          if (cell.type === 'building' && cell.buildingIndex !== undefined && buildingMesh) {
            buildingMesh.setColorAt(cell.buildingIndex, new THREE.Color(team.color));
          }
        }
        capture.currentCellIndex++;
      }
      if (buildingMesh.instanceColor) buildingMesh.instanceColor.needsUpdate = true;

      if (capture.polygon && capture.polygon.children[0]) {
        (capture.polygon.children[0] as THREE.Mesh).material = new THREE.MeshBasicMaterial({
          color: team.color, transparent: true,
          opacity: TERRITORY_FILL_OPACITY * (0.5 + 0.5 * Math.sin(progress * Math.PI)),
          side: THREE.DoubleSide, depthWrite: false,
        });
      }

      // Cleanup
      if (progress >= 1) {
        scene.remove(capture.group);
        if (capture.polygon && capture.polygon.children[0]) {
          (capture.polygon.children[0] as THREE.Mesh).material = new THREE.MeshBasicMaterial({
            color: team.color, transparent: true, opacity: TERRITORY_FILL_OPACITY,
            side: THREE.DoubleSide, depthWrite: false,
          });
        }
        return false;
      }
      return true;
    }

    // --- Runner paths ---
    function createRunnerPath() {
      if (runnerPaths.length >= 3) {
        const old = runnerPaths.shift();
        if (old) {
          scene.remove(old.dot);
          scene.remove(old.line);
          old.trailParticles.forEach(t => scene.remove(t));
        }
      }
      const startCell = grid[Math.floor(Math.random() * grid.length)];
      const waypointCount = 5 + Math.floor(Math.random() * 6);
      const waypoints: THREE.Vector3[] = [];
      let current = startCell;
      for (let i = 0; i < waypointCount; i++) {
        waypoints.push(new THREE.Vector3(
          current.x + (Math.random() - 0.5) * 3,
          1.5,
          current.z + (Math.random() - 0.5) * 3
        ));
        const neighbors = grid.filter(c => {
          const dx = c.x - current.x;
          const dz = c.z - current.z;
          return Math.sqrt(dx * dx + dz * dz) < HEX_SIZE * 3 && c.type !== 'water';
        });
        current = neighbors.length > 0
          ? neighbors[Math.floor(Math.random() * neighbors.length)]
          : grid[Math.floor(Math.random() * grid.length)];
      }

      const curve = new THREE.CatmullRomCurve3(waypoints);
      const teamId = Math.floor(Math.random() * TEAMS.length);
      const team = TEAMS[teamId];

      const points = curve.getPoints(100);
      const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(
        lineGeom,
        new THREE.LineBasicMaterial({ color: team.color, transparent: true, opacity: 0.6 })
      );
      scene.add(line);

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 8, 8),
        new THREE.MeshBasicMaterial({ color: team.color })
      );
      scene.add(dot);

      runnerPaths.push({
        curve, progress: 0, teamId, dot, line, trailParticles: [],
      });
    }

    // --- Camera controls ---
    let cameraAngle = Math.atan2(30, 40);
    let cameraVelocity = 0;
    let zoom = 60;
    let zoomTarget = 60;
    let isDragging = false;
    let lastMouseX = 0;

    function onMouseDown(e: MouseEvent) {
      isDragging = true;
      lastMouseX = e.clientX;
      container.style.cursor = 'grabbing';
    }
    function onMouseMove(e: MouseEvent) {
      if (!isDragging) return;
      const deltaX = e.clientX - lastMouseX;
      cameraVelocity += deltaX * 0.005;
      lastMouseX = e.clientX;
    }
    function onMouseUp() {
      isDragging = false;
      container.style.cursor = 'grab';
    }
    function onWheel(e: WheelEvent) {
      zoomTarget += e.deltaY * 0.05;
      zoomTarget = Math.max(15, Math.min(100, zoomTarget));
    }

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: true });
    container.style.cursor = 'grab';

    // --- Spawning ---
    const captureInterval = setInterval(() => {
      const eligible = grid.filter(c => c.type !== 'water');
      triggerCaptureEvent(eligible[Math.floor(Math.random() * eligible.length)]);
    }, 4000);

    const runnerInterval = setInterval(() => {
      createRunnerPath();
    }, 5000);

    // Initial captures
    for (let i = 0; i < 3; i++) {
      const eligible = grid.filter(c => c.type !== 'water');
      setTimeout(() => {
        triggerCaptureEvent(eligible[Math.floor(Math.random() * eligible.length)]);
      }, i * 1500);
    }

    // --- Animation loop ---
    let rafId: number;
    function animate() {
      rafId = requestAnimationFrame(animate);
      const time = performance.now() * 0.001;

      // Rotate beacons
      territoryPolygons.forEach(group => {
        if (group.children[2]) {
          group.children[2].rotation.y = time * 2;
        }
      });

      // Animate runner paths
      for (const path of runnerPaths) {
        path.progress += 0.001;
        if (path.progress > 1) path.progress = 0;
        const pos = path.curve.getPointAt(path.progress);
        path.dot.position.copy(pos);

        // Trail
        if (Math.random() > 0.7) {
          const trail = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 6, 6),
            new THREE.MeshBasicMaterial({
              color: TEAMS[path.teamId].color, transparent: true, opacity: 0.5,
            })
          );
          trail.position.copy(pos);
          trail.scale.setScalar(1);
          scene.add(trail);
          path.trailParticles.push(trail);
        }
        // Fade trail
        for (let i = path.trailParticles.length - 1; i >= 0; i--) {
          const t = path.trailParticles[i];
          t.scale.multiplyScalar(0.97);
          (t.material as THREE.MeshBasicMaterial).opacity *= 0.97;
          if (t.scale.x < 0.05) {
            scene.remove(t);
            path.trailParticles.splice(i, 1);
          }
        }
      }

      // Update captures
      for (let i = activeCaptures.length - 1; i >= 0; i--) {
        if (!updateCapture(activeCaptures[i])) {
          activeCaptures.splice(i, 1);
        }
      }

      // Auto-rotation
      if (!isDragging) {
        cameraAngle += 0.0005;
      }

      // Camera damping
      cameraAngle += cameraVelocity;
      cameraVelocity *= 0.92;
      zoom += (zoomTarget - zoom) * 0.1;

      camera.position.y = zoom;
      camera.position.x = Math.sin(cameraAngle) * zoom * 0.7;
      camera.position.z = Math.cos(cameraAngle) * zoom * 0.7;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }
    animate();

    // --- Resize ---
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onResize);

    // Store ref
    sceneRef.current = { renderer, scene, camera, cleanup: () => {} };

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(captureInterval);
      clearInterval(runnerInterval);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sceneRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}