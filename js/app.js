// ===== React App (Fixed settings button, Pump/Dump shows % instead of raw price) =====
const { useEffect, useState } = React;

function nowTime() {
  const d = new Date();
  return d.toLocaleTimeString();
}

// Utils
function fmt(n, d = 2) {
  if (n == null || Number.isNaN(+n)) return '—';
  return Number(n).toFixed(d);
}
function getColorClass(value) {
  if (value > 0) return 'text-green-400';
  if (value < 0) return 'text-red-400';
  return 'text-gray-300';
}

// Tooltip
function InfoTooltip({ text }) {
  let goldColor = '#ffd700';
  let panelBg = '#0a0a0a';
  try {
    goldColor = getComputedStyle(document.documentElement).getPropertyValue('--gold') || goldColor;
    panelBg = getComputedStyle(document.documentElement).getPropertyValue('--panel') || panelBg;
  } catch(e){}
  
  return (
    <span 
      className="relative group cursor-pointer text-gray-400 ml-1" 
      style={{ display: 'inline-block', lineHeight: '1', verticalAlign: 'middle', color: goldColor }}
      title=""
    >
      <span className="text-xs font-bold">ⓘ</span>
      <div 
        className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 p-2 w-72 rounded-sm text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 shadow-lg"
        style={{ 
          whiteSpace: 'normal', 
          backgroundColor: panelBg,
          color: goldColor,
          border: `1px solid ${goldColor}`,
          boxShadow: `0 0 8px rgba(255, 215, 0, 0.7)`,
        }}
      >
        {text}
      </div>
    </span>
  );
}

