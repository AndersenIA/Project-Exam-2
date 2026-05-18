interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-4 font-kulim">
        <h2 className="text-lg font-normal text-primary">{title}</h2>
        <p className="text-sm text-primary/70 leading-relaxed">{message}</p>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm transition-colors cursor-pointer"
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-primary/20 rounded-xl text-sm text-primary hover:border-secondary hover:text-secondary transition-colors cursor-pointer"
          >
            Keep booking
          </button>
        </div>
      </div>
    </div>
  );
}
