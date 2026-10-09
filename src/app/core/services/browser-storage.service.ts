import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BrowserStorageService {
  private readonly platformId = inject(PLATFORM_ID);

  get isBrowser(): boolean { return isPlatformBrowser(this.platformId); }

  get<T>(key: string, fallback: T, storage: 'local' | 'session' = 'local'): T {
    if (!this.isBrowser) return fallback;
    try {
      const raw = this.pick(storage).getItem(key);
      return raw === null ? fallback : JSON.parse(raw) as T;
    } catch { return fallback; }
  }

  getArray<T>(key: string, validate: (value: unknown) => value is T, storage: 'local' | 'session' = 'local'): T[] {
    const value = this.get<unknown>(key, [], storage);
    return Array.isArray(value) ? value.filter(validate) : [];
  }

  set<T>(key: string, value: T, storage: 'local' | 'session' = 'local'): boolean {
    if (!this.isBrowser) return false;
    try { this.pick(storage).setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  }

  remove(key: string, storage: 'local' | 'session' = 'local'): void {
    if (!this.isBrowser) return;
    try { this.pick(storage).removeItem(key); }
    catch { /* Le navigateur peut refuser l’accès au stockage. */ }
  }

  has(key: string, storage: 'local' | 'session' = 'local'): boolean {
    if (!this.isBrowser) return false;
    try { return this.pick(storage).getItem(key) !== null; }
    catch { return false; }
  }

  private pick(storage: 'local' | 'session'): Storage {
    return storage === 'session' ? sessionStorage : localStorage;
  }
}
