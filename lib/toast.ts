import { toast as sonner } from "sonner";

type ToastOptions = {
  description?: string;
};

export const toast = {
  success(message: string, options?: ToastOptions) {
    return sonner.success(message, { description: options?.description });
  },
  error(message: string, options?: ToastOptions) {
    return sonner.error(message, { description: options?.description });
  },
  info(message: string, options?: ToastOptions) {
    return sonner.info(message, { description: options?.description });
  },
  promise<T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string },
  ) {
    return sonner.promise(promise, messages);
  },
};
