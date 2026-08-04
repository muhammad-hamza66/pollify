import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  danger = true,
  loading,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {description && (
        <div className="flex items-start gap-3 mb-6">
          {danger && (
            <div className="h-9 w-9 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
            </div>
          )}
          <p className="text-sm text-[#64748b] dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        </div>
      )}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant={danger ? "danger" : "primary"}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
