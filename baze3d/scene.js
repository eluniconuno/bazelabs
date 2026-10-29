import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.min.js";

let scene, camera, renderer;
let points;
let mouseX = 0;
let mouseY = 0;

// Variáveis para o Morphing (transição de formas)
let geometries = [];
let currentShapeIndex = 0;
let nextShapeIndex = 1;
let morphProgress = 0;
const morphSpeed = 0.003; // Velocidade da transição (menor = mais lento)
const holdTime = 1.0; // Tempo que fica parado na forma completa
let maxPointCount = 0;

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 6;

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.body.appendChild(renderer.domElement);

  // === DEFINIÇÃO DAS FORMAS (Conceito: Minimalismo Tecnológico) ===
  
  // 1. Icosaedro: Aumentei o detalhe para 6 (bastante pontos) para ficar denso e visivel
  const network = new THREE.IcosahedronGeometry(1.7, 6);
  
  // 2. Cubo: Aumentei os segmentos para 20 (mais pontos nas faces)
  const structure = new THREE.BoxGeometry(2.2, 2.2, 2.2, 20, 20, 20);
  
  // 3. Cone: Mais segmentos radiais e de altura
  const growth = new THREE.CylinderGeometry(0, 1.8, 2.5, 80, 50);
  
  // 4. Torus: Mais denso para acompanhar as outras formas
  const flow = new THREE.TorusGeometry(1.4, 0.4, 60, 100);

  // Lista de geometrias para alternar
  const rawGeometries = [network, structure, growth, flow];

  // 1. Descobrir qual geometria tem mais pontos para alocar o buffer máximo
  maxPointCount = 0;
  rawGeometries.forEach(geo => {
      const count = geo.attributes.position.count;
      if (count > maxPointCount) maxPointCount = count;
  });

  // 2. Normalizar todas as geometrias para terem o mesmo número de pontos
  // (Repetindo pontos nas geometrias menores)
  geometries = rawGeometries.map(geo => {
      const originalPos = geo.attributes.position.array;
      const originalCount = geo.attributes.position.count;
      const newPos = new Float32Array(maxPointCount * 3);

      for (let i = 0; i < maxPointCount; i++) {
          const index = i % originalCount; // Loop se acabar os pontos
          newPos[i * 3] = originalPos[index * 3];
          newPos[i * 3 + 1] = originalPos[index * 3 + 1];
          newPos[i * 3 + 2] = originalPos[index * 3 + 2];
      }
      return newPos;
  });

  // === CRIAÇÃO DO SISTEMA DE PARTÍCULAS ===
  const pointsGeometry = new THREE.BufferGeometry();
  
  // Inicia com a posição da primeira forma
  const currentPos = new Float32Array(geometries[0]);
  pointsGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(currentPos, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.015,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });

  points = new THREE.Points(pointsGeometry, material);
  scene.add(points);

  // === INTERAÇÃO ===
  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 0.5;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5;
  });

  window.addEventListener("resize", onResize);
}

function animate() {
  requestAnimationFrame(animate);

  // Rotação base
  points.rotation.y += 0.0015;
  points.rotation.x += 0.0008;

  // Parallax suave com mouse
  points.rotation.y += mouseX * 0.01;
  points.rotation.x += mouseY * 0.01;

  // === LÓGICA DE MORPHING (TRANSFORMAÇÃO) ===
  morphProgress += morphSpeed;

  // Ciclo: 0 -> 1 (transformando), 1 -> 1 + holdTime (esperando)
  let t = 0;
  
  if (morphProgress < 1) {
      // Durante a transição, usa uma curva suave (ease-in-out)
      t = morphProgress * morphProgress * (3 - 2 * morphProgress);
  } else if (morphProgress < 1 + holdTime) {
      // Durante a espera, mantém a forma completa (t = 1)
      t = 1;
  } else {
      // Fim do ciclo, prepara para a próxima forma
      morphProgress = 0;
      currentShapeIndex = nextShapeIndex;
      nextShapeIndex = (nextShapeIndex + 1) % geometries.length;
      t = 0;
  }

  // Interpolação dos pontos
  if (morphProgress < 1) {
      const positions = points.geometry.attributes.position.array;
      const startShape = geometries[currentShapeIndex];
      const endShape = geometries[nextShapeIndex];

      for (let i = 0; i < maxPointCount; i++) {
          const i3 = i * 3;
          // Lerp (Linear Interpolation) entre a posição atual e a próxima
          positions[i3]     = startShape[i3]     + (endShape[i3]     - startShape[i3])     * t;
          positions[i3 + 1] = startShape[i3 + 1] + (endShape[i3 + 1] - startShape[i3 + 1]) * t;
          positions[i3 + 2] = startShape[i3 + 2] + (endShape[i3 + 2] - startShape[i3 + 2]) * t;
      }
      
      // Avisa o Three.js que as posições mudaram
      points.geometry.attributes.position.needsUpdate = true;
  }

  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
