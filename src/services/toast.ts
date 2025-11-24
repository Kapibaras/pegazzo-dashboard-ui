import { toast } from '@/components/ui/use-toast';

export class ToastService {
  static error(title: string, message: string, duration = 2500) {
    const { dismiss } = toast({
      title,
      description: message,
      variant: 'destructive',
    });
    setTimeout(() => dismiss(), duration);
  }

  static success(title: string, message: string, duration = 2500) {
    const { dismiss } = toast({
      title,
      description: message,
      variant: 'success',
    });
    setTimeout(() => dismiss(), duration);
  }

  static info(title: string, message: string, duration = 2500) {
    const { dismiss } = toast({
      title,
      description: message,
      variant: 'default',
    });
    setTimeout(() => dismiss(), duration);
  }
}
