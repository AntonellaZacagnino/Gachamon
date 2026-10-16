import { EnergyState } from '../../domain/entities/Energy';
import { EnergyRepository } from '../../domain/repositories/EnergyRepository';
import { KeyValueStorage } from '../storage/KeyValueStorage';

const STORAGE_KEY = 'pokemon-gacha:energy:v1';

const isEnergyState = (value: unknown): value is EnergyState =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as EnergyState).points === 'number' &&
  typeof (value as EnergyState).lastRegenAt === 'number';

export class EnergyStorageRepository implements EnergyRepository {
  constructor(private readonly storage: KeyValueStorage) {}

  async load(): Promise<EnergyState | null> {
    const raw = await this.storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const data: unknown = JSON.parse(raw);
      return isEnergyState(data) ? data : null;
    } catch {
      return null; // corrupted data
    }
  }

  async save(state: EnergyState): Promise<void> {
    await this.storage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}
