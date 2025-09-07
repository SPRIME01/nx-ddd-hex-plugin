import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, names } from '@nx/devkit';
import { hexDomainGenerator } from '../hex-domain/generator';
import { uowGenerator } from './generator';

describe('uowGenerator (TypeScript)', () => {
  let tree: Tree;
  const domainName = 'test-domain';

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await hexDomainGenerator(tree, { name: domainName });
  });

  it('should create the UoW interface and in-memory adapter', async () => {
    await uowGenerator(tree, { domain: domainName, language: 'ts' });

    const uowInterfacePath = `libs/${domainName}/domain/src/lib/ports/unit-of-work.port.ts`;
    const inMemoryAdapterPath = `libs/${domainName}/infrastructure/src/lib/adapters/unit-of-work.in-memory.adapter.ts`;

    expect(tree.exists(uowInterfacePath)).toBe(true);
    expect(tree.exists(inMemoryAdapterPath)).toBe(true);
  });

  it('should generate the correct content for the UoW interface', async () => {
    await uowGenerator(tree, { domain: domainName, language: 'ts' });

    const uowInterfacePath = `libs/${domainName}/domain/src/lib/ports/unit-of-work.port.ts`;
    const content = tree.read(uowInterfacePath).toString();

    expect(content).toContain(`export interface IUnitOfWork {`);
    expect(content).toContain(`withTransaction<T>(work: () => Promise<T>): Promise<T>;`);
    expect(content).toContain(`}`);
  });

  it('should generate the correct content for the in-memory adapter', async () => {
    await uowGenerator(tree, { domain: domainName, language: 'ts' });

    const inMemoryAdapterPath = `libs/${domainName}/infrastructure/src/lib/adapters/unit-of-work.in-memory.adapter.ts`;
    const content = tree.read(inMemoryAdapterPath).toString();

    expect(content).toContain(`import { IUnitOfWork } from '@${domainName}/domain';`);
    expect(content).toContain(`export class UnitOfWorkInMemoryAdapter implements IUnitOfWork {`);
    expect(content).toContain(`withTransaction<T>(work: () => Promise<T>): Promise<T> {`);
    expect(content).toContain(`return work();`);
    expect(content).toContain(`}`);
    expect(content).toContain(`}`);
  });
});
