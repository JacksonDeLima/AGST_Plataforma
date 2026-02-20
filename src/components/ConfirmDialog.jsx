import React, { useEffect, useRef } from "react";
import "./ConfirmDialog.css";
import { useLanguage } from "../context/LanguageContext.jsx";

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) => {
  const { t } = useLanguage();
  if (!open) return null;
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, [open]);

  const resolvedConfirmText = confirmText || t('common.confirmar');
  const resolvedCancelText = cancelText || t('common.cancelar');
  const resolvedTitle = title || t('common.confirmar');

  return (
    <div className="modal-overlay confirm-overlay" onClick={onCancel}>
      <div
        className="modal-content confirm-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={resolvedTitle}
      >
        <div className="confirm-header">
          <h3>{resolvedTitle}</h3>
        </div>

        {message && <p className="confirm-message">{message}</p>}

        <div className="confirm-footer">
          <button
            className="btn-secondary"
            type="button"
            onClick={onCancel}
            ref={cancelRef}
          >
            {resolvedCancelText}
          </button>
          <button className="btn-danger" type="button" onClick={onConfirm}>
            {resolvedConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
