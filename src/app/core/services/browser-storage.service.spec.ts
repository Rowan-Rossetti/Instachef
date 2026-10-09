import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { BrowserStorageService } from './browser-storage.service';

describe('BrowserStorageService', () => {
  let storage: BrowserStorageService;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'browser' }] });
    storage = TestBed.inject(BrowserStorageService);
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(() => vi.restoreAllMocks());

  it('returns a fallback for broken JSON', () => {
    localStorage.setItem('recipes', '{broken');
    expect(storage.get('recipes', [])).toEqual([]);
  });

  it('rejects non-array data and filters invalid entries', () => {
    const number = (value: unknown): value is number => typeof value === 'number';
    localStorage.setItem('likes', 'null');
    expect(storage.getArray('likes', number)).toEqual([]);
    localStorage.setItem('likes', '[2, null, "3", {}]');
    expect(storage.getArray('likes', number)).toEqual([2]);
  });

  it('handles browser storage restrictions for every operation', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Denied'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Full'); });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('Denied'); });
    expect(storage.get('key', 'fallback')).toBe('fallback');
    expect(storage.has('key')).toBe(false);
    expect(storage.set('key', {})).toBe(false);
    expect(() => storage.remove('key')).not.toThrow();
  });

  it('does not touch browser storage on the server', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const server = TestBed.inject(BrowserStorageService);
    const read = vi.spyOn(Storage.prototype, 'getItem');
    expect(server.get('key', [])).toEqual([]);
    expect(server.set('key', 1)).toBe(false);
    expect(server.has('key')).toBe(false);
    server.remove('key');
    expect(read).not.toHaveBeenCalled();
  });
});
