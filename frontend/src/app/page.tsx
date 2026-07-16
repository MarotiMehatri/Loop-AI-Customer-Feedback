export default function HomePage() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        fontFamily: "Arial",
      }}
    >
      <h1>🚀 LOOP AI Platform</h1>

      <p>Frontend is running successfully.</p>

      <hr style={{ width: "300px", margin: "20px 0" }} />

      <h2>Technology Stack</h2>

      <ul>
        <li>✅ Next.js 14</li>
        <li>✅ TypeScript</li>
        <li>✅ Tailwind CSS</li>
        <li>✅ Prisma</li>
        <li>✅ PostgreSQL</li>
        <li>✅ Express Backend</li>
      </ul>

      <p style={{ marginTop: "20px" }}>
        Ready to build Admin, Analyst and Viewer dashboards.
      </p>
    </main>
  );
}
