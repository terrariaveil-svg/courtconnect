import { useEffect } from 'react';
import type { ReactNode } from 'react';
import './ui.css';

type ModalShellProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
};

export default function ModalShell({ title, onClose, children, width = 480 }: ModalShellProps) {
  // Close with the Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="ui-modal-backdrop" onMouseDown={onClose}>
      <div
        className="ui-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ maxWidth: width }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="ui-modal-head">
          <h2>{title}</h2>
          <button type="button" className="ui-modal-close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}