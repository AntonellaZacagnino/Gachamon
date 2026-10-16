import { EnergyState, EnergyStatus } from '../entities/Energy';
import { EnergyRepository } from '../repositories/EnergyRepository';
import { Clock } from './Clock';
import { EnergyRules } from './EnergyRules';

/** What the pull use case needs from the energy system. */
export interface EnergyPort {
  spend(): Promise<EnergyStatus>;
  refund(): Promise<void>;
}

/**
 * Keeps the energy in memory (loaded once from storage) and saves every change.
 * Checking and spending happen in one synchronous step, so two quick taps can
 * never spend the same points twice.
 */
export class EnergyService implements EnergyPort {
  private state: EnergyState | null = null;
  private loading: Promise<void> | null = null;
  private readonly listeners = new Set<() => void>();

  constructor(
    private readonly rules: EnergyRules,
    private readonly repository: EnergyRepository,
    private readonly clock: Clock,
  ) {}

  load(): Promise<void> {
    this.loading ??= this.readFromStorage();
    return this.loading;
  }

  /** Current energy including recovered points, or null until load() has finished. */
  status(): EnergyStatus | null {
    return this.state ? this.rules.status(this.state, this.clock.now()) : null;
  }

  async spend(): Promise<EnergyStatus> {
    await this.load();
    // No await between the check and the update below: that is what makes it atomic.
    this.update(this.rules.spend(this.requireState(), this.clock.now()));
    await this.persist();
    return this.requireStatus();
  }

  async refund(): Promise<void> {
    await this.load();
    this.update(this.rules.refund(this.requireState(), this.clock.now()));
    await this.persist();
  }

  /** Called whenever the energy changes. Returns the unsubscribe function. */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private async readFromStorage(): Promise<void> {
    const now = this.clock.now();
    let stored: EnergyState | null = null;
    try {
      stored = await this.repository.load();
    } catch {
      stored = null; // unreadable storage: start fresh rather than block the game
    }
    this.state = this.rules.refresh(this.rules.sanitize(stored, now), now);
    this.notify();
  }

  private update(next: EnergyState): void {
    this.state = next;
    this.notify();
  }

  private async persist(): Promise<void> {
    try {
      await this.repository.save(this.requireState());
    } catch {
      // The in-memory value is still right; the next successful save will catch up.
    }
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  private requireState(): EnergyState {
    if (!this.state) throw new Error('Energy has not been loaded');
    return this.state;
  }

  private requireStatus(): EnergyStatus {
    const status = this.status();
    if (!status) throw new Error('Energy has not been loaded');
    return status;
  }
}
