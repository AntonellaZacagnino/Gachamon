export class InsufficientEnergyError extends Error {
  constructor(message = 'Not enough energy for a pull') {
    super(message);
    this.name = 'InsufficientEnergyError';
  }
}
