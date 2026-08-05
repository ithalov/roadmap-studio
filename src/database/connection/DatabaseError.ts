export class DatabaseError extends Error {
  public readonly cause: unknown;

  constructor(message: string, cause?: unknown) {
    const details = cause instanceof Error ? cause.message : typeof cause === 'string' ? cause : '';
    super(details ? `${message} ${details}` : message);
    this.name = 'DatabaseError';
    this.cause = cause;
  }
}
