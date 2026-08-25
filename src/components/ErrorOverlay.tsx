"use client";

import { useEffect, useState } from "react";

export default function ErrorOverlay() {
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      try {
        const msg = `Error: ${event.message}\nSource: ${event.filename}:${event.lineno}:${event.colno}\nStack: ${event.error?.stack ?? 'n/a'}`;
        setErrorInfo((prev) => (prev ? prev + '\n---\n' + msg : msg));
      } catch (e) {
        setErrorInfo(String(event.message));
      }
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      try {
        const reason = event.reason instanceof Error ? `${event.reason.message}\n${event.reason.stack}` : JSON.stringify(event.reason);
        const msg = `Unhandled Rejection: ${reason}`;
        setErrorInfo((prev) => (prev ? prev + '\n---\n' + msg : msg));
      } catch (e) {
        setErrorInfo(String(event.reason));
      }
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  if (!errorInfo) return null;

  return (
    <div style={{position:'fixed',inset:12,zIndex:9999,display:'flex',justifyContent:'center'}}>
      <div style={{width:'min(1200px,calc(100% - 48px))',background:'#fff',border:'1px solid #f1f1f4',boxShadow:'0 12px 40px rgba(2,6,23,0.08)',borderRadius:8,padding:14,fontFamily:'Inter, Arial, sans-serif'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <strong>Client Error Report</strong>
          <div style={{display:'flex',gap:8}}>
            <button onClick={() => { navigator.clipboard?.writeText(errorInfo); }} style={{padding:'6px 10px',borderRadius:6,border:'1px solid #e6e6ee',background:'#fafafa'}}>Copy</button>
            <button onClick={() => setErrorInfo(null)} style={{padding:'6px 10px',borderRadius:6,border:'1px solid #e6e6ee',background:'#fff'}}>Dismiss</button>
          </div>
        </div>
        <pre style={{whiteSpace:'pre-wrap',maxHeight:'60vh',overflow:'auto',fontSize:12,color:'#111'}}>{errorInfo}</pre>
      </div>
    </div>
  );
}
