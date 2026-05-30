import React, { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

const TerminalPanel = ({ onTerminalReady }) => {
  const terminalRef = useRef(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize Terminal
    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: "#0f172a", // slate-900 to match project dashboard
        foreground: "#f8fafc", // slate-50
        cursor: "#3b82f6",     // blue-500
      },
      fontSize: 13,
      fontFamily: '"Fira Code", monospace',
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    // Open terminal inside the container div
    term.open(terminalRef.current);
    fitAddon.fit();

    // Call callback to share terminal instance with parent component
    if (onTerminalReady) {
      onTerminalReady(term);
    }

    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch (err) {
        console.error("[TerminalPanel fit error]", err);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      term.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full bg-slate-900 p-2 overflow-hidden relative border-t border-gray-800">
      <div className="absolute top-1 left-2 z-10 text-[10px] font-semibold text-gray-500 tracking-widest uppercase">
        Terminal
      </div>
      <div ref={terminalRef} className="w-full h-full pt-4" />
    </div>
  );
};

export default TerminalPanel;
