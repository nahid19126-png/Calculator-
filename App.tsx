
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Calculator, 
  History as HistoryIcon, 
  Settings, 
  LineChart, 
  Globe, 
  Zap, 
  RefreshCcw,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Trash2,
  Info,
  Hourglass,
  RotateCcw,
  RotateCw,
  Save,
  Download,
  Palette,
  Box,
  Hash
} from 'lucide-react';
import { create, all } from 'mathjs';
import { 
  AppTab, 
  AngleUnit, 
  HistoryItem, 
  KeyType,
  ScientificConstant,
  ThemePreset,
  CustomTheme
} from './types';
import { 
  TOP_ROW_LEFT,
  TOP_ROW_RIGHT,
  SCI_BUTTONS, 
  MAIN_BUTTONS 
} from './constants';

const math = create(all);

const SCI_CONSTANTS: ScientificConstant[] = [
  { symbol: 'c', name: 'Speed of Light', nameBn: 'আলোর গতি', value: '299792458', unit: 'm/s' },
  { symbol: 'G', name: 'Gravitational Constant', nameBn: 'মহাকর্ষীয় ধ্রুবক', value: '6.67430e-11', unit: 'm³/(kg·s²)' },
  { symbol: 'h', name: 'Planck Constant', nameBn: 'প্ল্যাঙ্ক ধ্রুবক', value: '6.62607015e-34', unit: 'J·s' },
  { symbol: 'NA', name: 'Avogadro Constant', nameBn: 'অ্যাভোগাড্রো ধ্রুবক', value: '6.02214076e23', unit: 'mol⁻¹' },
  { symbol: 'k', name: 'Boltzmann Constant', nameBn: 'বোল্টজম্যান ধ্রুবক', value: '1.380649e-23', unit: 'J/K' },
  { symbol: 'R', name: 'Gas Constant', nameBn: 'গ্যাস ধ্রুবক', value: '8.314462618', unit: 'J/(mol·K)' },
  { symbol: 'me', name: 'Electron Mass', nameBn: 'ইলেকট্রনের ভর', value: '9.1093837e-31', unit: 'kg' },
];

const currencies = [
  { code: 'USD', rate: 1, name: 'US Dollar' },
  { code: 'EUR', rate: 0.92, name: 'Euro' },
  { code: 'GBP', rate: 0.79, name: 'British Pound' },
  { code: 'JPY', rate: 151.41, name: 'Japanese Yen' },
  { code: 'BDT', rate: 109.50, name: 'Bangladeshi Taka' },
  { code: 'INR', rate: 83.33, name: 'Indian Rupee' },
  { code: 'CAD', rate: 1.35, name: 'Canadian Dollar' },
  { code: 'AUD', rate: 1.52, name: 'Australian Dollar' },
];

const THEME_PRESETS: Record<ThemePreset, CustomTheme> = {
  CLASSIC: { background: '#1a1a1a', button: '#3a3a3a', lcd: '#9ca3af', text: '#111' },
  DARK: { background: '#000000', button: '#222222', lcd: '#1a202c', text: '#63b3ed' },
  LIGHT: { background: '#f7fafc', button: '#edf2f7', lcd: '#e2e8f0', text: '#2d3748' },
  CUSTOM: { background: '#1a1a1a', button: '#3a3a3a', lcd: '#9ca3af', text: '#111' },
};

