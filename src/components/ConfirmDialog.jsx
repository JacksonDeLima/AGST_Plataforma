import React, { useEffect, useRef } from "react";
import "./ConfirmDialog.css";

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, [open]);

  return (
    <div className="modal-overlay confirm-overlay" onClick={onCancel}>
      <div
        className="modal-content confirm-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Confirmação"}
      >
        <div className="confirm-header">
          <h3>{title || "Confirmar ação"}</h3>
        </div>

        {message && <p className="confirm-message">{message}</p>}

        <div className="confirm-footer">
          <button
            className="btn-secondary"
            type="button"
            onClick={onCancel}
            ref={cancelRef}
          >
            {cancelText}
          </button>
          <button className="btn-danger" type="button" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
