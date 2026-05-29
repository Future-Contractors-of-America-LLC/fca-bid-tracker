export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <div style={{display: 'flex'}}>
          <aside style={{width: '220px', background: '#111', color: '#fff', padding: '20px'}}>
            <h2>FCA</h2>
            <p>Platform</p>
            <p>Academy</p>
            <p>Operations</p>
            <p>Auricrux</p>
          </aside>

          <main style={{flex: 1, padding: '20px'}}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
