import { makeAutoObservable } from "mobx";
import { ToastItem } from "../shared";

class ToastStore {
  private _toasts: ToastItem[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  get toasts() {
    return this._toasts;
  }

  show(message: string, type: "success" | "error" | "info" | "warning" = "info", duration?: number) {
    const id = Date.now().toString();
    this._toasts.push({ id, type, message, duration });

    // Авто-удаление через duration (если нужно)
    if (duration !== 0) {
      setTimeout(() => {
        this.hide(id);
      }, duration || 3000);
    }
  }

  showSuccess(message: string, duration?: number) {
    this.show(message, "success", duration);
  }

  showError(message: string, duration?: number) {
    this.show(message, "error", duration);
  }

  showInfo(message: string, duration?: number) {
    this.show(message, "info", duration);
  }

  showWarning(message: string, duration?: number) {
    this.show(message, "warning", duration);
  }

  hide(id: string) {
    this._toasts = this._toasts.filter(t => t.id !== id);
  }

  clear() {
    this._toasts = [];
  }
}

export default ToastStore;
