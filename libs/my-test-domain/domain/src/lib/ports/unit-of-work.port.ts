export interface IUnitOfWork {
  withTransaction<T>(work: () => Promise<T>): Promise<T>;
}
