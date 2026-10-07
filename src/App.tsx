import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  Sun, 
  Moon, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink, 
  Layers, 
  Move,
  Sliders,
  FileText,
  Send,
  Zap
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'demo' | 'code' | 'docs'>('demo');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [promptText, setPromptText] = useState<string>('Write a clean TypeScript utility for debouncing high-frequency resize events in React.');
  const [popupText, setPopupText] = useState<string>('');
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [btnPos, setBtnPos] = useState<{ x: number; y: number } | null>(null);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [copiedActionNotice, setCopiedActionNotice] = useState<string | null>(null);
  const [simulatedResponse, setSimulatedResponse] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // References for drag
  const phoneFrameRef = useRef<HTMLDivElement>(null);
  const floatingBtnRef = useRef<HTMLDivElement>(null);
  const popupTextareaRef = useRef<HTMLTextAreaElement>(null);
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0, initialLeft: 0, initialTop: 0 });

  const USERSCRIPT_CODE = `// ==UserScript==
// @name         Google AI Studio 모바일 팝업 입력창
// @namespace    https://aistudio.google.com/
// @version      7.4.4
// @description  복사, 잘라내기, 암전영역 터치시 팝업창 숨기기 기능 탑재 모바일 프롬프트 팝업
// @author       User
// @match        https://aistudio.google.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // 1. CSS 스타일 및 테마 변수 정의
    const style = document.createElement('style');
    style.textContent = \`
        :root {
            --custom-bg: rgba(40, 40, 40, 0.95);
            --custom-modal-bg: #242424;
            --custom-text: #ffffff;
            --custom-text-muted: #888888;
            --custom-border: rgba(255, 255, 255, 0.15);
            --custom-btn-border: rgba(255, 255, 255, 0.2);
            --custom-copy-text: #cccccc;
            --custom-cancel-text: #ff8a8a;
            --custom-cancel-border: rgba(255, 138, 138, 0.3);
            --custom-submit-bg: #999999;
            --custom-submit-text: #ffffff;
            --custom-shadow: rgba(0, 0, 0, 0.6);
            --custom-mid-gray: #888888;
            --custom-icon-idle: #5e5e5e;
            --custom-icon-active: #888888;
        }

        [data-theme="light"] {
            --custom-bg: rgba(255, 255, 255, 0.95);
            --custom-modal-bg: #ffffff;
            --custom-text: #111111;
            --custom-text-muted: #888888;
            --custom-border: rgba(0, 0, 0, 0.15);
            --custom-btn-border: rgba(0, 0, 0, 0.2);
            --custom-copy-text: #555555;
            --custom-cancel-text: #e53935;
            --custom-cancel-border: rgba(229, 57, 53, 0.3);
            --custom-submit-bg: #eeeeee;
            --custom-submit-text: #111111;
            --custom-shadow: rgba(0, 0, 0, 0.2);
            --custom-mid-gray: #767676;
            --custom-icon-idle: #a5a5a5;
            --custom-icon-active: #767676;
        }

        #custom-floating-btn {
            position: fixed;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px; 
            height: 40px;
            border-radius: 8px; 
            border: 1px solid var(--custom-btn-border);
            background: var(--custom-bg); 
            backdrop-filter: blur(4px);
            color: var(--custom-mid-gray);
            cursor: grab;
            z-index: 999998 !important;
            box-shadow: 0 4px 12px var(--custom-shadow);
            touch-action: none;
            transition: transform 0.1s, background 0.3s, color 0.3s;
        }
        #custom-floating-btn:active {
            cursor: grabbing;
            transform: scale(0.95);
        }

        #custom-aistudio-modal {
            display: none;
            position: fixed;
            background: var(--custom-modal-bg); 
            border-radius: 12px;
            padding: 12px;
            box-sizing: border-box;
            flex-direction: column;
            gap: 0;
            box-shadow: 0 4px 25px var(--custom-shadow);
            border: 1px solid var(--custom-border);
            font-family: 'Pretendard', -apple-system, sans-serif;
            z-index: 999999 !important;
            transition: background 0.3s;
        }

        .custom-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--custom-border);
        }
        .custom-modal-header-left,
        .custom-modal-header-right {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .custom-modal-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 5px;
            cursor: pointer;
            width: 24px;
            height: 24px;
            padding: 0;
            border: none;
            background: transparent !important;
            color: var(--custom-icon-idle);
            transition: color 0.15s, transform 0.1s;
        }
        .custom-modal-btn:hover {
            color: var(--custom-icon-active);
        }
        .custom-modal-btn:active {
            color: var(--custom-icon-active);
            transform: scale(0.92);
        }

        #custom-modal-textarea {
            width: 100%;
            background: transparent;
            border: none;
            color: var(--custom-text);
            font-size: 16px;
            line-height: 1.5;
            padding: 8px 4px;
            outline: none;
            resize: none;
            box-sizing: border-box;
            white-space: pre-wrap;
            word-break: break-all;
            transition: color 0.3s;
        }
        #custom-modal-textarea::placeholder { color: var(--custom-text-muted); }
    \`;
    document.head.appendChild(style);

    // 2. DOM 객체 직접 생성 (플로팅 버튼 & 팝업 모달)
    // ...
})();`;

  // Auto-resize popup textarea on input
  useEffect(() => {
    if (popupTextareaRef.current) {
      popupTextareaRef.current.style.height = 'auto';
      const scrollHeight = popupTextareaRef.current.scrollHeight;
      const maxHeight = 24 * 10 + 16; // 10 lines
      if (scrollHeight > maxHeight) {
        popupTextareaRef.current.style.height = `${maxHeight}px`;
        popupTextareaRef.current.style.overflowY = 'auto';
      } else {
        popupTextareaRef.current.style.height = `${scrollHeight}px`;
        popupTextareaRef.current.style.overflowY = 'hidden';
      }
    }
  }, [popupText, isPopupOpen]);

  // Handle open modal
  const handleOpenPopup = () => {
    setPopupText(promptText);
    setIsPopupOpen(true);
    setTimeout(() => {
      if (popupTextareaRef.current) {
        popupTextareaRef.current.focus();
        popupTextareaRef.current.setSelectionRange(popupText.length, popupText.length);
      }
    }, 50);
  };

  const handleCopyPopup = async () => {
    if (!popupText) return;
    await navigator.clipboard.writeText(popupText);
    showNotice('Text copied to clipboard!');
    if (popupTextareaRef.current) popupTextareaRef.current.focus();
  };

  const handleCutPopup = async () => {
    if (!popupText) return;
    const textToCopy = popupText;
    setPopupText('');
    await navigator.clipboard.writeText(textToCopy);
    showNotice('Text cut to clipboard!');
    if (popupTextareaRef.current) popupTextareaRef.current.focus();
  };

  const handleClearPopup = () => {
    setPopupText('');
    showNotice('Text cleared');
    if (popupTextareaRef.current) popupTextareaRef.current.focus();
  };

  const handleSubmitPopup = () => {
    setPromptText(popupText);
    setIsPopupOpen(false);
    showNotice('Prompt transferred to main editor!');
  };

  const showNotice = (msg: string) => {
    setCopiedActionNotice(msg);
    setTimeout(() => {
      setCopiedActionNotice(null);
    }, 2200);
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(USERSCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleDownloadUserscript = () => {
    const blob = new Blob([USERSCRIPT_CODE], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'google-ai-studio-popup.user.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSimulateRun = () => {
    if (!promptText.trim()) return;
    setIsSimulating(true);
    setSimulatedResponse(null);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulatedResponse(
        `### Result for Prompt:\n\n\`\`\`typescript\nimport { useEffect, useRef, useCallback } from 'react';\n\nexport function useDebounceCallback<T extends (...args: any[]) => void>(\n  callback: T,\n  delay: number\n): T {\n  const timeoutRef = useRef<NodeJS.Timeout | null>(null);\n\n  return useCallback((...args: Parameters<T>) => {\n    if (timeoutRef.current) clearTimeout(timeoutRef.current);\n    timeoutRef.current = setTimeout(() => callback(...args), delay);\n  }, [callback, delay]) as T;\n}\n\`\`\`\n*Generated in simulation mode*`
      );
    }, 1200);
  };

  // Drag logic inside playground container
  const onStartDrag = (e: React.MouseEvent | React.TouchEvent) => {
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const currentLeft = floatingBtnRef.current?.offsetLeft || 20;
    const currentTop = floatingBtnRef.current?.offsetTop || 20;

    dragStartPosRef.current = {
      x: clientX,
      y: clientY,
      initialLeft: currentLeft,
      initialTop: currentTop,
    };
  };

  useEffect(() => {
    const onMoveDrag = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current || !phoneFrameRef.current || !floatingBtnRef.current) return;
      const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
      const dx = clientX - dragStartPosRef.current.x;
      const dy = clientY - dragStartPosRef.current.y;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        hasMovedRef.current = true;
      }

      if (hasMovedRef.current) {
        const frameRect = phoneFrameRef.current.getBoundingClientRect();
        const btnW = floatingBtnRef.current.offsetWidth || 40;
        const btnH = floatingBtnRef.current.offsetHeight || 40;

        let newLeft = dragStartPosRef.current.initialLeft + dx;
        let newTop = dragStartPosRef.current.initialTop + dy;

        newLeft = Math.max(8, Math.min(newLeft, frameRect.width - btnW - 8));
        newTop = Math.max(8, Math.min(newTop, frameRect.height - btnH - 8));

        setBtnPos({ x: newLeft, y: newTop });
      }
    };

    const onEndDrag = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      if (!hasMovedRef.current) {
        handleOpenPopup();
      }
    };

    window.addEventListener('mousemove', onMoveDrag);
    window.addEventListener('mouseup', onEndDrag);
    window.addEventListener('touchmove', onMoveDrag);
    window.addEventListener('touchend', onEndDrag);

    return () => {
      window.removeEventListener('mousemove', onMoveDrag);
      window.removeEventListener('mouseup', onEndDrag);
      window.removeEventListener('touchmove', onMoveDrag);
      window.removeEventListener('touchend', onEndDrag);
    };
  }, [promptText]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-800 bg-zinc-900/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-semibold">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2"/>
                <path d="M3 9h18"/>
                <path d="m9 16 3-3 3 3"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold tracking-tight text-white">AI Studio Textbox</h1>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  v7.4.4
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">Google AI Studio Mobile Floating Popup Textbox</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="flex items-center bg-zinc-800/80 p-1 rounded-lg border border-zinc-700/60 text-xs font-medium">
              <button
                onClick={() => setActiveTab('demo')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'demo'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Interactive Simulator
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'code'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Userscript
              </button>
              <button
                onClick={() => setActiveTab('docs')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'docs'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Features & Docs
              </button>
            </nav>

            <a
              href="/popup-textbox.user.js"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-medium transition"
              title="Direct install for Tampermonkey / Violentmonkey"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Direct Install
            </a>
          </div>
        </div>
      </header>

      {/* Floating Action Notice */}
      {copiedActionNotice && (
        <div className="fixed top-20 right-6 z-[99999] bg-zinc-800 text-zinc-100 border border-zinc-700 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          {copiedActionNotice}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {activeTab === 'demo' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
            {/* Left Control & Info Panel */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    <h2 className="font-semibold text-sm text-zinc-100">Simulator Settings</h2>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">Live Sync</span>
                </div>

                {/* Device Viewport Toggle */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Device Viewport</label>
                  <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                    <button
                      onClick={() => setDeviceMode('mobile')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition ${
                        deviceMode === 'mobile' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      Mobile
                    </button>
                    <button
                      onClick={() => setDeviceMode('tablet')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition ${
                        deviceMode === 'tablet' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Tablet className="w-3.5 h-3.5" />
                      Tablet
                    </button>
                    <button
                      onClick={() => setDeviceMode('desktop')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition ${
                        deviceMode === 'desktop' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      Desktop
                    </button>
                  </div>
                </div>

                {/* Theme Mode Toggle */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">AI Studio Theme</label>
                  <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition ${
                        theme === 'dark' ? 'bg-zinc-800 text-zinc-100 shadow' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-blue-400" />
                      Dark Mode
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition ${
                        theme === 'light' ? 'bg-zinc-200 text-zinc-900 font-semibold shadow' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      Light Mode
                    </button>
                  </div>
                </div>

                {/* Preset Prompt Buttons */}
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Sample Prompts</label>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => {
                        const t = 'Write a comprehensive guide to building responsive LLM chat interfaces with Tailwind CSS and React 19.';
                        setPromptText(t);
                        setPopupText(t);
                      }}
                      className="w-full text-left text-xs px-3 py-2 rounded-lg bg-zinc-950/60 hover:bg-zinc-800/80 border border-zinc-800/70 text-zinc-300 transition truncate"
                    >
                      💡 Responsive LLM Chat Interface
                    </button>
                    <button
                      onClick={() => {
                        const t = 'Analyze this SQL query and optimize the index usage for 10M+ rows:\nSELECT users.id, count(orders.id) FROM users LEFT JOIN orders ON users.id = orders.user_id GROUP BY users.id HAVING count(orders.id) > 5;';
                        setPromptText(t);
                        setPopupText(t);
                      }}
                      className="w-full text-left text-xs px-3 py-2 rounded-lg bg-zinc-950/60 hover:bg-zinc-800/80 border border-zinc-800/70 text-zinc-300 transition truncate"
                    >
                      ⚡ SQL Query Optimization
                    </button>
                    <button
                      onClick={() => {
                        const t = 'System Instructions:\nYou are an expert developer with mastery over TypeScript, Web APIs, and UI ergonomics. Keep code concise and bug-free.';
                        setPromptText(t);
                        setPopupText(t);
                      }}
                      className="w-full text-left text-xs px-3 py-2 rounded-lg bg-zinc-950/60 hover:bg-zinc-800/80 border border-zinc-800/70 text-zinc-300 transition truncate"
                    >
                      🎯 System Instructions Preset
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Action Guide */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 text-xs text-zinc-400 space-y-2">
                <div className="flex items-center gap-1.5 text-zinc-200 font-semibold text-xs">
                  <Move className="w-3.5 h-3.5 text-blue-400" />
                  How to test the widget:
                </div>
                <ul className="list-disc list-inside space-y-1 text-zinc-400 leading-relaxed">
                  <li><span className="text-zinc-200 font-medium">Click</span> the floating launcher icon inside the simulated window to open the full popup.</li>
                  <li><span className="text-zinc-200 font-medium">Drag</span> the floating launcher icon anywhere inside the simulator to position it.</li>
                  <li>Use the top toolbar buttons inside the popup to <span className="text-zinc-200">Copy</span>, <span className="text-zinc-200">Cut</span>, <span className="text-zinc-200">Clear</span>, <span className="text-zinc-200">Hide</span>, or <span className="text-zinc-200">Submit (Export)</span> back into the main input!</li>
                </ul>
              </div>
            </div>

            {/* Right Simulator Workspace */}
            <div className="lg:col-span-8 flex flex-col items-center">
              {/* Device Frame */}
              <div
                className={`transition-all duration-300 w-full relative ${
                  deviceMode === 'mobile'
                    ? 'max-w-sm'
                    : deviceMode === 'tablet'
                    ? 'max-w-2xl'
                    : 'max-w-full'
                }`}
              >
                {/* Simulated AI Studio Browser Window */}
                <div
                  ref={phoneFrameRef}
                  data-theme={theme}
                  className={`rounded-3xl border shadow-2xl overflow-hidden relative flex flex-col transition-colors duration-300 ${
                    theme === 'dark'
                      ? 'bg-[#18181b] border-zinc-800 text-zinc-100'
                      : 'bg-white border-zinc-300 text-zinc-900'
                  }`}
                  style={{ minHeight: '580px', height: '640px' }}
                >
                  {/* Mock AI Studio Header */}
                  <div
                    className={`h-12 border-b flex items-center justify-between px-4 text-xs select-none transition-colors ${
                      theme === 'dark'
                        ? 'bg-[#202023] border-zinc-800/80 text-zinc-300'
                        : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      <span className="font-semibold ml-2 text-xs flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        Google AI Studio
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-zinc-500/10 text-[11px] font-mono">
                        gemini-2.5-flash
                      </span>
                      <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-1 rounded hover:bg-zinc-500/20 text-zinc-400"
                        title="Toggle theme in simulator"
                      >
                        {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Mock Studio Content / Chat Area */}
                  <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-4">
                    {/* Welcome Banner */}
                    <div
                      className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                        theme === 'dark'
                          ? 'bg-[#232326] border-zinc-800 text-zinc-300'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                      }`}
                    >
                      <div className="font-semibold text-zinc-200 dark:text-zinc-100 mb-1 flex items-center gap-1.5">
                        <span>💬 Prompt Workspace</span>
                      </div>
                      This is a real-time mock of the Google AI Studio mobile layout with prompt container synchronization (`.prompt-box-container` and `textarea[formcontrolname="promptText"]`).
                    </div>

                    {/* Chat History / Responses */}
                    {simulatedResponse && (
                      <div
                        className={`p-4 rounded-2xl border text-xs leading-relaxed animate-in fade-in slide-in-from-bottom-2 ${
                          theme === 'dark'
                            ? 'bg-blue-950/20 border-blue-900/40 text-blue-200'
                            : 'bg-blue-50 border-blue-200 text-blue-900'
                        }`}
                      >
                        <div className="font-semibold mb-2 flex items-center gap-1 text-blue-400">
                          <Sparkles className="w-3.5 h-3.5" />
                          Model Response
                        </div>
                        <pre className="p-2.5 rounded-lg bg-black/40 text-[11px] font-mono overflow-x-auto text-zinc-200 whitespace-pre-wrap">
                          {simulatedResponse}
                        </pre>
                      </div>
                    )}

                    {isSimulating && (
                      <div className="flex items-center gap-2 text-xs text-blue-400 p-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                        Generating response with Gemini...
                      </div>
                    )}
                  </div>

                  {/* Main AI Studio Prompt Container (Target for Userscript) */}
                  <div
                    className={`p-3 border-t transition-colors ${
                      theme === 'dark' ? 'border-zinc-800 bg-[#202023]' : 'border-zinc-200 bg-zinc-50'
                    }`}
                  >
                    <div className="prompt-box-container relative flex flex-col gap-2">
                      <div className="relative">
                        <textarea
                          {...{ formcontrolname: "promptText" }}
                          aria-label="Enter a prompt"
                          rows={2}
                          value={promptText}
                          onChange={(e) => setPromptText(e.target.value)}
                          placeholder="Enter a prompt here..."
                          className={`w-full text-xs p-2.5 rounded-xl border outline-none resize-none transition-colors ${
                            theme === 'dark'
                              ? 'bg-[#18181b] border-zinc-700/80 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500'
                              : 'bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500'
                          }`}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {promptText.length} chars • ~{Math.ceil(promptText.length / 4)} tokens
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleOpenPopup}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-700/60 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1.5 transition"
                            title="Open Mobile Floating Popup"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="18" x="3" y="3" rx="2"/>
                              <path d="M3 9h18"/>
                              <path d="m9 16 3-3 3 3"/>
                            </svg>
                            Open Popup
                          </button>

                          <button
                            onClick={handleSimulateRun}
                            disabled={isSimulating || !promptText.trim()}
                            className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white flex items-center gap-1 transition shadow-sm"
                          >
                            <Send className="w-3 h-3" />
                            Run
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================
                      INJECTED USERSCRIPT COMPONENTS (Simulated inside the Viewport)
                      ======================================================== */}

                  {/* Floating Draggable Button */}
                  <div
                    ref={floatingBtnRef}
                    id="custom-floating-btn"
                    data-theme={theme}
                    onMouseDown={onStartDrag}
                    onTouchStart={onStartDrag}
                    style={{
                      position: 'absolute',
                      left: btnPos ? `${btnPos.x}px` : 'auto',
                      top: btnPos ? `${btnPos.y}px` : 'auto',
                      right: btnPos ? 'auto' : '16px',
                      bottom: btnPos ? 'auto' : '88px',
                      zIndex: 99998,
                    }}
                    title="Drag to move, click to open popup"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M3 9h18" />
                      <path d="m9 16 3-3 3 3" />
                    </svg>
                  </div>

                  {/* Popup Modal Window */}
                  {isPopupOpen && (
                    <div
                      id="custom-aistudio-modal"
                      data-theme={theme}
                      style={{
                        display: 'flex',
                        position: 'absolute',
                        left: '12px',
                        right: '12px',
                        bottom: '12px',
                        zIndex: 99999,
                      }}
                      className="shadow-2xl border rounded-2xl animate-in zoom-in-95 duration-150"
                    >
                      {/* Top Action Toolbar */}
                      <div className="custom-modal-header">
                        {/* Left Action Buttons: Copy, Cut, Clear */}
                        <div className="custom-modal-header-left">
                          {/* Copy Button */}
                          <button
                            type="button"
                            className="custom-modal-btn"
                            onClick={handleCopyPopup}
                            onMouseDown={(e) => e.preventDefault()}
                            onPointerDown={(e) => e.preventDefault()}
                            title="전체 복사 (Copy all)"
                          >
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                            </svg>
                          </button>

                          {/* Cut Button */}
                          <button
                            type="button"
                            className="custom-modal-btn"
                            onClick={handleCutPopup}
                            onMouseDown={(e) => e.preventDefault()}
                            onPointerDown={(e) => e.preventDefault()}
                            title="전체 잘라내기 (Cut all)"
                          >
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="6" cy="6" r="3" />
                              <path d="M8.12 8.12 12 12" />
                              <path d="M20 4 8.12 15.88" />
                              <circle cx="6" cy="18" r="3" />
                              <path d="M14.8 14.8 20 20" />
                            </svg>
                          </button>

                          {/* Clear Button */}
                          <button
                            type="button"
                            className="custom-modal-btn"
                            onClick={handleClearPopup}
                            onMouseDown={(e) => e.preventDefault()}
                            onPointerDown={(e) => e.preventDefault()}
                            title="전체 지우기 (Clear all)"
                          >
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m16 22-1-4" />
                              <path d="M19 14a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2h-3a1 1 0 0 1-1-1V4a2 2 0 0 0-4 0v5a1 1 0 0 1-1 1H6a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1" />
                              <path d="M19 14H5l-1.973 6.767A1 1 0 0 0 4 22h16a1 1 0 0 0 .973-1.233z" />
                              <path d="m8 22 1-4" />
                            </svg>
                          </button>
                        </div>

                        {/* Right Action Buttons: Hide, Submit */}
                        <div className="custom-modal-header-right">
                          {/* Hide Button */}
                          <button
                            type="button"
                            className="custom-modal-btn"
                            onClick={() => setIsPopupOpen(false)}
                            title="팝업 숨기기 (Hide modal)"
                          >
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="18" x="3" y="3" rx="2" />
                              <path d="M3 15h18" />
                              <path d="m15 8-3 3-3-3" />
                            </svg>
                          </button>

                          {/* Submit / Export Button */}
                          <button
                            type="button"
                            className="custom-modal-btn"
                            onClick={handleSubmitPopup}
                            title="내보내기 (Submit & sync to main prompt)"
                          >
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                              <path d="m21 3-9 9" />
                              <path d="M15 3h6v6" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Modal Textarea */}
                      <textarea
                        ref={popupTextareaRef}
                        id="custom-modal-textarea"
                        value={popupText}
                        onChange={(e) => setPopupText(e.target.value)}
                        placeholder="여기에 프롬프트를 입력하세요..."
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-4 max-w-4xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
              <div>
                <h2 className="text-base font-semibold text-zinc-100">Tampermonkey / Violentmonkey Userscript</h2>
                <p className="text-xs text-zinc-400">Install directly into your browser or copy raw script contents</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium flex items-center gap-2 transition"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedScript ? 'Copied to Clipboard!' : 'Copy Script'}
                </button>
                <button
                  onClick={handleDownloadUserscript}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-2 transition shadow-lg shadow-blue-600/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .user.js
                </button>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-zinc-900/80 px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>popup-textbox.user.js</span>
                <span>v7.4.4 • JavaScript</span>
              </div>
              <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed max-h-[540px]">
                <code>{USERSCRIPT_CODE}</code>
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="max-w-4xl mx-auto w-full space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Google AI Studio Mobile Popup Features
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Designed to solve mobile typing, cursor navigation, and text manipulation limitations on Google AI Studio.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                  <div className="font-semibold text-xs text-zinc-200 flex items-center gap-2">
                    <Move className="w-4 h-4 text-blue-400" />
                    Floating Draggable Launcher
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    A non-intrusive 40×40px floating button that can be dragged anywhere on screen and retains its coordinate position in `localStorage` across page reloads.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                  <div className="font-semibold text-xs text-zinc-200 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Mobile Keyboard Stability
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Uses `pointerdown` and `mousedown` preventDefault to stop virtual keyboards from dismissing when tapping action buttons (Copy, Cut, Clear).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                  <div className="font-semibold text-xs text-zinc-200 flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    Adaptive Theme Detection
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Automatically computes background luminance to switch between dark and light styles seamlessly matching AI Studio's theme settings.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                  <div className="font-semibold text-xs text-zinc-200 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    Direct Angular DOM Sync
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Uses `HTMLTextAreaElement.prototype.value` descriptor setter and dispatches synthetic input/change events to ensure Angular FormControls detect modifications accurately.
                  </p>
                </div>
              </div>

              {/* Step by step installation */}
              <div className="border-t border-zinc-800 pt-6 space-y-3">
                <h3 className="text-sm font-semibold text-zinc-200">How to Install in Browser:</h3>
                <ol className="list-decimal list-inside space-y-2 text-xs text-zinc-400 leading-relaxed">
                  <li>Install a userscript manager such as <strong>Violentmonkey</strong> or <strong>Tampermonkey</strong> in Chrome, Safari, or Kiwi Browser on mobile.</li>
                  <li>Click <strong>Direct Install</strong> or copy the raw script and create a new userscript.</li>
                  <li>Navigate to <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">https://aistudio.google.com/</code> and start prompting with the popup toolbar!</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-900/40 py-4 px-6 text-center text-xs text-zinc-500">
        Google AI Studio Mobile Popup Textbox • Imported & Migrated for AI Studio
      </footer>
    </div>
  );
}
