// import React, { useState } from 'react';
// import NavBar from '../../components/NavBar';
// import './Dashboard.css';

// const Dashboard = () => {
//   const [ambientes, setAmbientes] = useState([
//     { id: 1, nome: 'Escritório Gerência', tipo: 'Sala', temperatura: 22, potencia: 10.5, status: 'online' },
//     { id: 2, nome: 'Sala de Reuniões A', tipo: 'Sala', temperatura: 23, potencia: 9.5, status: 'online' },
//     { id: 3, nome: 'Sala de Reuniões B', tipo: 'Sala', temperatura: 27, potencia: 0, status: 'offline' },
//     { id: 4, nome: 'Escritório A', tipo: 'Sala', temperatura: 26, potencia: 0, status: 'offline' },
//     { id: 5, nome: 'Escritório B', tipo: 'Sala', temperatura: 26, potencia: 0, status: 'offline' },
//     { id: 6, nome: 'Sala 1', tipo: 'Sala', temperatura: 26, potencia: 0, status: 'offline' },
//     { id: 7, nome: 'Sala 2', tipo: 'Sala', temperatura: 26, potencia: 0, status: 'offline' },
//   ]);

//   const [showModal, setShowModal] = useState(false);
//   const [novoAmbiente, setNovoAmbiente] = useState({
//     nome: '',
//     idDispositivo: '',
//     equipamentos: []
//   });

//   const [equipamentosDisponiveis] = useState([
//     { id: 1, nome: 'Samsung 1' },
//     { id: 2, nome: 'Samsung 2' },
//     { id: 3, nome: 'Samsung 3' },
//     { id: 4, nome: 'Samsung 4' },
//     { id: 5, nome: 'Samsung 5' },
//     { id: 6, nome: 'Samsung 6' },
//     { id: 7, nome: 'Samsung 7' }
//   ]);

//   const handleAdicionarAmbiente = () => {
//     setShowModal(true);
//   };

//   const handleFecharModal = () => {
//     setShowModal(false);
//     setNovoAmbiente({ nome: '', idDispositivo: '', equipamentos: [] });
//   };

//   const handleCriarAmbiente = () => {
//     if (novoAmbiente.nome && novoAmbiente.idDispositivo) {
//       const ambiente = {
//         id: ambientes.length + 1,
//         nome: novoAmbiente.nome,
//         tipo: 'Sala',
//         temperatura: 25,
//         potencia: 0,
//         status: 'offline'
//       };
//       setAmbientes([...ambientes, ambiente]);
//       handleFecharModal();
//     }
//   };

//   const toggleEquipamento = (equipamentoId) => {
//     setNovoAmbiente(prev => {
//       const equipamentos = prev.equipamentos.includes(equipamentoId)
//         ? prev.equipamentos.filter(id => id !== equipamentoId)
//         : [...prev.equipamentos, equipamentoId];
//       return { ...prev, equipamentos };
//     });
//   };

//   return (
//     <div className="app">
//       <NavBar />

//       <main className="main-content">

//         {/* Header */}
//         <header className="header">
//           <div className="header-actions">
//             <button className="btn-secondary">+ Criar Grupo</button>
//             <button className="btn-primary" onClick={handleAdicionarAmbiente}>
//               + Adicionar Ambiente
//             </button>
//           </div>
//         </header>

//         {/* Stats */}
//         <div className="stats-grid">
//           <div className="stat-card">
//             <p className="stat-label">Equipamentos Ativos</p>
//             <div className="stat-value-row">
//               <span className="stat-icon">📦</span>
//               <span className="stat-value">6/8</span>
//             </div>
//           </div>

//           <div className="stat-card">
//             <p className="stat-label">Temperatura Média</p>
//             <div className="stat-value-row">
//               <span className="stat-icon">🌡️</span>
//               <span className="stat-value">23°C</span>
//             </div>
//           </div>

//           <div className="stat-card">
//             <p className="stat-label">Consumo Atual</p>
//             <div className="stat-value-row">
//               <span className="stat-icon">⚡</span>
//               <span className="stat-value">20.1 kW</span>
//             </div>
//           </div>

//           <div className="stat-card">
//             <p className="stat-label">Gasto Acumulado Hoje</p>
//             <div className="stat-value-row">
//               <span className="stat-icon">💰</span>
//               <span className="stat-value">153 kWh | R$ 86,40</span>
//             </div>
//           </div>
//         </div>

//         {/* Breadcrumb */}
//         <div className="breadcrumb">
//           <span>Ambientes</span>
//           <span className="separator">/</span>
//           <span className="current">Filial 12</span>
//         </div>

//         {/* Ambientes Grid */}
//         <div className="ambientes-grid">
//           {ambientes.map((ambiente) => (
//             <div key={ambiente.id} className="ambiente-card">
//               <div className="ambiente-header">
//                 <h3 className="ambiente-nome">{ambiente.nome}</h3>
//                 <button className="ambiente-menu">⚙️</button>
//               </div>
//               <p className="ambiente-tipo">{ambiente.tipo}</p>

