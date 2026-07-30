import { Injectable, inject } from '@angular/core';
import { BrowserStorageService } from './browser-storage.service';

export interface StoredAccount {
  firstname: string;
  lastname: string;
  email: string;
  passwordHash: string;
}

export interface SessionUser {
  firstname: string;
  lastname: string;
  email: string;
}

const ACCOUNT_KEY = 'instachef.account';
const SESSION_KEY = 'instachef.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(BrowserStorageService);

  isAuthenticated(): boolean {
    return this.storage.has(SESSION_KEY, 'session') || this.storage.has(SESSION_KEY, 'local');
  }

  currentUser(): SessionUser | null {
    return this.storage.get<SessionUser | null>(SESSION_KEY, null, 'session')
      ?? this.storage.get<SessionUser | null>(SESSION_KEY, null, 'local');
  }

  async register(input: { firstname: string; lastname: string; email: string; password: string }): Promise<void> {
    const account: StoredAccount = {
      firstname: input.firstname.trim(),
      lastname: input.lastname.trim(),
      email: input.email.trim().toLowerCase(),
      passwordHash: await this.hash(input.password),
    };
    this.storage.set(ACCOUNT_KEY, account);
    this.startSession(account, true);
    this.removeLegacyAuthKeys();
  }

  async login(email: string, password: string, remember: boolean): Promise<boolean> {
    const account = this.storage.get<StoredAccount | null>(ACCOUNT_KEY, null);
    if (!account) return false;
    const valid = account.email === email.trim().toLowerCase() && account.passwordHash === await this.hash(password);
    if (valid) this.startSession(account, remember);
    return valid;
  }

  async updateProfile(input: { firstname: string; lastname: string; email: string; newPassword?: string }): Promise<void> {
    const account = this.storage.get<StoredAccount | null>(ACCOUNT_KEY, null);
    if (!account) throw new Error('Compte introuvable');
    const updated: StoredAccount = {
      ...account,
      firstname: input.firstname.trim(),
      lastname: input.lastname.trim(),
      email: input.email.trim().toLowerCase(),
      passwordHash: input.newPassword ? await this.hash(input.newPassword) : account.passwordHash,
    };
    this.storage.set(ACCOUNT_KEY, updated);
    const persistent = this.storage.has(SESSION_KEY, 'local');
    this.startSession(updated, persistent);
  }

  logout(): void {
    this.storage.remove(SESSION_KEY, 'session');
    this.storage.remove(SESSION_KEY, 'local');
    this.removeLegacyAuthKeys();
  }

  private startSession(account: StoredAccount, remember: boolean): void {
    const session: SessionUser = { firstname: account.firstname, lastname: account.lastname, email: account.email };
    this.storage.remove(SESSION_KEY, remember ? 'session' : 'local');
    this.storage.set(SESSION_KEY, session, remember ? 'local' : 'session');
  }

  private async hash(value: string): Promise<string> {
    if (!this.storage.isBrowser || !globalThis.crypto?.subtle) return `fallback:${value}`;
    const bytes = new TextEncoder().encode(value);
    const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private removeLegacyAuthKeys(): void {
    this.storage.remove('isLoggedIn');
    this.storage.remove('currentUser');
  }
}