const App: React.FC = () => {
  const [expression, setExpression] = useState('');
  const [cursorPos, setCursorPos] = useState(0);
  const [result, setResult] = useState('0');
  const [memory, setMemory] = useState(0);
  const [exactResult, setExactResult] = useState<string | null>(null);
  const [showExact, setShowExact] = useState(true);
  const [isShift, setIsShift] = useState(false);
  const [isAlpha, setIsAlpha] = useState(false);
  const [isPowerOff, setIsPowerOff] = useState(false);
  const [showSpecialSigns, setShowSpecialSigns] = useState(true);
  const [displayMode, setDisplayMode] = useState<'SINGLE' | 'ORIGINAL'>('ORIGINAL');
  const [isResultShowing, setIsResultShowing] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('CALC');
  const [angleUnit, setAngleUnit] = useState<AngleUnit>(AngleUnit.DEG);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [language, setLanguage] = useState<'EN' | 'BN'>('BN');
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [precision, setPrecision] = useState(10);
  
  const [undoStack, setUndoStack] = useState<{expr: string, pos: number}[]>([]);
  const [redoStack, setRedoStack] = useState<{expr: string, pos: number}[]>([]);

  const [activeTheme, setActiveTheme] = useState<ThemePreset>('CLASSIC');
  const [customTheme, setCustomTheme] = useState<CustomTheme>(THEME_PRESETS.CLASSIC);

  const [numBtnHeight, setNumBtnHeight] = useState(40);
  const [sciBtnHeight, setSciBtnHeight] = useState(24);
  const [numFontSize, setNumFontSize] = useState(18);
  const [sciFontSize, setSciFontSize] = useState(8);
  const [extFontSize, setExtFontSize] = useState(6);

  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('BDT');
  const [convAmount, setConvAmount] = useState('1');
  const [convResult, setConvResult] = useState('0');

  const [birthDate, setBirthDate] = useState<string>('1990-01-01');
  const [birthTime, setBirthTime] = useState<string>('00:00');
  const [ageBreakdown, setAgeBreakdown] = useState({
    years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0
  });

  const moveIntervalRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lcdScrollRef = useRef<HTMLDivElement>(null);
  const resultScrollRef = useRef<HTMLDivElement>(null);

  const currentTheme = activeTheme === 'CUSTOM' ? customTheme : THEME_PRESETS[activeTheme];

  const playClickSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {}
  }, []);

  const saveToUndo = useCallback((expr: string, pos: number) => {
    setUndoStack(prev => [{ expr, pos }, ...prev].slice(0, 50));
    setRedoStack([]);
  }, []);

  const undo = () => {
    if (undoStack.length === 0) return;
    const current = { expr: expression, pos: cursorPos };
    const prev = undoStack[0];
    setRedoStack(r => [current, ...r]);
    setUndoStack(u => u.slice(1));
    setExpression(prev.expr);
    setCursorPos(prev.pos);
    playClickSound();
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const current = { expr: expression, pos: cursorPos };
    const next = redoStack[0];
    setUndoStack(u => [current, ...u]);
    setRedoStack(r => r.slice(1));
    setExpression(next.expr);
    setCursorPos(next.pos);
    playClickSound();
  };

  const saveSession = () => {
    const session = { expression, result, history, memory, angleUnit, activeTheme, customTheme };
    localStorage.setItem('calc_session', JSON.stringify(session));
    alert('Session Saved!');
  };

  const loadSession = () => {
    const saved = localStorage.getItem('calc_session');
    if (saved) {
      const data = JSON.parse(saved);
      setExpression(data.expression || '');
      setResult(data.result || '0');
      setHistory(data.history || []);
      setMemory(data.memory || 0);
      setAngleUnit(data.angleUnit || AngleUnit.DEG);
      setActiveTheme(data.activeTheme || 'CLASSIC');
      setCustomTheme(data.customTheme || THEME_PRESETS.CLASSIC);
      alert('Session Loaded!');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const birth = new Date(`${birthDate}T${birthTime}`);
      const now = new Date();
      let diff = now.getTime() - birth.getTime();
      if (diff < 0) {
        setAgeBreakdown({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const yrs = now.getFullYear() - birth.getFullYear();
      const birthWithYrs = new Date(birth);
      birthWithYrs.setFullYear(birth.getFullYear() + yrs);
      let finalYrs = yrs;
      if (birthWithYrs > now) finalYrs--;
      const birthAfterYrs = new Date(birth);
      birthAfterYrs.setFullYear(birth.getFullYear() + finalYrs);
      let months = now.getMonth() - birthAfterYrs.getMonth();
      if (months < 0) months += 12;
      const birthAfterMonths = new Date(birthAfterYrs);
      birthAfterMonths.setMonth(birthAfterYrs.getMonth() + months);
      if (birthAfterMonths > now) {
        months--;
        if (months < 0) months += 12;
      }
      const birthAfterAllMonths = new Date(birthAfterYrs);
      birthAfterAllMonths.setMonth(birthAfterYrs.getMonth() + (months < 0 ? 0 : months));
      const timeDiff = now.getTime() - birthAfterAllMonths.getTime();
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
      const seconds = Math.floor((timeDiff / 1000) % 60);
      setAgeBreakdown({ years: finalYrs, months, days, hours, minutes, seconds });
    }, 1000);
    return () => clearInterval(timer);
  }, [birthDate, birthTime]);

  useEffect(() => {
    if (lcdScrollRef.current && !isResultShowing) {
      lcdScrollRef.current.scrollTop = lcdScrollRef.current.scrollHeight;
    }
    if (resultScrollRef.current && isResultShowing) {
      resultScrollRef.current.scrollLeft = resultScrollRef.current.scrollWidth;
    }
  }, [expression, cursorPos, displayMode, isResultShowing]);

  useEffect(() => {
    const from = currencies.find(c => c.code === fromCurrency)?.rate || 1;
    const to = currencies.find(c => c.code === toCurrency)?.rate || 1;
    const val = parseFloat(convAmount);
    const res = (isNaN(val) ? 0 : val / from) * to;
    setConvResult(res.toFixed(4));
  }, [fromCurrency, toCurrency, convAmount]);

  const calculate = useCallback(() => {
    try {
      if (!expression) return;
      let expr = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/Ans/g, result)
        .replace(/π/g, 'pi')
        .replace(/x³/g, '^3')
        .replace(/x²/g, '^2')
        .replace(/i/g, 'i');
        
      const config = { angles: angleUnit === AngleUnit.DEG ? 'deg' : (angleUnit === AngleUnit.RAD ? 'rad' : 'grad') };
      expr = expr.replace(/(sin|cos|tan)\(([^)]+)\)/g, (match, func, val) => `${func}((${val}) ${config.angles})`);
      
      const res = math.evaluate(expr);
      try {
        const frac = math.fraction(res);
        if (frac.d !== 1 && frac.d < 1000) setExactResult(`${frac.n}/${frac.d}`);
        else setExactResult(null);
      } catch { setExactResult(null); }
      
      let resStr = String(res);
      if (typeof res === 'number') {
        resStr = res.toLocaleString(undefined, { maximumSignificantDigits: precision });
      } else if (res && typeof res.toString === 'function') {
        resStr = res.toString();
      }
      
      setResult(resStr);
      setShowExact(true);
      setIsResultShowing(true);
      saveToHistory(expression, exactResult || resStr);
    } catch (err) {
      setResult('Syntax ERROR');
      setExactResult(null);
      setIsResultShowing(true);
    }
  }, [expression, result, angleUnit, precision, exactResult]);

  const handleKey = (val: string, type: KeyType) => {
    if (isPowerOff && val !== 'ON') return;
    playClickSound();
    if (hapticEnabled && window.navigator.vibrate) window.navigator.vibrate(8);
    
    saveToUndo(expression, cursorPos);

    if (isResultShowing && !['SHIFT', 'ALPHA', 'MODE', 'ON', 'OFF', '=', 'mplus', 'mminus', 'mc', 'mr'].includes(val)) {
      setIsResultShowing(false);
      if (type === KeyType.NUMBER || val === 'Ans' || val === '(') {
        setExpression('');
        setCursorPos(0);
      } else if (type === KeyType.OPERATOR || type === KeyType.FUNCTION) {
        setExpression('Ans');
        setCursorPos(3);
      }
    }

    switch (val) {
      case 'ON': setIsPowerOff(false); setExpression(''); setResult('0'); setExactResult(null); setCursorPos(0); setIsResultShowing(false); break;
      case 'OFF': setIsPowerOff(true); setIsShift(false); break;
      case 'AC': 
        if (isShift) { setMemory(0); setIsShift(false); }
        else { setExpression(''); setResult('0'); setExactResult(null); setCursorPos(0); setIsResultShowing(false); }
        break;
      case 'DEL':
        if (isShift) { handleKey('OFF', KeyType.COMMAND); return; }
        const left = expression.slice(0, cursorPos - 1);
        const right = expression.slice(cursorPos);
        setExpression(left + right);
        setCursorPos(prev => Math.max(0, prev - 1));
        break;
      case '=': calculate(); break;
      case 'SHIFT': setIsShift(!isShift); setIsAlpha(false); break;
      case 'ALPHA': setIsAlpha(!isAlpha); setIsShift(false); break;
      case 'MODE': if (isShift) { setExpression(''); setResult('0'); setAngleUnit(AngleUnit.DEG); } else { setActiveTab('SETTINGS'); } break;
      case 'x³': 
      case 'x²':
        const b = expression.slice(0, cursorPos);
        const a = expression.slice(cursorPos);
        setExpression(b + val + a);
        setCursorPos(p => p + 2);
        break;
      case 'mplus':
        const valToAdd = parseFloat(result);
        if (!isNaN(valToAdd)) setMemory(m => m + valToAdd);
        setIsShift(false); setIsAlpha(false);
        break;
      case 'mr':
        const memStr = memory.toString();
        const beforeMr = expression.slice(0, cursorPos);
        const afterMr = expression.slice(cursorPos);
        setExpression(beforeMr + memStr + afterMr);
        setCursorPos(p => p + memStr.length);
        setIsShift(false); setIsAlpha(false);
        break;
      default:
        let toAppend = val;
        if (type === KeyType.FUNCTION && ['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'det', 'inv', 'mean', 'std', 'var', 'abs', 'arg', 're', 'im'].includes(val)) toAppend = `${val}(`;
        const before = expression.slice(0, cursorPos);
        const after = expression.slice(cursorPos);
        setExpression(before + toAppend + after);
        setCursorPos(prev => prev + toAppend.length);
        setIsShift(false); setIsAlpha(false); setExactResult(null);
    }
  };

  const startCursorMove = (dir: 'L' | 'R') => {
    if (isPowerOff) return;
    const move = () => {
      playClickSound();
      if (dir === 'L') setCursorPos(p => Math.max(0, p - 1));
      if (dir === 'R') setCursorPos(p => Math.min(expression.length, p + 1));
    };
    move();
    moveIntervalRef.current = window.setInterval(move, 120);
  };

  const stopCursorMove = () => { if (moveIntervalRef.current) { clearInterval(moveIntervalRef.current); moveIntervalRef.current = null; } };

  const saveToHistory = (expr: string, res: string) => {
    const newItem: HistoryItem = { id: Date.now().toString(), expression: expr, result: res, timestamp: Date.now() };
    const updated = [newItem, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem('calc_history', JSON.stringify(updated));
  };

  return (
    <div 
      className="flex flex-col h-full overflow-hidden rounded-[40px] border-[12px] border-[#333] shadow-2xl relative select-none font-sans"
      style={{ backgroundColor: currentTheme.background }}
    >
      <div className="bg-[#222] px-6 pt-5 pb-1 flex justify-between items-end text-gray-400">
        <div className="flex flex-col">
          <span className="text-white text-xl font-black tracking-tighter italic leading-none">CASIO</span>
          <span className="text-[8px] tracking-widest uppercase font-bold text-gray-600 mt-1">fx-100MS <span className="text-blue-500">Plus</span> Emulator</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-1 p-0.5 bg-[#111] rounded shadow-inner">
            {[1, 2, 3, 4].map(i => <div key={i} className="w-3 h-5 bg-[#2a1c1c] rounded-sm opacity-50"></div>)}
          </div>
        </div>
      </div>

      <div className="px-3 pt-1 pb-3 bg-[#222]">
        <div 
          className={`relative w-full transition-all duration-500 rounded-lg border-[3px] border-[#111] shadow-inner overflow-hidden ${isPowerOff ? 'power-off' : 'opacity-100'} ${displayMode === 'SINGLE' ? 'h-16' : 'h-36'}`}
          style={{ backgroundColor: currentTheme.lcd }}
        >
          <div 
            className="absolute top-1 left-3 right-3 flex justify-between text-[7px] font-black uppercase tracking-tighter z-10"
            style={{ color: currentTheme.text }}
          >
            <div className="flex gap-2">
              {isShift && <span className="bg-yellow-500 px-0.5 rounded shadow-sm">S</span>}
              {isAlpha && <span className="bg-red-500 px-0.5 text-white rounded shadow-sm">A</span>}
              {memory !== 0 && <span className="bg-gray-800 text-white px-0.5 rounded shadow-sm">M</span>}
            </div>
            <div className="flex gap-2">
              <span className={angleUnit === AngleUnit.DEG ? 'underline font-black' : 'opacity-10'}>Deg</span>
              <span className={angleUnit === AngleUnit.RAD ? 'underline font-black' : 'opacity-10'}>Rad</span>
              <span className="bg-gray-800 text-white px-1 rounded-xs font-mono">{displayMode[0]}</span>
            </div>
          </div>

          <div 
            className={`flex flex-col h-full p-3 pt-5 ${displayMode === 'SINGLE' ? 'justify-center' : 'justify-between'}`}
            style={{ color: currentTheme.text }}
          >
            {displayMode === 'ORIGINAL' ? (
              <>
                <div ref={lcdScrollRef} className="lcd-text text-lg leading-tight h-16 relative overflow-y-auto overflow-x-hidden whitespace-normal scrollbar-hide break-all">
                  {expression.split('').map((char, i) => (
                    <span key={i} className={i === cursorPos - 1 ? 'border-r-2 border-current animate-pulse' : ''}>{char}</span>
                  ))}
                  {cursorPos === 0 && expression.length === 0 && <span className="border-r-2 border-current animate-pulse">&nbsp;</span>}
                </div>
                <div ref={resultScrollRef} className="lcd-text text-3xl text-right font-bold h-10 flex items-end justify-end overflow-x-auto whitespace-nowrap scrollbar-hide">
                  {(exactResult && showExact) ? exactResult : result}
                </div>
              </>
            ) : (
              <div ref={resultScrollRef} className={`lcd-text text-xl break-keep leading-none w-full overflow-x-auto whitespace-nowrap scrollbar-hide flex items-center ${isResultShowing ? 'justify-end' : 'justify-start'}`}>
                {!isResultShowing ? (
                  <>
                    {expression.split('').map((char, i) => (
                      <span key={i} className={i === cursorPos - 1 ? 'border-r-2 border-current animate-pulse' : ''}>{char}</span>
                    ))}
                    {expression === '' && result}
                  </>
                ) : (
                  <span className="font-bold text-3xl">{(exactResult && showExact) ? exactResult : result}</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-2">
           <button onClick={() => { playClickSound(); setDisplayMode('SINGLE'); }} className={`flex items-center gap-1 text-[8px] font-black px-3 py-1 rounded-full border ${displayMode === 'SINGLE' ? 'bg-blue-600 text-white border-blue-400' : 'bg-[#333] text-gray-500 border-gray-700'}`}>
             <Minimize2 size={10} /> {language === 'BN' ? 'এক লাইন' : 'SINGLE'}
           </button>
           <button onClick={() => { playClickSound(); setDisplayMode('ORIGINAL'); }} className={`flex items-center gap-1 text-[8px] font-black px-3 py-1 rounded-full border ${displayMode === 'ORIGINAL' ? 'bg-blue-600 text-white border-blue-400' : 'bg-[#333] text-gray-500 border-gray-700'}`}>
             <Maximize2 size={10} /> {language === 'BN' ? 'আসল' : 'ORIGINAL'}
           </button>
           <button onClick={undo} className="bg-[#333] text-gray-400 p-1 rounded-full hover:bg-gray-700"><RotateCcw size={14}/></button>
           <button onClick={redo} className="bg-[#333] text-gray-400 p-1 rounded-full hover:bg-gray-700"><RotateCw size={14}/></button>
        </div>
      </div>

      <div className="bg-[#2a2a2a] flex justify-around p-1 border-y border-[#111] overflow-x-auto scrollbar-hide">
        {[
          { id: 'CALC', icon: <Calculator size={16} /> },
          { id: 'ADV', icon: <Box size={16} /> },
          { id: 'AGE', icon: <Hourglass size={16} /> },
          { id: 'CONVERT', icon: <Globe size={16} /> },
          { id: 'CONST', icon: <Zap size={16} /> },
          { id: 'HISTORY', icon: <HistoryIcon size={16} /> },
          { id: 'SETTINGS', icon: <Settings size={16} /> },
        ].map(tab => (
          <button key={tab.id} onClick={() => { playClickSound(); setActiveTab(tab.id as AppTab); }} className={`p-2 rounded-xl transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-300'}`}>
            {tab.icon}
          </button>
        ))}
      </div>

      <div className="flex-1 p-3 flex flex-col overflow-y-auto" style={{ backgroundColor: currentTheme.background }}>
        {activeTab === 'CALC' && (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 px-2">
              <div className="flex flex-col gap-2">
                {TOP_ROW_LEFT.map(btn => (
                  <button key={btn.label} onClick={() => handleKey(btn.value, btn.type)} className={`${btn.color} text-white w-10 h-7 rounded-lg text-[8px] font-black shadow-lg border-b-2 border-black/70`}>
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* D-PAD: Modified to only have Left and Right buttons */}
              <div className="relative w-24 h-24 bg-gradient-to-br from-[#444] to-[#222] rounded-full shadow-2xl border-[4px] border-[#333] flex items-center justify-center">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                  <div />
                  {/* Empty top cell */}
                  <div />
                  <div />
                  <button onMouseDown={() => startCursorMove('L')} onMouseUp={stopCursorMove} onMouseLeave={stopCursorMove} onTouchStart={() => startCursorMove('L')} onTouchEnd={stopCursorMove} className="flex items-center justify-center rounded-l-full active:bg-white/5"><ChevronLeft size={18} className="text-gray-400" /></button>
                  <div className="bg-[#111] rounded-full m-1 border border-[#444] shadow-inner" />
                  <button onMouseDown={() => startCursorMove('R')} onMouseUp={stopCursorMove} onMouseLeave={stopCursorMove} onTouchStart={() => startCursorMove('R')} onTouchEnd={stopCursorMove} className="flex items-center justify-center rounded-r-full active:bg-white/5"><ChevronRight size={18} className="text-gray-400" /></button>
                  <div />
                  {/* Empty bottom cell */}
                  <div />
                  <div />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {TOP_ROW_RIGHT.map(btn => (
                  <button key={btn.label} onClick={() => handleKey(btn.value, btn.type)} className={`${btn.color} text-white w-10 h-7 rounded-lg text-[8px] font-black shadow-lg border-b-2 border-black/70`}>
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`grid grid-cols-6 gap-x-2 gap-y-4 mb-4 transition-all duration-300 ${showSpecialSigns ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
              {SCI_BUTTONS.map(btn => (
                <div key={btn.label} className="relative flex flex-col items-center">
                  {btn.shiftLabel && (
                    <span style={{ fontSize: `${extFontSize}px` }} className="text-yellow-500 font-black absolute -top-3">
                      {btn.shiftLabel}
                    </span>
                  )}
                  <button 
                    onClick={() => handleKey(isShift && btn.shiftLabel ? (btn.shiftLabel === 'M-' ? 'mminus' : (btn.shiftLabel === 'STO' ? 'mc' : btn.shiftLabel)) : (isAlpha && btn.alphaLabel ? (btn.alphaLabel === 'M' ? 'mr' : btn.alphaLabel) : btn.value), btn.type)} 
                    style={{ height: `${sciBtnHeight}px`, fontSize: `${sciFontSize}px`, backgroundColor: currentTheme.button }}
                    className="w-full text-gray-200 rounded font-bold shadow-sm border-b-2 border-black/80 flex items-center justify-center"
                  >
                    {btn.label}
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-2.5 mt-auto pb-4 px-1">
              {MAIN_BUTTONS.map(btn => (
                <div key={btn.label} className="relative">
                  {btn.shiftLabel && (
                    <span style={{ fontSize: `${extFontSize}px` }} className="text-yellow-500 font-black absolute -top-3 left-1">
                      {btn.shiftLabel}
                    </span>
                  )}
                  <button 
                    onClick={() => handleKey(isShift && btn.shiftLabel ? btn.shiftLabel : btn.value, btn.type)} 
                    style={{ height: `${numBtnHeight}px`, fontSize: `${numFontSize}px`, backgroundColor: btn.color || currentTheme.button }}
                    className={`text-white w-full rounded-lg font-black shadow-md border-b-2 border-black/80 flex items-center justify-center hover:brightness-110 active:translate-y-0.5`}
                  >
                    {btn.label}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ADV' && (
          <div className="h-full text-white space-y-4">
             <h2 className="text-lg font-black border-b border-gray-800 pb-1 flex items-center gap-2 text-purple-400"><Box size={18}/> Advanced Functions</h2>
             <div className="grid grid-cols-3 gap-3">
                <div className="col-span-3 text-[10px] font-bold text-gray-500 uppercase">Matrices</div>
                {['det', 'inv', 'transpose'].map(f => (
                   <button key={f} onClick={() => handleKey(f, KeyType.FUNCTION)} className="bg-[#2a2a2a] p-2 rounded-lg text-xs font-bold border border-gray-700">{f}</button>
                ))}
                <div className="col-span-3 text-[10px] font-bold text-gray-500 uppercase">Complex / Stats</div>
                {['abs', 'arg', 're', 'im', 'mean', 'std', 'var'].map(f => (
                   <button key={f} onClick={() => handleKey(f, KeyType.FUNCTION)} className="bg-[#2a2a2a] p-2 rounded-lg text-xs font-bold border border-gray-700">{f}</button>
                ))}
                <button onClick={() => handleKey('i', KeyType.NUMBER)} className="bg-purple-900/30 p-2 rounded-lg text-xs font-bold border border-purple-800">i (imaginary)</button>
             </div>
             <p className="text-[9px] text-gray-500 italic mt-4">Tip: For matrices, use syntax like [[1,2],[3,4]]</p>
          </div>
        )}

        {activeTab === 'AGE' && (
          <div className="h-full text-white space-y-4">
             <h2 className="text-lg font-black border-b border-gray-800 pb-1 flex items-center gap-2 text-pink-500"><Hourglass size={18}/> {language === 'BN' ? 'বয়স ক্যালকুলেটর' : 'Age Calculator'}</h2>
             <div className="bg-[#252525] p-4 rounded-xl space-y-4 border border-gray-800">
                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase">Birth Date</label>
                      <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full bg-[#111] p-2 rounded-lg text-sm border border-gray-700 outline-none text-white appearance-none" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase">Birth Time</label>
                      <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className="w-full bg-[#111] p-2 rounded-lg text-sm border border-gray-700 outline-none text-white appearance-none" />
                   </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                   {[
                     { label: language === 'BN' ? 'বছর' : 'Years', val: ageBreakdown.years },
                     { label: language === 'BN' ? 'মাস' : 'Months', val: ageBreakdown.months },
                     { label: language === 'BN' ? 'দিন' : 'Days', val: ageBreakdown.days },
                     { label: language === 'BN' ? 'ঘন্টা' : 'Hours', val: ageBreakdown.hours },
                     { label: language === 'BN' ? 'মিনিট' : 'Minutes', val: ageBreakdown.minutes },
                     { label: language === 'BN' ? 'সেকেন্ড' : 'Seconds', val: ageBreakdown.seconds },
                   ].map((item, idx) => (
                      <div key={idx} className="bg-[#1a1a1a] p-3 rounded-lg border border-gray-800 text-center flex flex-col items-center justify-center">
                         <span className="text-2xl font-black text-pink-500 tabular-nums">{item.val}</span>
                         <span className="text-[8px] uppercase text-gray-500 font-bold mt-1">{item.label}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'CONVERT' && (
          <div className="h-full text-white space-y-4">
            <h2 className="text-lg font-black border-b border-gray-800 pb-1 flex items-center gap-2 text-blue-500"><Globe size={18}/> {language === 'BN' ? 'কারেন্সি কনভার্টার' : 'Currency Converter'}</h2>
            <div className="bg-[#252525] p-4 rounded-xl space-y-4 border border-gray-800">
               <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-bold uppercase">Amount</label>
                  <input 
                    type="number" 
                    value={convAmount} 
                    onChange={(e) => setConvAmount(e.target.value)} 
                    className="w-full bg-[#111] p-3 rounded-lg text-lg border border-gray-700 outline-none text-white"
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-[10px] text-gray-500 font-bold uppercase">From</label>
                     <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} className="w-full bg-[#111] p-2 rounded-lg text-sm border border-gray-700 text-white">
                        {currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                     </select>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] text-gray-500 font-bold uppercase">To</label>
                     <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className="w-full bg-[#111] p-2 rounded-lg text-sm border border-gray-700 text-white">
                        {currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                     </select>
                  </div>
               </div>
               <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800 text-center">
                  <span className="text-3xl font-black text-blue-500 tabular-nums">{convResult}</span>
                  <span className="text-[10px] uppercase text-gray-500 font-bold block mt-1">{toCurrency}</span>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'CONST' && (
          <div className="h-full text-white space-y-3">
             <h2 className="text-lg font-black border-b border-gray-800 pb-1 flex items-center gap-2 text-yellow-500"><Zap size={18}/> {language === 'BN' ? 'বৈজ্ঞানিক ধ্রুবক' : 'Scientific Constants'}</h2>
             <div className="space-y-2">
                {SCI_CONSTANTS.map(c => (
                   <button 
                     key={c.symbol} 
                     onClick={() => { handleKey(c.value, KeyType.NUMBER); setActiveTab('CALC'); }}
                     className="w-full bg-[#252525] p-3 rounded-xl border border-gray-800 flex justify-between items-center hover:bg-[#333] transition-colors"
                   >
                      <div className="flex flex-col items-start">
                         <span className="text-blue-400 font-bold">{c.symbol}</span>
                         <span className="text-[10px] text-gray-500">{language === 'BN' ? c.nameBn : c.name}</span>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="text-xs font-mono">{c.value}</span>
                         <span className="text-[8px] text-gray-600 italic">{c.unit}</span>
                      </div>
                   </button>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'SETTINGS' && (
          <div className="h-full text-white space-y-4">
             <h2 className="text-lg font-black border-b border-gray-800 pb-1 flex items-center gap-2"><Settings size={18}/> Settings</h2>
             
             <div className="flex gap-2 mb-2">
                <button onClick={saveSession} className="flex-1 bg-green-900/40 text-green-400 p-2 rounded-lg flex items-center justify-center gap-2 border border-green-800/50 text-[10px] font-bold"><Save size={14}/> SAVE SESSION</button>
                <button onClick={loadSession} className="flex-1 bg-blue-900/40 text-blue-400 p-2 rounded-lg flex items-center justify-center gap-2 border border-blue-800/50 text-[10px] font-bold"><Download size={14}/> LOAD SESSION</button>
             </div>

             <div className="bg-[#252525] rounded-xl overflow-hidden border border-gray-800 text-[10px]">
                <div className="p-4 border-b border-gray-800 bg-[#2a2a2a]/30">
                   <h3 className="text-[10px] font-black uppercase text-purple-400 mb-3 flex items-center gap-2"><Palette size={14}/> Theme Customization</h3>
                   <div className="grid grid-cols-4 gap-2 mb-4">
                      {Object.keys(THEME_PRESETS).map(t => (
                        <button 
                          key={t} 
                          onClick={() => setActiveTheme(t as ThemePreset)}
                          className={`p-2 rounded border text-[8px] font-bold ${activeTheme === t ? 'bg-purple-600 border-purple-400 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                        >
                          {t}
                        </button>
                      ))}
                   </div>
                   
                   {activeTheme === 'CUSTOM' && (
                      <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                         {Object.entries(customTheme).map(([key, value]) => (
                            <div key={key} className="flex flex-col gap-1">
                               <label className="text-[8px] uppercase font-bold text-gray-500 flex items-center gap-1"><Hash size={8}/> {key}</label>
                               <input 
                                 type="color" 
                                 value={value} 
                                 onChange={(e) => setCustomTheme(prev => ({...prev, [key]: e.target.value}))}
                                 className="w-full h-8 bg-transparent cursor-pointer" 
                               />
                            </div>
                         ))}
                      </div>
                   )}
                </div>

                <div className="p-4 flex justify-between items-center border-b border-gray-800">
                   <div className="flex flex-col"><span className="text-sm font-bold">Language</span><span className="text-gray-500 uppercase">{language}</span></div>
                   <button onClick={() => {playClickSound(); setLanguage(l => l === 'EN' ? 'BN' : 'EN');}} className="bg-blue-600 px-4 py-1.5 rounded-lg font-black">TOGGLE</button>
                </div>

                <div className="p-4 space-y-4 border-b border-gray-800">
                   <h3 className="text-[10px] font-black uppercase text-blue-500">Physical Sizes</h3>
                   <div className="flex flex-col gap-2">
                     <span className="text-sm font-bold">Number Button Height ({numBtnHeight}px)</span>
                     <input type="range" min="30" max="60" value={numBtnHeight} onChange={(e) => setNumBtnHeight(parseInt(e.target.value))} className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                   </div>
                </div>

                <div className="p-4 space-y-4 border-b border-gray-800">
                   <h3 className="text-[10px] font-black uppercase text-yellow-500">Inside Font Sizes</h3>
                   <div className="flex flex-col gap-2">
                     <span className="text-sm font-bold">Number Label ({numFontSize}px)</span>
                     <input type="range" min="10" max="32" value={numFontSize} onChange={(e) => setNumFontSize(parseInt(e.target.value))} className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-600" />
                   </div>
                </div>

                <div className="p-4 flex justify-between items-center">
                   <div className="flex flex-col"><span className="text-sm font-bold">Memory Value</span><span className="text-gray-500">M = {memory}</span></div>
                   <button onClick={() => {playClickSound(); setMemory(0);}} className="bg-red-900/30 text-red-500 px-4 py-1.5 rounded-lg font-black uppercase">Clear M</button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'HISTORY' && (
          <div className="h-full text-white space-y-3">
            <h2 className="text-lg font-black border-b border-gray-800 pb-1 flex justify-between items-center">
               {language === 'BN' ? 'ইতিহাস' : 'History'}
               <button onClick={() => { playClickSound(); setHistory([]); localStorage.removeItem('calc_history'); }} className="text-[10px] bg-red-900/30 text-red-500 px-3 py-1 rounded-full"><Trash2 size={12}/></button>
            </h2>
            <div className="space-y-2">
              {history.length === 0 ? <div className="text-center opacity-30 mt-10 text-xs">Empty</div> : history.map(item => (
                <div key={item.id} className="bg-[#252525] p-3 rounded-xl border-l-2 border-blue-600" onClick={() => { playClickSound(); setExpression(item.expression); setActiveTab('CALC'); }}>
                  <div className="text-[10px] text-gray-500 mb-1 font-mono">{item.expression}</div>
                  <div className="text-lg font-black text-white">= {item.result}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-4 bg-[#222] flex justify-center items-center">
        <div className="w-16 h-1 bg-[#111] rounded-full" />
      </div>
    </div>
  );
};

export default App;
