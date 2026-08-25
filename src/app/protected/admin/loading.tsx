export default function AdminLoading() {
  return (
    <main
      aria-label="Loading analytics"
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#fbfbfd',
        color: '#5b2cf0',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 800 }}>LOOP</div>
        <p style={{ color: '#667085', fontSize: 14 }}>Loading analytics…</p>
      </div>
    </main>
  );
}
