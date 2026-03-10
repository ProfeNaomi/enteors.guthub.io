/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Calculator, MapPin, Flag, Info } from 'lucide-react';
import { Footer } from './components/Footer';

export default function App() {
  const [num1, setNum1] = useState<string>('');
  const [num2, setNum2] = useState<string>('');
  const [operation, setOperation] = useState<'+' | '-'>('+');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleNum1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^-?\d*$/.test(val)) {
      setNum1(val);
    }
  };

  const handleNum2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^-?\d*$/.test(val)) {
      setNum2(val);
    }
  };

  const n1 = parseInt(num1, 10);
  const n2 = parseInt(num2, 10);
  const isValid = !isNaN(n1) && !isNaN(n2);
  
  // Calculate the actual jump and result based on the operation
  const jump = isValid ? (operation === '+' ? n2 : -n2) : 0;
  const result = isValid ? n1 + jump : null;

  // SVG parameters for the number line (-100 to 100)
  // 201 numbers, 80px spacing = 16080px width + padding
  const getX = (val: number) => 60 + (val + 100) * 80;
  const svgWidth = 16120;

  // Auto-scroll to center the action
  useEffect(() => {
    if (scrollContainerRef.current) {
      let targetX = getX(0); // Default center is 0
      
      if (isValid) {
        // Center between start and end
        targetX = (getX(n1) + getX(n1 + jump)) / 2;
      } else if (!isNaN(n1)) {
        // Center on start number
        targetX = getX(n1);
      }

      const containerWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: targetX - containerWidth / 2,
        behavior: 'smooth'
      });
    }
  }, [n1, jump, isValid]);

  // Initial center on 0
  useEffect(() => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: getX(0) - containerWidth / 2,
        behavior: 'auto'
      });
    }
  }, []);

  const isPositiveJump = jump >= 0;
  const jumpColor = isPositiveJump ? "#3b82f6" : "#ef4444"; // Blue for positive, Red for negative
  const markerId = isPositiveJump ? "arrowhead-blue" : "arrowhead-red";

  // Calculate path for the jump
  let pathD = "";
  let startX = 0;
  let endX = 0;
  let yTop = 80;
  
  if (isValid && jump !== 0) {
    startX = getX(n1);
    endX = getX(n1 + jump);
    const dir = endX > startX ? 1 : -1;
    const radius = 20;
    const yStart = 180;
    const yEnd = 155;

    pathD = `
      M ${startX} ${yStart}
      L ${startX} ${yTop + radius}
      Q ${startX} ${yTop} ${startX + radius * dir} ${yTop}
      L ${endX - radius * dir} ${yTop}
      Q ${endX} ${yTop} ${endX} ${yTop + radius}
      L ${endX} ${yEnd}
    `;
  }

  return (
    <div className="min-h-screen bg-slate-50 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:20px_20px] p-4 md:p-8 pb-32 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
            <Calculator size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Aventura de Números Enteros</h1>
            <p className="text-indigo-100 font-medium mt-1">Descubre cómo sumar y restar moviéndote en la recta numérica</p>
          </div>
        </div>

        {/* Number Line Section */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
            <MapPin className="text-indigo-500" /> Recta Numérica (-100 a 100)
          </h2>
          
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto w-full pb-6 custom-scrollbar cursor-grab active:cursor-grabbing"
          >
            <div style={{ width: `${svgWidth}px`, minWidth: `${svgWidth}px` }}>
              <svg viewBox={`0 0 ${svgWidth} 280`} className="w-full h-full drop-shadow-sm">
                <defs>
                  <marker id="arrowhead-blue" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
                    <path d="M 0 0 L 12 6 L 0 12 Z" fill="#3b82f6" />
                  </marker>
                  <marker id="arrowhead-red" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
                    <path d="M 0 0 L 12 6 L 0 12 Z" fill="#ef4444" />
                  </marker>
                  <filter id="ruler-shadow" x="-1%" y="-10%" width="102%" height="130%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.05" />
                  </filter>
                </defs>
                
                {/* Ruler Body */}
                <rect x="20" y="180" width={svgWidth - 40} height="80" rx="16" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" filter="url(#ruler-shadow)" />
                <line x1="20" y1="180" x2={svgWidth - 20} y2="180" stroke="#94a3b8" strokeWidth="2" />
                
                {/* Highlight lines for Start and End */}
                {isValid && (
                  <>
                    <line x1={startX} y1={180} x2={startX} y2={260} stroke="#3b82f6" strokeWidth="4" strokeDasharray="6 4" opacity="0.4" />
                    <line x1={endX} y1={180} x2={endX} y2={260} stroke="#22c55e" strokeWidth="4" strokeDasharray="6 4" opacity="0.4" />
                  </>
                )}

                {/* Ticks and Labels */}
                {Array.from({ length: 201 }).map((_, i) => {
                  const val = i - 100;
                  const x = getX(val);
                  const isZero = val === 0;
                  const isMajor = val % 10 === 0;
                  const isMedium = val % 5 === 0;
                  
                  return (
                    <g key={val}>
                      <line 
                        x1={x} 
                        y1={180} 
                        x2={x} 
                        y2={isZero ? 215 : isMajor ? 205 : isMedium ? 195 : 190} 
                        stroke={isZero ? "#0f172a" : "#64748b"} 
                        strokeWidth={isZero ? 4 : isMajor ? 3 : 2} 
                        strokeLinecap="round"
                      />
                      <text 
                        x={x} 
                        y={245} 
                        textAnchor="middle" 
                        fontSize={isMajor ? "26" : "20"} 
                        fontWeight={isZero || isMajor ? "bold" : "600"} 
                        fill={isZero ? "#0f172a" : isMajor ? "#334155" : "#64748b"}
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Visualizations */}
                {isValid && (
                  <>
                    {/* Rectilinear Jump Path */}
                    {jump !== 0 && (
                      <>
                        <path 
                          d={pathD}
                          fill="none"
                          stroke={jumpColor}
                          strokeWidth="6"
                          strokeDasharray="10 8"
                          markerEnd={`url(#${markerId})`}
                          className="animate-[dash_1s_linear_infinite]"
                        />
                        {/* Distance Label */}
                        <text 
                          x={(startX + endX) / 2} 
                          y={yTop - 15} 
                          textAnchor="middle" 
                          fontSize="28" 
                          fontWeight="bold" 
                          fill={jumpColor}
                          className="drop-shadow-sm"
                        >
                          {jump > 0 ? `+${jump}` : jump}
                        </text>
                      </>
                    )}
                    
                    {/* Start Point */}
                    <circle cx={startX} cy={180} r="10" fill="#3b82f6" stroke="#fff" strokeWidth="4" className="drop-shadow-md" />
                    
                    {/* End Point */}
                    <circle cx={endX} cy={180} r="12" fill="#22c55e" stroke="#fff" strokeWidth="4" className="drop-shadow-md" />
                  </>
                )}
              </svg>
            </div>
          </div>

          {isValid && (n1 < -100 || n1 > 100 || result! < -100 || result! > 100) && (
            <div className="text-amber-600 text-sm text-center mt-2 font-medium bg-amber-50 py-2 rounded-lg border border-amber-200">
              ⚠️ Algunos números están fuera de la recta visible (-100 a 100), pero el cálculo es correcto.
            </div>
          )}
        </div>

        {/* Inputs Section */}
        <div className="p-6 md:p-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
            
            {/* Input 1: Start */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-5 w-full md:w-56 text-center shadow-sm relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <MapPin size={12} /> INICIO
              </div>
              <label htmlFor="num1" className="text-blue-700 font-semibold mb-3 block text-sm uppercase tracking-wider">
                ¿Dónde estás?
              </label>
              <input
                id="num1"
                type="text"
                inputMode="numeric"
                value={num1}
                onChange={handleNum1Change}
                placeholder="0"
                className="w-full text-center text-4xl font-bold font-mono bg-white border-2 border-blue-300 rounded-2xl py-3 text-blue-600 focus:ring-4 focus:ring-blue-200 outline-none transition-all"
              />
            </div>
            
            {/* Operation Toggle */}
            <button 
              onClick={() => setOperation(op => op === '+' ? '-' : '+')}
              className="w-16 h-16 rounded-full bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-slate-600 font-bold text-4xl shadow-sm transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-slate-200 shrink-0"
              title="Cambiar operación"
            >
              {operation}
            </button>

            {/* Input 2: Movement */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-5 w-full md:w-56 text-center shadow-sm relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                MOVIMIENTO
              </div>
              <label htmlFor="num2" className="text-orange-700 font-semibold mb-3 block text-sm uppercase tracking-wider">
                ¿Qué número?
              </label>
              <input
                id="num2"
                type="text"
                inputMode="numeric"
                value={num2}
                onChange={handleNum2Change}
                placeholder="0"
                className="w-full text-center text-4xl font-bold font-mono bg-white border-2 border-orange-300 rounded-2xl py-3 text-orange-600 focus:ring-4 focus:ring-orange-200 outline-none transition-all"
              />
            </div>

            {/* Equals Sign */}
            <div className="text-slate-300 font-bold text-5xl">=</div>

            {/* Result */}
            <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-5 w-full md:w-56 text-center shadow-sm relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Flag size={12} /> LLEGADA
              </div>
              <label className="text-green-700 font-semibold mb-3 block text-sm uppercase tracking-wider">
                Resultado
              </label>
              <div className="w-full text-center text-4xl font-bold font-mono bg-white border-2 border-green-300 rounded-2xl py-3 text-green-600 h-[76px] flex items-center justify-center">
                {result !== null ? result : <span className="text-green-200">?</span>}
              </div>
            </div>

          </div>

          {/* Educational Explanation */}
          {isValid && (
            <div className="mt-10 bg-indigo-50 rounded-2xl p-6 border border-indigo-100 shadow-sm">
              <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <Info className="text-indigo-500" /> ¿Qué está pasando?
              </h3>
              <ul className="space-y-4 text-indigo-800 text-lg">
                <li className="flex items-start gap-3">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">1</span>
                  <p>
                    Empezamos en el número <strong className="text-blue-700 text-xl">{n1}</strong>. 
                    Ese es nuestro punto de partida en la recta.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">2</span>
                  <p>
                    Le {operation === '+' ? 'sumamos' : 'restamos'} <strong className="text-orange-700 text-xl">{n2}</strong>. 
                    {operation === '+' ? (
                      <>
                        {' '}Como estamos sumando, mantenemos el sentido del número. 
                        Damos <strong className="text-orange-700">{Math.abs(jump)}</strong> pasos hacia la{' '}
                        <strong className="text-orange-700">{jump >= 0 ? 'derecha' : 'izquierda'}</strong>.
                      </>
                    ) : (
                      <>
                        {' '}Como estamos restando, cambiamos el sentido del movimiento (es como sumar el opuesto). 
                        Damos <strong className="text-orange-700">{Math.abs(jump)}</strong> pasos hacia la{' '}
                        <strong className="text-orange-700">{jump >= 0 ? 'derecha' : 'izquierda'}</strong>.
                      </>
                    )}
                    <br/>
                    <span className="text-sm text-indigo-600 mt-1 inline-block">
                      (Observa la línea <strong>{jump >= 0 ? 'azul' : 'roja'}</strong> en la recta numérica)
                    </span>
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">3</span>
                  <p>
                    ¡Aterrizamos en el <strong className="text-green-700 text-xl">{result}</strong>! Ese es nuestro resultado final.
                  </p>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
