import React, { useState, useEffect } from "react";

const DIAS_SEMANA = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];
const EQUIPAMENTOS_DISPONIVEIS = ["Ar 01", "Ar 02", "Ar 03"];

const AutomacaoForm = ({ initialData, onCancel, onSave }) => {
  const [form, setForm] = useState({
    ambiente: "",
    dias: [],
    inicio: "22:00",
    fim: "06:00",
    equipamentos: [],
  });

  const [erro, setErro] = useState("");

  /* =========================
     INIT
  ========================= */
  useEffect(() => {
    if (initialData) {
      setForm({
        ambiente: initialData.ambiente || "",
        dias: initialData.dias || [],
        inicio: initialData.inicio || initialData.horarioInicio || "22:00",
        fim: initialData.fim || initialData.horarioFim || "06:00",
        equipamentos: initialData.equipamentos || [],
      });
    }
  }, [initialData]);

  /* =========================
     VALIDAR
  ========================= */
  const validar = () => {
    if (
      !form.ambiente ||
      form.dias.length === 0 ||
      !form.inicio ||
      !form.fim ||
      form.equipamentos.length === 0
    ) {
      setErro("Preencha todos os campos obrigatórios");
      return false;
    }
    setErro("");
    return true;
  };

  const salvar = () => {
    if (!validar()) return;
    onSave(form);
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <>
      {/* AMBIENTE */}
      <label className="form-label">🏢 Ambiente</label>
      <input
        className="input"
        placeholder="Ex: Escritório, Sala 01"
        value={form.ambiente}
        onChange={(e) => setForm({ ...form, ambiente: e.target.value })}
      />

      {/* DIAS */}
      <label className="form-label">📅 Dias da semana</label>
      <div className="dias-grid">
        {DIAS_SEMANA.map((dia) => (
          <label key={dia} className="checkbox-item">
            <input
              type="checkbox"
              checked={form.dias.includes(dia)}
              onChange={() => {
                const dias = form.dias.includes(dia)
                  ? form.dias.filter((d) => d !== dia)
                  : [...form.dias, dia];
                setForm({ ...form, dias });
              }}
            />
            <span>{dia}</span>
          </label>
        ))}
      </div>

      {/* HORÁRIO */}
      <label className="form-label">⏰ Horário</label>
      <div className="horario-grid">
        <input
          type="time"
          value={form.inicio}
          onChange={(e) => setForm({ ...form, inicio: e.target.value })}
        />
        <span className="horario-separador">até</span>
        <input
          type="time"
          value={form.fim}
          onChange={(e) => setForm({ ...form, fim: e.target.value })}
        />
      </div>

      {/* EQUIPAMENTOS */}
      <label className="form-label">🔌 Equipamentos</label>
      <div className="equipamentos-grid">
        {EQUIPAMENTOS_DISPONIVEIS.map((eq) => (
          <label key={eq} className="checkbox-item">
            <input
              type="checkbox"
              checked={form.equipamentos.includes(eq)}
              onChange={() => {
                const equipamentos = form.equipamentos.includes(eq)
                  ? form.equipamentos.filter((e) => e !== eq)
                  : [...form.equipamentos, eq];
                setForm({ ...form, equipamentos });
              }}
            />
            <span>{eq}</span>
          </label>
        ))}
      </div>

      {/* PREVIEW DE IMPACTO */}
      <div className="impact-preview">
        <p>⚡ Economia estimada:</p>
        <strong>{form.equipamentos.length * 40} kWh / mês</strong>

        <p>💰 Economia financeira:</p>
        <strong>R$ {form.equipamentos.length * 30},00 / mês</strong>
      </div>

      {erro && <p className="form-error">{erro}</p>}

      {/* AÇÕES */}
      <div className="modal-actions">
        <button className="btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button className="btn-primary" onClick={salvar}>
          Salvar
        </button>
      </div>
    </>
  );
};

export default AutomacaoForm;
