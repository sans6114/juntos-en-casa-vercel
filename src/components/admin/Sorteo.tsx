import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import Swal from 'sweetalert2';

interface InscripcionReact {
  nombre: string;
  apellido: string;
}


export const Sorteo = ({ inscripciones }: {inscripciones: InscripcionReact[]}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [ganadores, setGanadores] = useState<number[]>([]);
  const [displayList, setDisplayList] = useState<string[]>([]);

  const MAX_DISPLAY = 50;
  const MAX_GANADORES = 10;

  // Solo el nombre para mostrar
  const nombres: string[] = inscripciones.map((i) => i.nombre);

  // Helper: "Apellido, Nombre" (soporta nombre/apellido o name/lastName)
  const nombreCompleto = (i: InscripcionReact) => {
    const nombre = (i as any).nombre ?? (i as any).nombre ?? '';
    const apellido = (i as any).apellido ?? (i as any).apellido ?? '';
    return apellido ? `${apellido}, ${nombre}` : nombre;
  };

  // Construir lista visible (máximo 50)
  useEffect(() => {
    setDisplayList(nombres.slice(0, MAX_DISPLAY));
  }, [nombres]);

  // Dibujo de la ruleta (con la lista visible)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;

    const cssSize = Math.min(canvas.clientWidth || 520, 520);
    const size = cssSize * dpr;
    const radius = size / 2;

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(radius, radius);

    const n = Math.max(1, displayList.length);
    const seg = (Math.PI * 2) / n;

    for (let i = 0; i < n; i++) {
      const start = i * seg + rotation;

      // Segmento
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius - 6 * dpr, start, start + seg);
      ctx.closePath();
      ctx.fillStyle = 'white';
      ctx.fill();

      ctx.strokeStyle = 'rgba(0,0,0,.2)';
      ctx.lineWidth = 2 * dpr;
      ctx.stroke();

      // Texto
      ctx.save();
      ctx.rotate(start + seg / 2);
      ctx.fillStyle = 'black';
      ctx.font = `${Math.max(12, radius / 14)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 4 * dpr;
      const text = displayList[i] ?? '';
      ctx.fillText(text, radius - 14 * dpr, 0);
      ctx.restore();
    }

    ctx.restore();
  }, [rotation, displayList]);

  // Animación de giro hacia un índice objetivo dentro de la ruleta visible
  const animateToTarget = (idxEnRuleta: number, totalVisible: number) =>
    new Promise<void>((resolve) => {
      const n = Math.max(1, totalVisible);
      const seg = (Math.PI * 2) / n;
      const mid = idxEnRuleta * seg + seg / 2;

      const baseDelta = normalizeAngle(-Math.PI / 2 - rotation - mid);
      const vueltas = 5 + Math.floor(Math.random() * 3); // 5–7 vueltas
      const delta = baseDelta + vueltas * Math.PI * 2;

      const dur = 6000; // ms
      const start = performance.now();
      const startRot = rotation;

      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / dur);
        const eased = easeOutCubic(p);
        setRotation(startRot + delta * eased);
        if (p < 1) requestAnimationFrame(tick);
        else {
          setRotation(startRot + delta);
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });

  const girar = async () => {
    if (spinning || nombres.length === 0) return;
    if (ganadores.length >= MAX_GANADORES) return;

    setSpinning(true);

    const winnersThisShot: number[] = [];
    for (let k = 0; k < 2 && ganadores.length + winnersThisShot.length < MAX_GANADORES; k++) {
      // Elegibles: todos menos ganadores previos y los de este tiro
      const excluidos = new Set([...ganadores, ...winnersThisShot]);
      const elegibles: number[] = [];
      for (let i = 0; i < nombres.length; i++) {
        if (!excluidos.has(i)) elegibles.push(i);
      }
      if (elegibles.length === 0) break;

      const elegidoIdxGlobal = elegibles[Math.floor(Math.random() * elegibles.length)];
      const winnerName = nombres[elegidoIdxGlobal];

      // Asegurar que el ganador esté en la ruleta visible (máx. 50)
      let dl = displayList.slice();
      let idxEnRuleta = dl.findIndex((n) => n === winnerName);
      if (idxEnRuleta === -1) {
        if (dl.length < MAX_DISPLAY) {
          dl.push(winnerName);
          idxEnRuleta = dl.length - 1;
        } else {
          const replaceAt = Math.floor(Math.random() * dl.length);
          dl[replaceAt] = winnerName;
          idxEnRuleta = replaceAt;
        }
        setDisplayList(dl);
      }

      // Girar hasta el segmento del ganador actual
      await animateToTarget(idxEnRuleta, dl.length);

      // Registrar ganador
      setGanadores((prev) => [...prev, elegidoIdxGlobal]);
      winnersThisShot.push(elegidoIdxGlobal);

      // Mostrar alerta del ganador (Apellido, Nombre)
      await Swal.fire({
        title: `Ganador ${k + 1}/2`,
        text: nombreCompleto(inscripciones[elegidoIdxGlobal]),
        imageUrl: '/personaje/fuegofestejando.png',
        imageHeight: 400,     // quitar para no deformar
        imageAlt: 'Ganador',
        confirmButtonText: 'Volver a girar',
        confirmButtonColor: 'red',
      });
    }

    setSpinning(false);
  };

  const reiniciar = () => {
    setGanadores([]);
    setRotation(0);
    setSpinning(false);
  };


  return (
    <div
      className='flex items-center justify-center w-full z-50'
    >
      <div
        className='flex justify-center relative'
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '65%',
            height: 'auto',
            display: 'block',
            background: 'white',
            borderRadius: 12,
          }}
        />
        {/* Marcador */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: -2,
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderBottom: '20px solid #e11d48',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.3))',
          }}
        />
      </div>
      <div className='w-[700px] h-[400px] flex justify-between gap-4'>
        <div
          className='flex flex-col items-center justify-center gap-5'
        >
          <button
            onClick={girar}
            disabled={spinning || nombres.length === 0 || ganadores.length >= MAX_GANADORES}
            className='btn btn-primary w-46'
          >
            {spinning ? 'Girando…' : 'Sacar 2 ganadores'}
          </button>
          <button onClick={reiniciar} disabled={spinning} className='btn btn-secondary w-46'>
            Reiniciar
          </button>
        </div>
        {/* Lista de ganadores */}
        <div
          className="w-3/4 h-full flex flex-col rounded-2xl text-white p-4 text-left min-h-0 bg-[url('/background/fondo1.webp')] bg-cover bg-center bg-no-repeat"
        >
          <div className='shrink-0 space-y-1'>
            <span className='block text-3xl font-bold'>Participantes: {nombres.length}</span>
            <span className='block text-xl font-semibold'>Ganadores: {ganadores.length}/{MAX_GANADORES}</span>
          </div>
          <div className='mt-3 flex-1 overflow-auto'>
            {ganadores.length > 0 ? (
              <ul className='list-decimal list-inside space-y-1'>
                {ganadores.map((idx, i) => (
                  <li key={`${idx}-${i}`}>{nombreCompleto(inscripciones[idx])}</li>
                ))}
              </ul>
            ) : (
              <p className='opacity-80'>Sin ganadores aún.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function normalizeAngle(a: number) {
  const tau = Math.PI * 2;
  return ((a % tau) + tau) % tau;
}