//               <div className="ambiente-info">
//                 <div className="info-row">
//                   <span className="info-label">Temperatura atual</span>
//                   <span className="info-value temperatura">{ambiente.temperatura}°C</span>
//                 </div>
//                 <div className="info-row">
//                   <span className="info-label">Potência</span>
//                   <span className="info-value">{ambiente.potencia} kW</span>
//                 </div>
//               </div>

//               <button className="btn-controlar">Controlar 🔧</button>
//             </div>
//           ))}
//         </div>

//         {/* Modal */}
//         {showModal && (
//           <div className="modal-overlay" onClick={handleFecharModal}>
//             <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//               <div className="modal-header">
//                 <h2 className="modal-title">Novo Ambiente</h2>
//                 <button className="modal-close" onClick={handleFecharModal}>✕</button>
//               </div>

//               <div className="modal-body">
//                 <div className="form-group">
//                   <label>Nome do Equipamento</label>
//                   <input
//                     type="text"
//                     placeholder="Ex: Sala de Reuniões"
//                     value={novoAmbiente.nome}
//                     onChange={(e) => setNovoAmbiente({...novoAmbiente, nome: e.target.value})}
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label>ID do Dispositivo</label>
//                   <input
//                     type="text"
//                     placeholder="ID do Dispositivo"
//                     value={novoAmbiente.idDispositivo}
//                     onChange={(e) => setNovoAmbiente({...novoAmbiente, idDispositivo: e.target.value})}
//                   />
//                 </div>

//                 <div className="form-group">
//                   <div className="equipamentos-header">
//                     <label>Equipamentos do Ambiente</label>
//                   </div>

//                   <div className="equipamentos-list">
//                     {equipamentosDisponiveis.map((equipamento) => (
//                       <label key={equipamento.id} className="equipamento-checkbox">
//                         <input
//                           type="checkbox"
//                           checked={novoAmbiente.equipamentos.includes(equipamento.id)}
//                           onChange={() => toggleEquipamento(equipamento.id)}
//                         />
//                         <span className="equipamento-nome">{equipamento.nome}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               <div className="modal-footer">
//                 <button className="btn-criar" onClick={handleCriarAmbiente}>Criar</button>
//               </div>
//             </div>
//           </div>
//         )}

//       </main>
//     </div>
//   );
// };

// export default Dashboard;
import React, { useState } from 'react';
import NavBar from '../../components/NavBar';
import './Dashboard.css';

