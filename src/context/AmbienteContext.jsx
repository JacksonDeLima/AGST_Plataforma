import React, { createContext, useContext, useEffect, useState } from "react";

const AmbienteContext = createContext(null);

const LS_ACTIVE_AMBIENTE = "agst_active_ambiente_id";

export function AmbienteProvider({ children }) {
  const [ambienteId, setAmbienteId] = useState(
    () => localStorage.getItem(LS_ACTIVE_AMBIENTE) || null
  );

  function setActiveAmbiente(id) {
    if (!id) {
      localStorage.removeItem(LS_ACTIVE_AMBIENTE);
      setAmbienteId(null);
      return;
    }

    localStorage.setItem(LS_ACTIVE_AMBIENTE, String(id));
    setAmbienteId(String(id));
  }

  return (
    <AmbienteContext.Provider
      value={{
        ambienteId,
        setActiveAmbiente,
      }}
    >
      {children}
    </AmbienteContext.Provider>
  );
}

export function useAmbiente() {
  const ctx = useContext(AmbienteContext);
  if (!ctx) {
    throw new Error("useAmbiente deve ser usado dentro de AmbienteProvider");
  }
  return ctx;
}
