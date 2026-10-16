/** The slice of AsyncStorage we depend on (so tests can use a fake). */
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