const Dashboard = () => {
  const [ambientes, setAmbientes] = useState([
    {
      id: 1,
      nome: 'Escritório Gerência',
      tipo: 'Sala',
      temperatura: 22,
      potencia: 10.5,
      status: 'online'
    },
    {
      id: 2,
      nome: 'Sala de Reuniões A',
      tipo: 'Sala',
      temperatura: 23,
      potencia: 9.5,
      status: 'online'
    },
    {
      id: 3,
      nome: 'Sala de Reuniões B',
      tipo: 'Sala',
      temperatura: 27,
      potencia: 0,
      status: 'offline'
    },
    {
      id: 4,
      nome: 'Escritório A',
      tipo: 'Sala',
      temperatura: 26,
      potencia: 0,
      status: 'offline'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showEquipamentosSelector, setShowEquipamentosSelector] = useState(false);
  const [novoAmbiente, setNovoAmbiente] = useState({
    nome: '',
    idDispositivo: '',
    equipamentos: []
  });

  const [equipamentosDisponiveis] = useState([
    { id: 1, nome: 'Samsung 1', selecionado: false },
    { id: 2, nome: 'Samsung 2', selecionado: false },
    { id: 3, nome: 'Samsung 3', selecionado: false },
    { id: 4, nome: 'Samsung 4', selecionado: false },
    { id: 5, nome: 'Samsung 5', selecionado: false },
    { id: 6, nome: 'Samsung 6', selecionado: false },
    { id: 7, nome: 'Samsung 7', selecionado: false }
  ]);

  const handleAdicionarAmbiente = () => {
    setShowModal(true);
  };

  const handleFecharModal = () => {
    setShowModal(false);
    setShowEquipamentosSelector(false);
    setNovoAmbiente({ nome: '', idDispositivo: '', equipamentos: [] });
  };

  const handleClonarAmbiente = () => {
    if (novoAmbiente.nome && novoAmbiente.idDispositivo) {
      const ambiente = {
        id: ambientes.length + 1,
        nome: novoAmbiente.nome,
        tipo: 'Sala',
        temperatura: 25,
        potencia: 0,
        status: 'offline'
      };
      setAmbientes([...ambientes, ambiente]);
      handleFecharModal();
    }
  };

  const toggleEquipamento = (equipamentoId) => {
    setNovoAmbiente(prev => {
      const equipamentos = prev.equipamentos.includes(equipamentoId)
        ? prev.equipamentos.filter(id => id !== equipamentoId)
        : [...prev.equipamentos, equipamentoId];
      return { ...prev, equipamentos };
    });
  };

  const handleControlar = (ambiente) => {
    alert(`Abrindo controle do ambiente: ${ambiente.nome}`);
    // Aqui você pode abrir um modal de controle ou navegar para outra página
  };

  const handleEditarAmbiente = (ambiente) => {
    alert(`Editando ambiente: ${ambiente.nome}`);
    // Aqui você pode abrir um modal de edição
  };

  return (
    <div className="app">
      {/* <NavBar /> */}
    <main className="main-content">
      {/* Header */}
      <header className="header">
        <div className="header-actions">
          <button className="btn-secondary">
            + Criar Grupo
          </button>
          <button className="btn-primary" onClick={handleAdicionarAmbiente}>
            + Adicionar Ambiente
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Equipamentos Ativos</p>
          <div className="stat-value-row">
            <span className="stat-icon">📦</span>
            <span className="stat-value">6/8</span>
          </div>
        </div>
        
        <div className="stat-card">
          <p className="stat-label">Temperatura Média</p>
          <div className="stat-value-row">
            <span className="stat-icon">🌡️</span>
            <span className="stat-value">23°C</span>
          </div>
        </div>
        
        <div className="stat-card">
          <p className="stat-label">Consumo Atual</p>
          <div className="stat-value-row">
            <span className="stat-icon">⚡</span>
            <span className="stat-value">20.1 kW</span>
          </div>
        </div>
        
        <div className="stat-card">
          <p className="stat-label">Gasto Acumulado Hoje</p>
          <div className="stat-value-row">
            <span className="stat-icon">💰</span>
            <span className="stat-value">153 kWh | R$ 86,40</span>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span>Ambientes</span>
        <span className="separator">/</span>
        <span className="current">Filial 12</span>
      </div>

      {/* Ambientes Grid */}
      <div className="ambientes-grid">
        {ambientes.map((ambiente) => (
          <div key={ambiente.id} className="ambiente-card">
            <div className="ambiente-header">
              <h3 className="ambiente-nome">{ambiente.nome}</h3>
              <button 
                className="ambiente-menu"
                onClick={() => handleEditarAmbiente(ambiente)}
              >
                ⚙️
              </button>
            </div>
            <p className="ambiente-tipo">{ambiente.tipo}</p>
            
            <div className="ambiente-info">
              <div className="info-row">
                <span className="info-label">Temperatura atual</span>
                <span className="info-value temperatura">{ambiente.temperatura}°C</span>
              </div>
              <div className="info-row">
                <span className="info-label">Potência</span>
                <span className="info-value">{ambiente.potencia} kW</span>
              </div>
            </div>

            <button 
              className="btn-controlar"
              onClick={() => handleControlar(ambiente)}
            >
              Controlar 🔧
            </button>
          </div>
        ))}
      </div>

      {/* Modal Novo Ambiente */}
      {showModal && (
        <div className="modal-overlay" onClick={handleFecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Novo Ambiente</h2>
              <button className="modal-close" onClick={handleFecharModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Nome do Equipamento</label>
                <input
                  type="text"
                  placeholder="Nome do Equipamento"
                  value={novoAmbiente.nome}
                  onChange={(e) => setNovoAmbiente({...novoAmbiente, nome: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>ID do Dispositivo</label>
                <input
                  type="text"
                  placeholder="ID do Dispositivo"
                  value={novoAmbiente.idDispositivo}
                  onChange={(e) => setNovoAmbiente({...novoAmbiente, idDispositivo: e.target.value})}
                />
              </div>

              <div className="form-group">
                <div className="equipamentos-header">
                  <label>Equipamentos do Ambiente</label>
                  <button 
                    className="btn-adicionar-equipamento"
                    onClick={() => setShowEquipamentosSelector(!showEquipamentosSelector)}
                  >
                    + Adicionar Equipamento
                  </button>
                </div>

                <div className="select-wrapper">
                  <select className="select-equipamentos">
                    <option value="">Escolher</option>
                  </select>
                </div>

                {/* Selector de Equipamentos */}
                {showEquipamentosSelector && (
                  <div className="equipamentos-selector">
                    {equipamentosDisponiveis.map((equipamento) => (
                      <label key={equipamento.id} className="equipamento-checkbox">
                        <input
                          type="checkbox"
                          checked={novoAmbiente.equipamentos.includes(equipamento.id)}
                          onChange={() => toggleEquipamento(equipamento.id)}
                        />
                        <span className="equipamento-nome">{equipamento.nome}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-clonar" onClick={handleClonarAmbiente}>
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
    </div>
  );
};

export default Dashboard;