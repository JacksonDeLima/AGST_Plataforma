import React from 'react';
import { Link } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial', color:'#0f172a' }}>
      <header style={{ background:'#0b1220', color:'#fff', padding:12 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h2 style={{ margin:0, fontSize:18 }}>AGST Plataforma</h2>
          <nav>
            <Link to="/" style={{ color:'#cbd5e1', marginRight:12, textDecoration:'none' }}>Home</Link>
            <Link to="/equipamentos" style={{ color:'#cbd5e1', marginRight:12, textDecoration:'none' }}>Equipamentos</Link>
            <Link to="/equipamentos/cadastrar" style={{ color:'#cbd5e1', textDecoration:'none' }}>Cadastrar</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth:1100, margin:'18px auto', padding:12 }}>
        {children}
      </main>

      <footer style={{ textAlign:'center', padding:12, color:'#64748b' }}>
        © {new Date().getFullYear()} AGST Plataforma
      </footer>
    </div>
  );
}