function App(){
  const [running, setRunning] = useState(false);

  // Modules
  const [activeModules, setActiveModules] = useState({
    divergence: true, pumpdump: true, flow: false, bos: false, disbalance: false, smartpump: true
  });
  const [moduleTfs, setModuleTfs] = useState({
    divergence: '15m', pumpdump: '5m', flow: '5m', bos: '5m', disbalance: '5m', smartpump: '5m'
  });

  const [minVol, setMinVol] = useState(50);
  const [useBinance, setUseBinance] = useState(true);
  const [useBybit, setUseBybit] = useState(true);
  const [status, setStatus] = useState('Готово.');
  const [signals, setSignals] = useState([]);
  const [history, setHistory] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [cooldownSec, setCooldownSec] = useState(1800);

  // Pump/Dump
  const [pumpMinOIPct, setPumpMinOIPct] = useState(0.05);
  const [pumpMinCVDUsd, setPumpMinCVDUsd] = useState(500000);
  const [pumpPreset, setPumpPreset] = useState('mid');
  const [pumpCustom, setPumpCustom] = useState({});

  // Divergence
  const [divPreset, setDivPreset] = useState('mid');
  const [divRsiPeriod, setDivRsiPeriod] = useState(9);
  const [divRsiDiffMin, setDivRsiDiffMin] = useState(4);
  const [divCustom, setDivCustom] = useState({});

  // Flow
  
  // SmartPump settings
  const [spPreset, setSpPreset] = useState('mid');
  const [spMinOIPct, setSpMinOIPct] = useState(0.02);
  const [spMinPricePct, setSpMinPricePct] = useState(0.02);
  const [spCustom, setSpCustom] = useState({});

  const [flowPreset, setFlowPreset] = useState('mid');
  const [flowOIPct, setFlowOIPct] = useState(0.05);
  const [flowCVDUsd, setFlowCVDUsd] = useState(500000);
  const [flowCustom, setFlowCustom] = useState({});

  // Disbalance
  const [disbalancePreset, setDisbalancePreset] = useState('mid');
  const [disbalanceOIPct, setDisbalanceOIPct] = useState(0.10);
  const [disbalanceCVDUsd, setDisbalanceCVDUsd] = useState(1000000);
  const [disbalanceCustom, setDisbalanceCustom] = useState({});

  // BOS
  const [bosPreset, setBosPreset] = useState('mid');
  const [bosPeriod, setBosPeriod] = useState(5);
  const [bosVolumeMult, setBosVolumeMult] = useState(2.0);
  const [bosCustom, setBosCustom] = useState({});


  // Load
  useEffect(()=>{
    try{
      const s = JSON.parse(localStorage.getItem('komar_neon_div')||'{}');
      if (s.activeModules) setActiveModules(s.activeModules);
      if (s.moduleTfs) setModuleTfs(s.moduleTfs);
      if (s.minVol!=null) setMinVol(s.minVol);
      if (typeof s.useBinance==='boolean') setUseBinance(s.useBinance);
      if (typeof s.useBybit==='boolean') setUseBybit(s.useBybit);
      if (typeof s.soundOn==='boolean') setSoundOn(s.soundOn);
      if (s.cooldownSec!=null) setCooldownSec(s.cooldownSec);

      if (s.pumpPreset) setPumpPreset(s.pumpPreset);
      if (s.pumpMinOIPct!=null) setPumpMinOIPct(s.pumpMinOIPct);
      if (s.pumpMinCVDUsd!=null) setPumpMinCVDUsd(s.pumpMinCVDUsd);
      if (s.pumpCustom) setPumpCustom(s.pumpCustom);

      if (s.divPreset) setDivPreset(s.divPreset);
      if (s.divRsiPeriod!=null) setDivRsiPeriod(s.divRsiPeriod);
      if (s.divRsiDiffMin!=null) setDivRsiDiffMin(s.divRsiDiffMin);
      if (s.divCustom) setDivCustom(s.divCustom);

      if (s.flowPreset) setFlowPreset(s.flowPreset);
      if (s.flowOIPct!=null) setFlowOIPct(s.flowOIPct);
      if (s.flowCVDUsd!=null) setFlowCVDUsd(s.flowCVDUsd);
      if (s.flowCustom) setFlowCustom(s.flowCustom);

      if (s.disbalancePreset) setDisbalancePreset(s.disbalancePreset);
      if (s.disbalanceOIPct!=null) setDisbalanceOIPct(s.disbalanceOIPct);
      if (s.disbalanceCVDUsd!=null) setDisbalanceCVDUsd(s.disbalanceCVDUsd);
      if (s.disbalanceCustom) setDisbalanceCustom(s.disbalanceCustom);

      if (s.bosPreset) setBosPreset(s.bosPreset);
      if (s.bosPeriod!=null) setBosPeriod(s.bosPeriod);
      if (s.bosVolumeMult!=null) setBosVolumeMult(s.bosVolumeMult);
      if (s.bosCustom) setBosCustom(s.bosCustom);
    }catch{}
  },[]);

  // Save
  useEffect(()=>{
    const s = {
      moduleTfs, minVol, useBinance, useBybit, activeModules, soundOn, cooldownSec,
      pumpMinOIPct, pumpMinCVDUsd, pumpPreset, pumpCustom, 
      divPreset, divRsiPeriod, divRsiDiffMin, divCustom,
      flowPreset, flowOIPct, flowCVDUsd, flowCustom,
      disbalancePreset, disbalanceOIPct, disbalanceCVDUsd, disbalanceCustom,
      bosPreset, bosPeriod, bosVolumeMult, bosCustom
    };
    localStorage.setItem('komar_neon_div', JSON.stringify(s));
  },[
    moduleTfs, minVol, useBinance, useBybit, activeModules, soundOn, cooldownSec,
    pumpMinOIPct, pumpMinCVDUsd, pumpPreset, pumpCustom, 
    divPreset, divRsiPeriod, divRsiDiffMin, divCustom,
    flowPreset, flowOIPct, flowCVDUsd, flowCustom,
    disbalancePreset, disbalanceOIPct, disbalanceCVDUsd, disbalanceCustom,
    bosPreset, bosPeriod, bosVolumeMult, bosCustom
  ]);

  // Custom helpers
  const saveCustomSettings = (moduleKey) => {
    if (moduleKey === 'pump') {
      setPumpCustom({ pumpMinOIPct, pumpMinCVDUsd }); 
    } else if (moduleKey === 'div') {
      setDivCustom({ divRsiPeriod, divRsiDiffMin }); 
    } else if (moduleKey === 'flow') {
      setFlowCustom({ flowOIPct, flowCVDUsd });
    } else if (moduleKey === 'disbalance') {
      setDisbalanceCustom({ disbalanceOIPct, disbalanceCVDUsd });
    } else if (moduleKey === 'bos') {
      setBosCustom({ bosPeriod, bosVolumeMult });
    }
  };
  const loadCustomSettings = (moduleKey) => {
    let custom;
    if (moduleKey === 'pump') {
      custom = pumpCustom;
      if(custom.pumpMinOIPct!=null) setPumpMinOIPct(custom.pumpMinOIPct);
      if(custom.pumpMinCVDUsd!=null) setPumpMinCVDUsd(custom.pumpMinCVDUsd);
    } else if (moduleKey === 'div') {
      custom = divCustom;
      if(custom.divRsiPeriod!=null) setDivRsiPeriod(custom.divRsiPeriod);
      if(custom.divRsiDiffMin!=null) setDivRsiDiffMin(custom.divRsiDiffMin);
    } else if (moduleKey === 'flow') {
      custom = flowCustom;
      if(custom.flowOIPct!=null) setFlowOIPct(custom.flowOIPct);
      if(custom.flowCVDUsd!=null) setFlowCVDUsd(custom.flowCVDUsd);
    } else if (moduleKey === 'disbalance') {
      custom = disbalanceCustom;
      if(custom.disbalanceOIPct!=null) setDisbalanceOIPct(custom.disbalanceOIPct);
      if(custom.disbalanceCVDUsd!=null) setDisbalanceCVDUsd(custom.disbalanceCVDUsd);
    } else if (moduleKey === 'bos') {
      custom = bosCustom;
      if(custom.bosPeriod!=null) setBosPeriod(custom.bosPeriod);
      if(custom.bosVolumeMult!=null) setBosVolumeMult(custom.bosVolumeMult);
    }
  };

  // Presets
  function applyPumpPreset(name){
    if (pumpPreset === name) return;
    if (pumpPreset === 'custom') saveCustomSettings('pump');
    setPumpPreset(name);

    if (name === 'custom') {
      loadCustomSettings('pump');
    } else {
      if(name==='early'){
        setPumpMinOIPct(0.02);
        setPumpMinCVDUsd(150000);
      } else if(name==='mid'){
        setPumpMinOIPct(0.05);
        setPumpMinCVDUsd(500000);
      } else if(name==='strong'){
        setPumpMinOIPct(0.10);
        setPumpMinCVDUsd(1000000);
      }
    }
    setStatus(`✅ Пресет пампов/дампов: ${name}`);
  }
  function applyDivPreset(name){
    if (divPreset === name) return;
    if (divPreset === 'custom') saveCustomSettings('div');
    setDivPreset(name);

    if (name === 'custom') {
      loadCustomSettings('div');
    } else {
      if(name==='early'){
        setDivRsiPeriod(9); setDivRsiDiffMin(3); 
      } else if(name==='mid'){
        setDivRsiPeriod(9); setDivRsiDiffMin(4); 
      } else if(name==='strong'){
        setDivRsiPeriod(14); setDivRsiDiffMin(6); 
      }
    }
    setStatus(`✅ Пресет диверов: ${name}`);
  }
  function applyFlowPreset(name){
    if (flowPreset === name) return;
    if (flowPreset === 'custom') saveCustomSettings('flow');
    setFlowPreset(name);

    if (name === 'custom') {
      loadCustomSettings('flow');
    } else {
      if(name==='early'){
        setFlowOIPct(0.01); setFlowCVDUsd(100000);
      } else if(name==='mid'){
        setFlowOIPct(0.05); setFlowCVDUsd(500000);
      } else if(name==='strong'){
        setFlowOIPct(0.15); setFlowCVDUsd(1500000);
      }
    }
    setStatus(`✅ Пресет Flow/Поток: ${name}`);
  }
  function applyDisbalancePreset(name){
    if (disbalancePreset === name) return;
    if (disbalancePreset === 'custom') saveCustomSettings('disbalance');
    setDisbalancePreset(name);

    if (name === 'custom') {
      loadCustomSettings('disbalance');
    } else {
      if(name==='early'){
        setDisbalanceOIPct(0.05); setDisbalanceCVDUsd(200000);
      } else if(name==='mid'){
        setDisbalanceOIPct(0.10); setDisbalanceCVDUsd(500000);
      } else if(name==='strong'){
        setDisbalanceOIPct(0.25); setDisbalanceCVDUsd(1500000);
      }
    }
    setStatus(`✅ Пресет Дисбаланс: ${name}`);
  }
  function applyBosPreset(name){
    if (bosPreset === name) return;
    if (bosPreset === 'custom') saveCustomSettings('bos');
    setBosPreset(name);

    if (name === 'custom') {
      loadCustomSettings('bos');
    } else {
      if(name==='early'){
        setBosPeriod(3); setBosVolumeMult(1.5);
      } else if(name==='mid'){
        setBosPeriod(5); setBosVolumeMult(2.0);
      } else if(name==='strong'){
        setBosPeriod(10); setBosVolumeMult(3.0);
      }
    }
    setStatus(`✅ Пресет BOS: ${name}`);
  }

  // UI helpers
  const toggleModule = (moduleName) => {
    setActiveModules(prev => ({ ...prev, [moduleName]: !prev[moduleName] }));
  };
  const setModuleTf = (moduleName, newTf) => {
    setModuleTfs(prev => ({ ...prev, [moduleName]: newTf }));
  };
  const isAnyModuleActive = Object.values(activeModules).some(Boolean);

  // Callbacks
  const onSignal = (sig)=>{
    setSignals(prev=>[sig, ...prev].slice(0,400));
    setHistory(prev=>[sig, ...prev].slice(0,50));
  };
  const onStatus = (msg)=> setStatus(`${nowTime()} — ${msg}`);

  // Start/Stop
  const handleStart = ()=>{
    if (!isAnyModuleActive) {
      setStatus(`⛔️ Ошибка: Выберите хотя бы один модуль.`);
      return;
    }
    if (pumpPreset === 'custom') saveCustomSettings('pump');
    if (divPreset === 'custom') saveCustomSettings('div');
    if (flowPreset === 'custom') saveCustomSettings('flow');
    if (disbalancePreset === 'custom') saveCustomSettings('disbalance');
    if (bosPreset === 'custom') saveCustomSettings('bos');

    // Flow, Disbalance, BOS 
    Settings.sensitivity.smartpump = { minOIPct: Number(spMinOIPct)||0.02, minPricePct: Number(spMinPricePct)||0.02, spPreset };
    Settings.sensitivity.flow = {
      minOIPct: Number(flowOIPct)||0.05,
      minCVDUsd: Number(flowCVDUsd)||500000,
      flowPreset
    };
    Settings.sensitivity.disbalance = {
      minOIPct: Number(disbalanceOIPct)||0.10,
      minCVDUsd: Number(disbalanceCVDUsd)||1000000,
      disbalancePreset
    };
    Settings.sensitivity.bos = {
      bosPeriod: Number(bosPeriod)||5,
      bosVolumeMult: Number(bosVolumeMult)||2.0,
      bosPreset
    };

    // Pump/Dump
    Settings.sensitivity.volumeMult = 2.8; 
    Settings.sensitivity.volumePeriod = 20; 
    Settings.sensitivity.bodyMinPerc = 0.35;
    Settings.sensitivity.pumpMinOIPct = Number(pumpMinOIPct)||0.05;
    Settings.sensitivity.pumpMinCVDUsd = Number(pumpMinCVDUsd)||500000;

    // Global
    Settings.activeModules = activeModules;
    Settings.moduleTimeframes = moduleTfs;
    Settings.minVolumeM = Number(minVol)||50;
    Settings.exchanges = { binance: useBinance, bybit: useBybit };
    Settings.sensitivity = {
      ...Settings.sensitivity,
      div: {
        rsiPeriod: Number(divRsiPeriod)||9,
        rsiDiffMin: Number(divRsiDiffMin)||4,
      },
      sound: !!soundOn,
      cooldownSec: Number(cooldownSec)||1800,
      pumpMinOIPct: Settings.sensitivity.pumpMinOIPct,
      pumpMinCVDUsd: Settings.sensitivity.pumpMinCVDUsd,
    };

    if (typeof toggleSound === 'function') toggleSound(Settings.sensitivity.sound);
    setSignals([]);
    setShowSettings(false);
    startLoop({ onSignal, onStatus });
    setRunning(true);
  };
  const handleStop = ()=>{
    stopLoop({ onStatus });
    setRunning(false);
  };

  const timeframeOptions = ['5m', '15m', '1h', '4h'];
  const renderTfSelector = (moduleKey, label) => (
    <div className="md:col-span-1">
      <div className="th mb-1">{label}</div>
      <div className="flex gap-2 flex-wrap">
        {timeframeOptions.map(t => (
          <span key={t}
                className={`chip ${moduleTfs[moduleKey]===t?'active':''}`}
                onClick={()=>setModuleTf(moduleKey, t)}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );

  const renderPresetChips = (currentPreset, setPresetFn, presets) => (
    <div className="flex gap-2 flex-wrap mb-3">
      {presets.map(({ name, label, color }) => (
        <span key={name}
              className={`chip ${currentPreset===name?'active':''}`}
              style={currentPreset===name && name!=='custom' ? {borderColor: color, boxShadow: `0 0 5px ${color}`} : {}}
              onClick={()=>setPresetFn(name)}>
          {label}
        </span>
      ))}
      <span key="custom"
            className={`chip ${currentPreset==='custom'?'active':''}`}
            style={currentPreset==='custom' ? {borderColor: 'gray', boxShadow: `0 0 5px gray`} : {}}
            onClick={()=>setPresetFn('custom')}>
        ⚙️ Свои настройки
      </span>
    </div>
  );

  const pumpPresets = [
    { name: 'early', label: '🟢 Ранний', color: '#00ff41' },
    { name: 'mid', label: '🟠 Средний', color: '#ffd700' },
    { name: 'strong', label: '🔴 Сильный', color: '#ff5555' }
  ];
  const divPresets = [
    { name: 'early', label: '🟢 Ранний дивер', color: '#00ff41' },
    { name: 'mid', label: '🟠 Средний дивер', color: '#ffd700' },
    { name: 'strong', label: '🔴 Настоящий дивер', color: '#ff5555' }
  ];
  const flowPresets = [
    { name: 'early', label: '💧 Лёгкий', color: '#87cefa' },
    { name: 'mid', label: '🌊 Средний', color: '#ffd700' },
    { name: 'strong', label: '🚨 Сильный', color: '#ff5555' }
  ];
  const disbalancePresets = [
    { name: 'early', label: '💡 Лёгкий', color: '#87cefa' },
    { name: 'mid', label: '⚖️ Средний', color: '#ffd700' },
    { name: 'strong', label: '💥 Сильный', color: '#ff5555' }
  ];
  
  const spPresets = [
    { name: 'early', label: '🟢 Ранний', color: '#00ff41' },
    { name: 'mid', label: '🟠 Средний', color: '#ffd700' },
    { name: 'strong', label: '🔴 Сильный', color: '#ff5555' }
  ];

  function applySpPreset(name){
    if (spPreset === name) return;
    if (spPreset === 'custom') setSpCustom({ spMinOIPct, spMinPricePct });
    setSpPreset(name);

    if(name === 'custom'){
      if(spCustom.spMinOIPct!=null) setSpMinOIPct(spCustom.spMinOIPct);
      if(spCustom.spMinPricePct!=null) setSpMinPricePct(spCustom.spMinPricePct);
    } else {
      if(name==='early'){ setSpMinOIPct(0.01); setSpMinPricePct(0.01); }
      if(name==='mid'){ setSpMinOIPct(0.02); setSpMinPricePct(0.02); }
      if(name==='strong'){ setSpMinOIPct(0.05); setSpMinPricePct(0.05); }
    }
    setStatus(`✅ Пресет SmartPump: ${name}`);
  }

  const bosPresets = [
    { name: 'early', label: '🔪 Чувствительный (3 св.)', color: '#87cefa' },
    { name: 'mid', label: '📈 Стандарт (5 св.)', color: '#ffd700' },
    { name: 'strong', label: '🏰 Строгий (10 св.)', color: '#ff5555' }
  ];

  return (
    <div className="space-y-4">
      {/* Top controls */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {!running ? (
            <button className="btn" onClick={handleStart} disabled={!isAnyModuleActive}>▶ Старт</button>
          ) : (
            <button className="btn" onClick={handleStop}>⏹ Стоп</button>
          )}
          <button id="btn-settings" className="btn" onClick={()=>setShowSettings(s=>!s)}>
            ⚙️ Настройки
          </button>
          <div className="text-sm link-muted">{status}</div>
        </div>
      </div>

      {showSettings && (
        <div className="card p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Active modes */}
            <div className="col-span-2">
              <div className="th mb-2">Активные режимы анализа</div>
              <div className="flex gap-2 flex-wrap">
                <span className={`chip ${activeModules.divergence ? 'active' : ''}`} onClick={() => toggleModule('divergence')}>📈 Дивергенции</span>
                <span className={`chip ${activeModules.pumpdump ? 'active' : ''}`} onClick={() => toggleModule('pumpdump')}>🚀 Пампы/Дампы</span>
                <span className={`chip ${activeModules.smartpump ? 'active' : ''}`} onClick={() => toggleModule('smartpump')}>⚡ SmartPump</span>
                <span className={`chip ${activeModules.flow ? 'active' : ''}`} onClick={() => toggleModule('flow')}>🌊 Flow/Поток</span>
                <span className={`chip ${activeModules.disbalance ? 'active' : ''}`} onClick={() => toggleModule('disbalance')}>⚖️ Дисбаланс CVD/OI</span>
                <span className={`chip ${activeModules.bos ? 'active' : ''}`} onClick={() => toggleModule('bos')}>💥 BOS/Пробой Структуры</span>
              </div>
              {!isAnyModuleActive && (<p className="text-red-500 mt-2 font-bold">⚠️ Выберите хотя бы один модуль для сканирования.</p>)}
            </div>

            <div className="h-px bg-[#1b1f2a] col-span-2" />

            {/* Timeframes */}
            <div className="col-span-2">
              <div className="th mb-2">Таймфреймы по модулям (ТФ)</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderTfSelector('divergence', 'ТФ: Дивергенции')}
                {renderTfSelector('pumpdump', 'ТФ: Пампы/Дампы')}
                {renderTfSelector('smartpump', 'ТФ: SmartPump')}
                {renderTfSelector('flow', 'ТФ: Flow/Поток')}
                {renderTfSelector('disbalance', 'ТФ: Дисбаланс')}
                {renderTfSelector('bos', 'ТФ: BOS')}
              </div>
            </div>

            <div className="h-px bg-[#1b1f2a] col-span-2" />

            {/* Volume and exchanges */}
            <div className="md:col-span-1">
              <div className="th mb-1">
                Мин. объём (24ч), млн USDT
                <InfoTooltip text="Минимальный объем торгов за последние 24 часа в млн USDT." />
              </div>
              <input type="number" min="1" className="w-full bg-[#0E1115] border border-[#1b1f2a] rounded-lg px-3 py-2"
                     value={minVol} onChange={e=>setMinVol(e.target.value)} />
            </div>
            <div className="col-span-2">
              <div className="th mb-1">Биржи</div>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={useBinance} onChange={e=>setUseBinance(e.target.checked)} /> Binance
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={useBybit} onChange={e=>setUseBybit(e.target.checked)} /> Bybit
                </label>
              </div>
            </div>

          </div>

          <div className="h-px bg-[#1b1f2a]" />

          {/* PUMP/DUMP */}
          <div>
            <div className="th mb-2">Пресет для пампов/дампов (OI + CVD)</div>
            {renderPresetChips(pumpPreset, applyPumpPreset, pumpPresets)}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="th mb-1">
                  Мин. OI % (абс. знач.)
                  <InfoTooltip text="Минимальное изменение Open Interest (в %), требуемое для сигнала." />
                </div>
                <input type="number" step="0.01" min="0.00" 
                      className="w-full bg-[#0E1115] border border-[#1b1f2a] rounded-lg px-3 py-2"
                      value={pumpMinOIPct} 
                      onChange={e=>{setPumpMinOIPct(e.target.value); setPumpPreset('custom');}} />
              </div>

              <div>
                <div className="th mb-1">
                  Мин. CVD (USD)
                  <InfoTooltip text="Минимальная кумулятивная дельта объёма в USD." />
                </div>
                <input type="number" step="10000" min="0" 
                      className="w-full bg-[#0E1115] border border-[#1b1f2a] rounded-lg px-3 py-2"
                      value={pumpMinCVDUsd} 
                      onChange={e=>{setPumpMinCVDUsd(e.target.value); setPumpPreset('custom');}} />
              </div>
              
              <div className="md:col-span-1">
                <div className="th mb-1">
                  Антиспам (сек)
                </div>
                <input type="number" step="60" min="0"
                  className="w-full bg-[#0E1115] border border-[#1b1f2a] rounded-lg px-3 py-2"
                  value={cooldownSec}
                  onChange={e=>setCooldownSec(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-4 md:col-span-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox"
                    checked={soundOn}
                    onChange={e=>{
                      setSoundOn(e.target.checked);
                      if (typeof toggleSound === 'function') toggleSound(e.target.checked);
                    }}
                  />
                  Звук
                </label>
              </div>
            </div>
          </div>

          
          <div className="h-px bg-[#1b1f2a]" />

          {/* SMARTPUMP */}
          <div>
            <div className="th mb-2">Пресет для SmartPump (OI + Δ%)</div>
            {renderPresetChips(spPreset, applySpPreset, spPresets)}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="th mb-1">Мин. OI %</div>
                <input type="number" step="0.01" min="0.00"
                  className="w-full bg-[#0E1115] border border-[#1b1f2a] rounded-lg px-3 py-2"
                  value={spMinOIPct}
                  onChange={e=>{ setSpMinOIPct(e.target.value); setSpPreset('custom'); }}
                />
              </div>
              <div>
                <div className="th mb-1">Мин. Δ% цены</div>
                <input type="number" step="0.01" min="0.00"
                  className="w-full bg-[#0E1115] border border-[#1b1f2a] rounded-lg px-3 py-2"
                  value={spMinPricePct}
                  onChange={e=>{ setSpMinPricePct(e.target.value); setSpPreset('custom'); }}
                />
              </div>
            </div>
          </div>
{/* FLOW */}
          <div>
            <div className="th mb-2">Пресет для Flow/Поток (OI + CVD)</div>
            {renderPresetChips(flowPreset, applyFlowPreset, flowPresets)}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="th mb-1">
                  Мин. OI % (абс. знач.)
                </div>
                <input type="number" step="0.01" min="0.00" className="w-full bg-[#0E1115] border border-[#1b1f2a] rounded-lg px-3 py-2"
                       value={flowOIPct} onChange={e=>{setFlowOIPct(e.target.value); setFlowPreset('custom');}} />
              </div>
              <div>
                <div className="th mb-1">
                  Мин. CVD (USD)
                </div>
                <input type="number" step="10000" min="0" className="w-full bg-[#0E1115] border border-[#1b1f2a] rounded-lg px-3 py-2"
                       value={flowCVDUsd} onChange={e=>{setFlowCVDUsd(e.target.value); setFlowPreset('custom');}} />
              </div>
            </div>
          </div>

          <div className="h-px bg-[#1b1f2a]" />

          {/* DISBALANCE */}
          <div>
            <div className="th mb-2">Пресет для Дисбаланса (OI + CVD)</div>
            {renderPresetChips(disbalancePreset, applyDisbalancePreset, disbalancePresets)}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="th mb-1">
                  Мин. OI % (абс. знач.)
                </div>
                <input type="number" step="0.01" min="0.00" className="w-full bg-[#0E1115] border border-[#1b1f2a] rounded-lg px-3 py-2"
                       value={disbalanceOIPct} onChange={e=>{setDisbalanceOIPct(e.target.value); setDisbalancePreset('custom');}} />
              </div>
              <div>
                <div className="th mb-1">
                  Мин. CVD (USD)
                </div>
                <input type="number" step="10000" min="0" className="w-full bg-[#0E1115] border border-[#1b1f2a] rounded-lg px-3 py-2"
                       value={disbalanceCVDUsd} onChange={e=>{setDisbalanceCVDUsd(e.target.value); setDisbalancePreset('custom');}} />
              </div>
            </div>
          </div>

          <div className="h-px bg-[#1b1f2a]" />

          {/* BOS */}
          <div>
            <div className="th mb-2">Пресет для BOS (Пробой Структуры)</div>
            {renderPresetChips(bosPreset, applyBosPreset, bosPresets)}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="th mb-1">
                  Период (кол-во свечей)
                </div>
                <input type="number" step="1" min="2" className="w-full bg-[#0E1115] border border-[#1b1f2a] rounded-lg px-3 py-2"
                       value={bosPeriod} onChange={e=>{setBosPeriod(e.target.value); setBosPreset('custom');}} />
              </div>
              <div>
                <div className="th mb-1">
                  × Объёма (к SMA20)
                </div>
                <input type="number" step="0.1" min="1.0" className="w-full bg-[#0E1115] border border-[#1b1f2a] rounded-lg px-3 py-2"
                       value={bosVolumeMult} onChange={e=>{setBosVolumeMult(e.target.value); setBosPreset('custom');}} />
              </div>
            </div>
          </div>

          <div className="h-px bg-[#1b1f2a]" />

          {/* DIVERGENCE */}
          <div>
            <div className="th mb-2">Пресет для диверов</div>
            {renderPresetChips(divPreset, applyDivPreset, divPresets)}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="th mb-1">
                  RSI период
                </div>
                <input type="number" min="5" max="21" className="w-full bg-[#0E1115] border border-[#1b1f2a] rounded-lg px-3 py-2"
                       value={divRsiPeriod} onChange={e=>{setDivRsiPeriod(e.target.value); setDivPreset('custom');}} />
              </div>
              <div>
                <div className="th mb-1">
                  Миним. разница RSI
                </div>
                <input type="number" step="1" min="1" className="w-full bg-[#0E1115] border border-[#1b1f2a] rounded-lg px-3 py-2"
                       value={divRsiDiffMin} onChange={e=>{setDivRsiDiffMin(e.target.value); setDivPreset('custom');}} />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Signals + History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="th mb-2">Текущие сигналы</div>
          <div className="space-y-2">
            {signals.length===0 && <div className="text-gray-400">Пока нет сигналов.</div>}
            {signals.map((s, idx)=>{
              const isDiv = s.reason?.startsWith?.('Дивергенция');
              const isPumpDump = (s.kind?.startsWith?.('PUMP') || s.kind?.startsWith?.('DUMP') || s.reason?.startsWith?.('Smart Pump')) ?? false;
              
              const volStr = s.detail?.volMult!=null && isDiv ? `Vol×${fmt(s.detail.volMult,2)}` : ''; 
              const rsiStr = s.detail?.rNow!=null ? `RSI: ${fmt(s.detail.rNow,0)}` : ''; 
              
              const oiVal  = s.detail?.oi  ?? s.detail?.oiPct  ?? null;
              const cvdVal = s.detail?.cvd ?? s.detail?.cvdUsd ?? null;
              const priceChangePct = s.detail?.priceChangePct ?? null; 

              const oiElement = oiVal!=null ? (
                <span className={getColorClass(oiVal)}>
                  OI: {oiVal > 0 ? '+' : ''}{fmt(oiVal, 2)}%
                </span>
              ) : null;
              
              const cvdElement = cvdVal!=null ? (
                <span className={getColorClass(cvdVal)}>
                  CVD: {cvdVal > 0 ? '+' : ''}{fmt(cvdVal / 1_000_000, 2)}M
                </span>
              ) : null;
              
              const priceChangeElement = priceChangePct!=null ? ( 
                  <span className={getColorClass(priceChangePct)}>
                      Δ: {priceChangePct > 0 ? '↗ ' : '↘ '}{fmt(Math.abs(priceChangePct), 2)}%
                  </span>
              ) : null;

              // if Pump/Dump or SmartPump, show only Δ% (no raw price). For others, show price.
              const showRawPrice = !isPumpDump;
              const tfStr = s.detail?.signalTf || 'N/A';
              const sideEmoji = s.side==='Лонг' ? '🟢' : '🔴';
              const reasonDisplay = <span className="font-semibold text-blue-400" style={{textShadow: '0 0 5px rgba(0, 191, 255, 0.5)'}}>{s.kind || s.reason}</span>;
              
              const metricElements = isDiv ? [
                rsiStr, volStr, oiElement, cvdElement
              ].filter(Boolean) : [
                oiElement, cvdElement, priceChangeElement 
              ].filter(Boolean);

              return (
                <div key={idx} className="flex flex-col gap-1 bg-[#0E1115] border border-[#1b1f2a] rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${s.side==='Лонг'?'text-green-400':'text-red-400'}`}>{sideEmoji} {s.side}</span>
                      <span className="font-semibold">{s.symbol}</span>
                      <span className="text-xs text-gray-400">({s.exchange}, {tfStr})</span>
                    </div>
                    <span className={`score ${s.detail?.scoreClass||'s2'}`}>{isDiv?'DIV':'Сила'}</span> 
                  </div>

                  <div className="text-sm">
                    {reasonDisplay}
                  </div>

                  <div className="text-sm text-gray-300 kv">
                    {metricElements.map((el, i) => (
                      <React.Fragment key={i}>
                        {el}
                        {i < metricElements.length - 1 && <span className="separator"> | </span>}
                      </React.Fragment>
                    ))}

                    {showRawPrice && (
                      <>
                        <span className="separator"> | </span> 
                        <span className="text-gray-400 font-semibold">Цена:</span>
                        <span className="neon-price"> {fmt(s.price, 6)}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-4">
          <div className="th mb-2">История (последние 50)</div>
          <div className="space-y-1 max-h-[420px] overflow-auto">
            {history.length===0 && <div className="text-gray-400">Пока нет истории.</div>}
            {history.map((s, idx)=>{
              const sideEmoji = s.side==='Лонг' ? '🟢' : '🔴';
              const tfStr = s.detail?.signalTf || 'N/A';
              return (
                <div key={idx} className="flex items-center justify-between px-2 py-1 rounded bg-[#0E1115] border border-[#1b1f2a]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{new Date(s.ts||Date.now()).toLocaleTimeString()}</span>
                    <span>{sideEmoji}</span>
                    <span className="font-semibold">{s.symbol}</span>
                    <span className="text-xs text-gray-400">({s.exchange}, {tfStr})</span>
                  </div>
                  <div className="text-xs text-gray-300">
                    { (s.detail?.priceChangePct!=null) ? `Δ: ${fmt(Math.abs(s.detail.priceChangePct),2)}%` : `Цена: ${fmt(s.price,6)}` }
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<App/>, document.getElementById('root'));
