import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Récupérer le storage
   */
  private getStorage(type: 'local' | 'session' = 'session'): Storage | null {

    if (!this.isBrowser) {
      return null;
    }

    return type === 'local'
      ? localStorage
      : sessionStorage;
  }

  /**
   * set item
   */
  setItem(
    key: string,
    value: string,
    type: 'local' | 'session' = 'session'
  ): void {

    const storage = this.getStorage(type);

    storage?.setItem(key, value);
  }

  /**
   * get item
   */
  getItem(
    key: string,
    type: 'local' | 'session' = 'session'
  ): string | null {

    const storage = this.getStorage(type);

    return storage?.getItem(key) || null;
  }

  /**
   * remove item
   */
  removeItem(
    key: string,
    type: 'local' | 'session' = 'session'
  ): void {

    const storage = this.getStorage(type);

    storage?.removeItem(key);
  }

  /**
   * clear
   */
  clear(type: 'local' | 'session' = 'session'): void {

    const storage = this.getStorage(type);

    storage?.clear();
  }

  /**
   * save object
   */
  setObject<T>(
    key: string,
    value: T,
    type: 'local' | 'session' = 'session'
  ): void {

    this.setItem(
      key,
      JSON.stringify(value),
      type
    );
  }

  /**
   * get object
   */
  getObject<T>(
    key: string,
    type: 'local' | 'session' = 'session'
  ): T | null {

    const value = this.getItem(key, type);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  /**
   * exists
   */
  hasItem(
    key: string,
    type: 'local' | 'session' = 'session'
  ): boolean {

    return this.getItem(key, type) !== null;
  }
}