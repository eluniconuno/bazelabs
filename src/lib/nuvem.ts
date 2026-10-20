/*
 * Nuvem de pontos da home.
 * Baseada na cena da pasta baze3d: pontos que se transformam entre quatro formas.
 * Só é carregada na home, depois que a página já apareceu.
 */
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  IcosahedronGeometry,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  TorusGeometry,
  WebGLRenderer,
  type BufferGeometry as Geo,
} from 'three';

export const FORMAS = ['Rede', 'Estrutura', 'Crescimento', 'Fluxo'] as const;

interface Opcoes {
  container: HTMLElement;
  /** Sem animação: desenha um quadro parado. */
  estatico: boolean;
  /** Chamado quando a forma de destino muda. */
  aoMudarForma?: (indice: number) => void;
}

// Velocidades por segundo, equivalentes às da cena original a 60 quadros por segundo.
const VEL_MORPH = 0.18;
const ESPERA = 1.0;
const ROT_Y = 0.09;
const ROT_X = 0.048;
const PARALLAX = 0.6;

export function iniciarNuvem({ container, estatico, aoMudarForma }: Opcoes) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 6;

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);

  // === Formas ===
  const brutas: Geo[] = [
    new IcosahedronGeometry(1.7, 6),
    new BoxGeometry(2.2, 2.2, 2.2, 20, 20, 20),
    new CylinderGeometry(0, 1.8, 2.5, 80, 50),
    new TorusGeometry(1.4, 0.4, 60, 100),
  ];

  // Todas as formas passam a ter o mesmo número de pontos, repetindo os das menores.
  const total = Math.max(...brutas.map((g) => g.attributes.position.count));
  const formas = brutas.map((g) => {
    const orig = g.attributes.position.array as Float32Array;
    const n = g.attributes.position.count;
    const pos = new Float32Array(total * 3);
    for (let i = 0; i < total; i++) {
      const j = (i % n) * 3;
      pos[i * 3] = orig[j];
      pos[i * 3 + 1] = orig[j + 1];
      pos[i * 3 + 2] = orig[j + 2];
    }
    g.dispose();
    return pos;
  });

  const geometria = new BufferGeometry();
  const posicoes = new Float32Array(formas[0]);
  geometria.setAttribute('position', new BufferAttribute(posicoes, 3));

  const material = new PointsMaterial({
    color: 0xf2f2f2,
    size: 0.015,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });

  const pontos = new Points(geometria, material);
  pontos.rotation.set(0.35, 0.6, 0);
  scene.add(pontos);

  // === Tamanho: segue o container, não a janela ===
  const ajustar = () => {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    // Em telas estreitas a câmera se afasta só o necessário para a forma caber na largura.
    // 0,414 é a tangente de metade do campo de visão vertical de 45 graus.
    camera.position.z = Math.max(6, 2.1 / (0.414 * camera.aspect));
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    if (estatico) renderer.render(scene, camera);
  };
  const ro = new ResizeObserver(ajustar);
  ro.observe(container);
  ajustar();

  if (estatico) {
    renderer.render(scene, camera);
    aoMudarForma?.(0);
    return () => {
      ro.disconnect();
      geometria.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }

  // === Interação ===
  let mouseX = 0;
  let mouseY = 0;
  const aoMover = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    mouseX = (e.clientX / window.innerWidth - 0.5) * 0.5;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5;
  };
  window.addEventListener('pointermove', aoMover, { passive: true });

  // === Animação ===
  let atual = 0;
  let proxima = 1;
  let progresso = 0;
  let ultimo = 0;
  let quadro = 0;
  let visivel = true;
  aoMudarForma?.(proxima);

  const passo = (agora: number) => {
    quadro = requestAnimationFrame(passo);
    const dt = ultimo ? Math.min((agora - ultimo) / 1000, 0.1) : 0;
    ultimo = agora;

    pontos.rotation.y += (ROT_Y + mouseX * PARALLAX) * dt;
    pontos.rotation.x += (ROT_X + mouseY * PARALLAX) * dt;

    progresso += VEL_MORPH * dt;
    if (progresso >= 1 + ESPERA) {
      progresso = 0;
      atual = proxima;
      proxima = (proxima + 1) % formas.length;
      aoMudarForma?.(proxima);
    }

    if (progresso < 1) {
      const t = progresso * progresso * (3 - 2 * progresso);
      const a = formas[atual];
      const b = formas[proxima];
      for (let i = 0; i < posicoes.length; i++) {
        posicoes[i] = a[i] + (b[i] - a[i]) * t;
      }
      geometria.attributes.position.needsUpdate = true;
    } else if (progresso - VEL_MORPH * dt < 1) {
      // Fecha a transição exatamente na forma final.
      posicoes.set(formas[proxima]);
      geometria.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
  };

  const tocar = () => {
    if (quadro || !visivel || document.hidden) return;
    ultimo = 0;
    quadro = requestAnimationFrame(passo);
  };
  const pausar = () => {
    cancelAnimationFrame(quadro);
    quadro = 0;
  };

  // Pausa fora da tela e com a aba escondida.
  const io = new IntersectionObserver(([e]) => {
    visivel = e.isIntersecting;
    visivel ? tocar() : pausar();
  });
  io.observe(container);
  const aoTrocarAba = () => (document.hidden ? pausar() : tocar());
  document.addEventListener('visibilitychange', aoTrocarAba);

  tocar();

  return () => {
    pausar();
    io.disconnect();
    ro.disconnect();
    window.removeEventListener('pointermove', aoMover);
    document.removeEventListener('visibilitychange', aoTrocarAba);
    geometria.dispose();
    material.dispose();
    renderer.dispose();
    canvas.remove();
  };
}
