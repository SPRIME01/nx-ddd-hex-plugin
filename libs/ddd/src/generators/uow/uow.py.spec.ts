import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree } from '@nx/devkit';
import { hexDomainGenerator } from '../hex-domain/generator';
import { uowGenerator } from './generator';

describe('uowGenerator (Python)', () => {
  let tree: Tree;
  const domainName = 'test-domain';

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await hexDomainGenerator(tree, { name: domainName });
  });

  it('should create the UoW protocol and SQLAlchemy adapter', async () => {
    await uowGenerator(tree, { domain: domainName, language: 'py' });

    const uowProtocolPath = `libs/${domainName}/domain/src/lib/ports/unit_of_work_port.py`;
    const sqlalchemyAdapterPath = `libs/${domainName}/infrastructure/src/lib/adapters/unit_of_work_sqlalchemy_adapter.py`;

    expect(tree.exists(uowProtocolPath)).toBe(true);
    expect(tree.exists(sqlalchemyAdapterPath)).toBe(true);
  });

  it('should generate the correct content for the UoW protocol', async () => {
    await uowGenerator(tree, { domain: domainName, language: 'py' });

    const uowProtocolPath = `libs/${domainName}/domain/src/lib/ports/unit_of_work_port.py`;
    const content = tree.read(uowProtocolPath).toString();

    expect(content).toContain(`from typing import Protocol, TypeVar, Callable, Awaitable`);
    expect(content).toContain(`T = TypeVar('T')`);
    expect(content).toContain(`class IUnitOfWork(Protocol):`);
    expect(content).toContain(`    async def with_transaction(self, work: Callable[[], Awaitable[T]]) -> T:`);
    expect(content).toContain(`        ...`);
  });

  it('should generate the correct content for the SQLAlchemy adapter', async () => {
    await uowGenerator(tree, { domain: domainName, language: 'py' });

    const sqlalchemyAdapterPath = `libs/${domainName}/infrastructure/src/lib/adapters/unit_of_work_sqlalchemy_adapter.py`;
    const content = tree.read(sqlalchemyAdapterPath).toString();

    expect(content).toContain(`from typing import TypeVar, Callable, Awaitable`);
    expect(content).toContain(`from sqlalchemy.ext.asyncio import AsyncSession`);
    const snakeCaseDomain = domainName.replace(/-/g, '_');
    expect(content).toContain(`from ${snakeCaseDomain}.domain.ports import IUnitOfWork`);
    expect(content).toContain(`T = TypeVar('T')`);
    expect(content).toContain(`class UnitOfWorkSQLAlchemyAdapter(IUnitOfWork):`);
    expect(content).toContain(`    def __init__(self, session: AsyncSession):`);
    expect(content).toContain(`        self._session = session`);
    expect(content).toContain(`    async def with_transaction(self, work: Callable[[], Awaitable[T]]) -> T:`);
    expect(content).toContain(`        async with self._session.begin():`);
    expect(content).toContain(`            return await work()`);
  });
});
