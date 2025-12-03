import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { createDevice } from '../services/deviceService';

const deviceSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  serial_number: z.string().min(1, 'O número de série é obrigatório'),
  type: z.string().min(1, 'O tipo é obrigatório'),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

export default function CreateDevicePage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
  });

  const onSubmit = async (data: DeviceFormData) => {
    try {
      const newDevice = await createDevice(data);
      if (newDevice) {
        alert('Equipamento cadastrado com sucesso!');
        navigate('/equipamentos');
      } else {
        // O serviço retorna null em caso de erro (ex: 400, 401, 500)
        alert('Falha ao cadastrar o equipamento. Verifique os dados ou o console para mais detalhes.');
      }
    } catch (err: any) {
      console.error(err);
      alert(`Ocorreu um erro inesperado: ${err.message}`);
    }
  };

  const inputStyle = { display: 'block', marginBottom: '5px', width: '300px', padding: '8px' };
  const errorStyle = { color: 'red', marginBottom: '10px', fontSize: '12px' };

  return (
    <div>
      <h1>Cadastrar Novo Equipamento</h1>
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
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar Equipamento'}
        </button>
      </form>
    </div>
  );
}