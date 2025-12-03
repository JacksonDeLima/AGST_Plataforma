import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDevices, deleteDevice, DevicePayload } from '../services/deviceService';

export default function DeviceListPage() {
  const [devices, setDevices] = useState<DevicePayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchDevices() {
    try {
      setLoading(true);
      setError(null);
      const data = await getDevices();
      // A API de exemplo pode não retornar um array, então garantimos que seja um.
      setDevices(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Falha ao buscar equipamentos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este equipamento?')) {
      try {
        await deleteDevice(id);
        // Atualiza a lista removendo o item deletado
        setDevices(devices.filter(device => device.id !== id));
      } catch (err: any) {
        setError(err.message || 'Falha ao excluir equipamento.');
        console.error(err);
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Lista de Equipamentos</h1>
        <Link to="/equipamentos/cadastrar">
          <button style={{ padding: '10px 15px', cursor: 'pointer' }}>Cadastrar Novo Equipamento</button>
        </Link>
      </div>

      {/* A lógica de renderização agora fica contida aqui dentro */}
      <div>
        {loading && <p>Carregando equipamentos...</p>}
        {error && <p style={{ color: 'red' }}>Erro: {error}</p>}
        {!loading && !error && (
          devices.length === 0 ? (
            <p>Nenhum equipamento cadastrado.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {devices.map((device) => (
                <li key={device.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{device.name} (Serial: {device.serial_number})</span>
                  <div>
                    <Link to={`/equipamentos/${device.id}/editar`} style={{ marginRight: '10px' }}>Editar</Link>
                    <button onClick={() => handleDelete(device.id!)}>Excluir</button>
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );
}