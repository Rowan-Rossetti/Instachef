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
    return this.currentUser() !== null;
  }

  currentUser(): SessionUser | null {
    for (const target of ['session', 'local'] as const) {
      const user = this.storage.get<SessionUser | null>(SESSION_KEY, null, target);
      if (user && typeof user.firstname === 'string' && typeof user.lastname === 'string' && typeof user.email === 'string') return user;
    }
    return null;
  }

  async register(input: { firstname: string; lastname: string; email: string; password: string }): Promise<void> {
    const account: StoredAccount = {
      firstname: input.firstname.trim(),
      lastname: input.lastname.trim(),
      email: input.email.trim().toLowerCase(),
      passwordHash: await this.hash(input.password),
    };
    if (!this.storage.set(ACCOUNT_KEY, account)) throw new Error('Enregistrement du compte impossible');
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
    if (!this.storage.set(ACCOUNT_KEY, updated)) throw new Error('Enregistrement du profil impossible');
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
    if (!this.storage.set(SESSION_KEY, session, remember ? 'local' : 'session')) {
      throw new Error('Enregistrement de la session impossible');
    }
    this.storage.remove(SESSION_KEY, remember ? 'session' : 'local');
  }

  private async hash(value: string): Promise<string> {
    if (!this.storage.isBrowser || !globalThis.crypto?.subtle) {
      throw new Error('La connexion nécessite un navigateur avec HTTPS ou localhost');
    }
    const bytes = new TextEncoder().encode(value);
    const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private removeLegacyAuthKeys(): void {
    this.storage.remove('isLoggedIn');
    this.storage.remove('currentUser');
  }
}
