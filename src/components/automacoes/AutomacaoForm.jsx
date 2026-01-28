import React, { useState, useEffect } from "react";

const DIAS_SEMANA = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];

const AutomacaoForm = ({ initialData, onCancel, onSave }) => {
  const [form, setForm] = useState({
    ambiente: "",
    dias: [],
    inicio: "22:00",
    fim: "06:00",
    equipamentos: [],
  });

  const [erro, setErro] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const validar = () => {
    if (!form.ambiente || form.dias.length === 0 || !form.inicio || !form.fim) {
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

  return (
    <>
      <label>🏢 Ambiente</label>
      <input
        value={form.ambiente}
        onChange={(e) => setForm({ ...form, ambiente: e.target.value })}
      />

      <label>📅 Dias da semana</label>
      <div className="dias-grid">
        {DIAS_SEMANA.map((dia) => (
          <label key={dia} className="checkbox-row">
            <input
              type="checkbox"
              checked={form.dias.includes(dia)}
              onChange={() => {
                const novo = form.dias.includes(dia)
                  ? form.dias.filter((d) => d !== dia)
                  : [...form.dias, dia];
                setForm({ ...form, dias: novo });
              }}
            />
            <span>{dia}</span>
          </label>
        ))}
      </div>

      <label>⏰ Horário</label>
      <div className="horario-grid">
        <input
          type="time"
          value={form.inicio}
          onChange={(e) => setForm({ ...form, inicio: e.target.value })}
        />
        <span>até</span>
        <input
          type="time"
          value={form.fim}
          onChange={(e) => setForm({ ...form, fim: e.target.value })}
        />
      </div>

      <label>🔌 Equipamentos</label>
      <div className="equipamentos-grid">
        {["Ar 01", "Ar 02", "Ar 03"].map((eq) => (
          <label key={eq} className="checkbox-row">
            <input
              type="checkbox"
              checked={form.equipamentos.includes(eq)}
              onChange={() => {
                const novo = form.equipamentos.includes(eq)
                  ? form.equipamentos.filter((e) => e !== eq)
                  : [...form.equipamentos, eq];
                setForm({ ...form, equipamentos: novo });
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
