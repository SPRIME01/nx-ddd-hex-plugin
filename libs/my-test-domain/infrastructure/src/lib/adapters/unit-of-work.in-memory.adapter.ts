import { IUnitOfWork } from '@my-test-domain/domain';

export class UnitOfWorkInMemoryAdapter implements IUnitOfWork {
  withTransaction<T>(work: () => Promise<T>): Promise<T> {
    return work();
  }
}
