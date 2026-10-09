import { webcrypto } from 'node:crypto';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { BrowserStorageService } from './browser-storage.service';

describe('AuthService persistence', () => {
  let auth: AuthService;
  let storage: BrowserStorageService;
  const account = { firstname: 'Rowan', lastname: 'Test', email: 'rowan@example.com', passwordHash: 'existing-hash' };
  beforeEach(() => {
    vi.stubGlobal('crypto', webcrypto);
    auth = TestBed.inject(AuthService);
    storage = TestBed.inject(BrowserStorageService);
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it('does not accept corrupt session data as authenticated', () => {
    localStorage.setItem('instachef.session', 'null');
    expect(auth.isAuthenticated()).toBe(false);
    localStorage.setItem('instachef.session', '{"email":42}');
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('preserves a valid persistent session if a temporary session is malformed', () => {
    storage.set('instachef.session', { firstname: 'Rowan', lastname: 'Test', email: account.email });
    storage.set('instachef.session', {}, 'session');
    expect(auth.currentUser()?.email).toBe(account.email);
  });

  it('reports a failed profile save without overwriting the saved account', async () => {
    storage.set('instachef.account', account);
    vi.spyOn(storage, 'set').mockReturnValue(false);
    await expect(auth.updateProfile({ firstname: 'New', lastname: 'Name', email: 'new@example.com' })).rejects.toThrow();
    expect(storage.get('instachef.account', null)).toEqual(account);
  });

  it('reports a failed session save instead of silently authenticating', async () => {
    storage.set('instachef.account', account);
    const original = storage.set.bind(storage);
    vi.spyOn(storage, 'set').mockImplementation((key, value, target) =>
      key === 'instachef.session' ? false : original(key, value, target));
    await expect(auth.updateProfile({ firstname: 'Rowan', lastname: 'Test', email: account.email })).rejects.toThrow();
    expect(auth.isAuthenticated()).toBe(false);
  });
  it('registers, logs out, and switches between remembered and temporary sessions', async () => {
    await auth.register({ firstname: ' Rowan ', lastname: ' Test ', email: ' ROWAN@example.com ', password: 'Secret123!' });
    expect(auth.currentUser()?.email).toBe('rowan@example.com');
    expect(storage.get<{ passwordHash: string } | null>('instachef.account', null)?.passwordHash).not.toContain('Secret123!');
    auth.logout();
    expect(auth.isAuthenticated()).toBe(false);
    expect(await auth.login('rowan@example.com', 'wrong', false)).toBe(false);
    expect(await auth.login('rowan@example.com', 'Secret123!', true)).toBe(true);
    expect(storage.has('instachef.session', 'local')).toBe(true);
    expect(await auth.login('rowan@example.com', 'Secret123!', false)).toBe(true);
    expect(storage.has('instachef.session', 'local')).toBe(false);
    expect(storage.has('instachef.session', 'session')).toBe(true);
  });

  it('does not save a plaintext password when Web Crypto is unavailable', async () => {
    vi.stubGlobal('crypto', {});
    await expect(auth.register({ firstname: 'Rowan', lastname: 'Test', email: account.email, password: 'Secret123!' })).rejects.toThrow();
    expect(storage.has('instachef.account')).toBe(false);
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('rejects account creation when storage is full', async () => {
    vi.spyOn(storage, 'set').mockReturnValue(false);
    await expect(auth.register({ firstname: 'Rowan', lastname: 'Test', email: account.email, password: 'Secret123!' })).rejects.toThrow();
    expect(auth.isAuthenticated()).toBe(false);
  });
});
