import {
  Tree,
  formatFiles,
} from '@nx/devkit';
import { UowGeneratorSchema } from './schema';

/**
 * Generates the TypeScript files for the UoW.
 * @param tree The file tree.
 * @param options The generator options.
 */
function addTsFiles(tree: Tree, options: UowGeneratorSchema) {
  const uowInterfaceContent = `export interface IUnitOfWork {
  withTransaction<T>(work: () => Promise<T>): Promise<T>;
}
`;

  const inMemoryAdapterContent = `import { IUnitOfWork } from '@${options.domain}/domain';

export class UnitOfWorkInMemoryAdapter implements IUnitOfWork {
  withTransaction<T>(work: () => Promise<T>): Promise<T> {
    return work();
  }
}
`;

  tree.write(`libs/${options.domain}/domain/src/lib/ports/unit-of-work.port.ts`, uowInterfaceContent);
  tree.write(`libs/${options.domain}/infrastructure/src/lib/adapters/unit-of-work.in-memory.adapter.ts`, inMemoryAdapterContent);
}

/**
 * Generates the Python files for the UoW.
 * @param tree The file tree.
 * @param options The generator options.
 */
function addPyFiles(tree: Tree, options: UowGeneratorSchema) {
  const snakeCaseDomain = options.domain.replace(/-/g, '_');

  const uowProtocolContent = `from typing import Protocol, TypeVar, Callable, Awaitable

T = TypeVar('T')

class IUnitOfWork(Protocol):
    async def with_transaction(self, work: Callable[[], Awaitable[T]]) -> T:
        ...
`;

  const sqlalchemyAdapterContent = `from typing import TypeVar, Callable, Awaitable
from sqlalchemy.ext.asyncio import AsyncSession
from ${snakeCaseDomain}.domain.ports import IUnitOfWork

T = TypeVar('T')

class UnitOfWorkSQLAlchemyAdapter(IUnitOfWork):
    def __init__(self, session: AsyncSession):
        self._session = session

    async def with_transaction(self, work: Callable[[], Awaitable[T]]) -> T:
        async with self._session.begin():
            return await work()
`;

  tree.write(`libs/${options.domain}/domain/src/lib/ports/unit_of_work_port.py`, uowProtocolContent);
  tree.write(`libs/${options.domain}/infrastructure/src/lib/adapters/unit_of_work_sqlalchemy_adapter.py`, sqlalchemyAdapterContent);
}

export async function uowGenerator(
  tree: Tree,
  options: UowGeneratorSchema
) {
  if (options.language === 'ts') {
    addTsFiles(tree, options);
  } else if (options.language === 'py') {
    addPyFiles(tree, options);
  }

  await formatFiles(tree);
}

export default uowGenerator;
