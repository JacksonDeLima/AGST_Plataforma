import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AutomacaoForm from "../../components/automacoes/AutomacaoForm";

const CriarAutomacao = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ambiente: "",
    dias: [],
    inicio: "08:00",
    fim: "18:00",
    equipamentos: [],
  });

  const criar = () => {
    if (!form.ambiente || form.dias.length === 0 || form.equipamentos.length === 0) {
      alert("Preencha todos os campos");
      return;
    }

    alert("Automação criada (mock)");
    navigate("/automacoes");
  };

  return (
    <div className="automacao-detalhes-page">
      <button className="btn-secondary" onClick={() => navigate("/automacoes")}>
        ← Voltar
      </button>

      <h1>Criar Automação</h1>

      <div className="detalhes-box">
        <AutomacaoForm form={form} setForm={setForm} />

        <div className="modal-actions" style={{ marginTop: 24 }}>
          <button className="btn-secondary" onClick={() => navigate("/automacoes")}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={criar}>
            Criar Automação
          </button>
        </div>
      </div>
    </div>
  );
};

export default CriarAutomacao;
