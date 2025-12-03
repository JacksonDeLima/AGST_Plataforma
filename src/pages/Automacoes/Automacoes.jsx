import React, { useState } from "react";
import "./Automacoes.css";

const AutomacaoCreate = () => {
  const [form, setForm] = useState({
    scheduleId: "",
    name: "",
    enable: true,
    dateStart: "",
    dateEnd: "",
    repetitionMode: 0,
    repetitionValue: 0,
    parameter: {
      modeDevice: 0,
      modeAC: 0,
      fanSpeed: 1,
      setpointCool: 24,
      setpointHeat: 20,
      ecoCool: 22,
      ecoHeat: 18,
    },
  });

  const updateForm = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const updateParam = (field, value) => {
    setForm({
      ...form,
      parameter: { ...form.parameter, [field]: value },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Automação criada:", form);

    alert("Automação criada! Confira o console para ver o JSON enviado.");
  };

  return (
    <div className="automacao-container">
      <h1 className="titulo">Criar Regra de Automação</h1>
      <p className="subtitulo">
        Configure horários, modos e setpoints para automatizar seu sistema de climatização.
      </p>

      <form className="form-automacao" onSubmit={handleSubmit}>

        {/* ID */}
        <label>ID da Automação (scheduleId)</label>
        <input
          type="number"
          className="input"
          placeholder="Ex: 1622135820"
          value={form.scheduleId}
          onChange={(e) => updateForm("scheduleId", Number(e.target.value))}
        />

        {/* Nome */}
        <label>Nome</label>
        <input
          type="text"
          className="input"
          placeholder="Ex: Turno Tarde"
          value={form.name}
          onChange={(e) => updateForm("name", e.target.value)}
        />

        {/* Habilitado */}
        <label>Ativar regra?</label>
        <select
          className="input"
          value={form.enable}
          onChange={(e) => updateForm("enable", e.target.value === "true")}
        >
          <option value="true">Sim</option>
          <option value="false">Não</option>
        </select>

        {/* Datas */}
        <label>Data Inicial</label>
        <input
          type="datetime-local"
          className="input"
          onChange={(e) => updateForm("dateStart", new Date(e.target.value).getTime())}
        />

        <label>Data Final</label>
        <input
          type="datetime-local"
          className="input"
          onChange={(e) => updateForm("dateEnd", new Date(e.target.value).getTime())}
        />

        {/* Repetição */}
        <label>Modo de Repetição</label>
        <select
          className="input"
          value={form.repetitionMode}
          onChange={(e) => updateForm("repetitionMode", Number(e.target.value))}
        >
          <option value="0">Sem repetição</option>
          <option value="1">Semanal</option>
          <option value="2">Diário</option>
          <option value="3">Mensal</option>
          <option value="4">Anual</option>
        </select>

        <label>Valor da Repetição</label>
        <input
          type="number"
          className="input"
          placeholder="Ex: 1"
          value={form.repetitionValue}
          onChange={(e) => updateForm("repetitionValue", Number(e.target.value))}
        />

        <h2 className="secao">Parâmetros do Dispositivo</h2>

        {/* MODE DEVICE */}
        <label>Modo do Dispositivo (modeDevice)</label>
        <select
          className="input"
          value={form.parameter.modeDevice}
          onChange={(e) => updateParam("modeDevice", Number(e.target.value))}
        >
          <option value="0">Desligado</option>
          <option value="1">Manual</option>
          <option value="2">Absoluto</option>
          <option value="3">ECO</option>
        </select>

        {/* MODE AC */}
        <label>Modo do Ar (modeAC)</label>
        <select
          className="input"
          value={form.parameter.modeAC}
          onChange={(e) => updateParam("modeAC", Number(e.target.value))}
        >
          <option value="0">Resfriamento</option>
          <option value="1">Aquecimento</option>
          <option value="2">Automático</option>
          <option value="3">Ventilação</option>
        </select>

        {/* VELOCIDADE */}
        <label>Velocidade do Ventilador (fanSpeed)</label>
        <select
          className="input"
          value={form.parameter.fanSpeed}
          onChange={(e) => updateParam("fanSpeed", Number(e.target.value))}
        >
          <option value="1">Baixa</option>
          <option value="2">Média</option>
          <option value="3">Alta</option>
        </select>

        <label>Temperatura Cool (setpointCool)</label>
        <input
          type="number"
          className="input"
          value={form.parameter.setpointCool}
          onChange={(e) => updateParam("setpointCool", Number(e.target.value))}
        />

        <label>Temperatura Heat (setpointHeat)</label>
        <input
          type="number"
          className="input"
          value={form.parameter.setpointHeat}
          onChange={(e) => updateParam("setpointHeat", Number(e.target.value))}
        />

        <label>Modo ECO - Cool (ecoCool)</label>
        <input
          type="number"
          className="input"
          value={form.parameter.ecoCool}
          onChange={(e) => updateParam("ecoCool", Number(e.target.value))}
        />

        <label>Modo ECO - Heat (ecoHeat)</label>
        <input
          type="number"
          className="input"
          value={form.parameter.ecoHeat}
          onChange={(e) => updateParam("ecoHeat", Number(e.target.value))}
        />

        <button className="btn-salvar" type="submit">
          Criar Automação
        </button>
      </form>

      <pre className="json-preview">
{JSON.stringify(form, null, 2)}
      </pre>
    </div>
  );
};

export default AutomacaoCreate;
