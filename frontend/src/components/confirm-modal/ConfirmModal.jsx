import { createPortal } from "react-dom";

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return createPortal(
    <div className="confirm-modal" onClick={onCancel}>
      <div className="confirm-modal__card stack-s" onClick={(event) => { event.stopPropagation(); }}>
        <p>{message}</p>
        <div className="confirm-modal__actions">
          <button className="btn btn--red" onClick={onCancel}>Cancel</button>
          <button className="btn btn--primary" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
