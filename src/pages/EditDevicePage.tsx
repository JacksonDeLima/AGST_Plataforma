import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { getDevice, updateDevice } from '../services/deviceService';

const deviceSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  serial_number: z.string().min(1, 'O número de série é obrigatório'),
  type: z.string().min(1, 'O tipo é obrigatório'),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

export default function EditDevicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
  });

  useEffect(() => {
    if (!id) return;

    async function fetchDeviceData() {
      try {
        const device = await getDevice(id!);
        if (device) {
          reset(device); // Popula o formulário com os dados do equipamento
        }
      } catch (err: any) { // O serviço já trata o erro, mas mantemos o log aqui
        console.error(err);
        alert(`Erro ao carregar dados do equipamento: ${err.message}`);
      }
    }

    fetchDeviceData();
  }, [id, reset]);

  const onSubmit = async (data: DeviceFormData) => {
    if (!id) return;
    try {
      await updateDevice(id!, data);
      alert('Equipamento atualizado com sucesso!');
      navigate('/equipamentos');
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao atualizar: ${err.message}`);
    }
  };

  const inputStyle = { display: 'block', marginBottom: '5px', width: '300px', padding: '8px' };
  const errorStyle = { color: 'red', marginBottom: '10px', fontSize: '12px' };

  return (
    <div>
      <h1>Editar Equipamento</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name">Nome do Equipamento</label>
          <input id="name" {...register('name')} style={inputStyle} />
          {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="serialNumber">Número de Série</label>
          <input id="serialNumber" {...register('serial_number')} style={inputStyle} />
          {errors.serial_number && <p style={errorStyle}>{errors.serial_number.message}</p>}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="type">Tipo</label>
          <input id="type" {...register('type')} style={inputStyle} />
          {errors.type && <p style={errorStyle}>{errors.type.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px' }}>
          {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
}