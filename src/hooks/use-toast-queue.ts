import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useToastQueue() {
  const [currentToastId, setCurrentToastId] = useState<string | number | null>(
    null
  );

  const clearQueue = useCallback(() => {
    // Dismiss all toasts
    toast.dismiss();
    setCurrentToastId(null);
  }, []);

  const resetQueue = useCallback(() => {
    clearQueue();
  }, [clearQueue]);

  const updateCurrentToast = useCallback(
    (message: string, options?: any) => {
      if (currentToastId) {
        toast.loading(message, {
          id: currentToastId,
          ...options,
        });
      } else {
        // Create new toast if none exists
        const id = toast.loading(message, {
          position: "bottom-center",
          ...options,
        });
        setCurrentToastId(id);
      }
    },
    [currentToastId]
  );

  const completeCurrentToast = useCallback(
    (message: string, options?: any) => {
      if (currentToastId) {
        toast.success(message, {
          id: currentToastId,
          ...options,
        });
      }
    },
    [currentToastId]
  );

  const errorCurrentToast = useCallback(
    (message: string, options?: any) => {
      if (currentToastId) {
        toast.error(message, {
          id: currentToastId,
          ...options,
        });
      } else {
        // Create new error toast if none exists
        const id = toast.error(message, {
          position: "bottom-center",
          ...options,
        });
        setCurrentToastId(id);
      }
    },
    [currentToastId]
  );

  const dismissCurrentToast = useCallback(() => {
    if (currentToastId) {
      toast.dismiss(currentToastId);
      setCurrentToastId(null);
    }
  }, [currentToastId]);

  return {
    currentToastId,
    updateCurrentToast,
    completeCurrentToast,
    errorCurrentToast,
    dismissCurrentToast,
    clearQueue,
    resetQueue,
  };
}
