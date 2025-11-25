import { toast } from 'sonner';

export class ToastService {
  static error(title: string, message: string, duration = 3000) {
    const id = toast.error(title, {
      description: message,
      duration,
    });

    return id;
  }

  static success(title: string, message: string, duration = 3000) {
    const id = toast.success(title, {
      description: message,
      duration,
    });

    return id;
  }

  static info(title: string, message: string, duration = 3000) {
    const id = toast.info(title, {
      description: message,
      duration,
    });

    return id;
  }
}
