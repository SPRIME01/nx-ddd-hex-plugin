import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, names } from '@nx/devkit';
import { hexDomainGenerator } from '../hex-domain/generator';
import { portGenerator } from './generator';

describe('portGenerator (TypeScript)', () => {
  let tree: Tree;
  const domainName = 'test-domain';
  const portName = 'my-test-port';

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await hexDomainGenerator(tree, { name: domainName });
  });

  it('should create the port interface and in-memory adapter', async () => {
    await portGenerator(tree, { name: portName, domain: domainName, language: 'ts' });

    const propertyName = names(portName).propertyName;
    const portInterfacePath = `libs/${domainName}/domain/src/lib/ports/${propertyName}.port.ts`;
    const inMemoryAdapterPath = `libs/${domainName}/infrastructure/src/lib/adapters/${propertyName}.in-memory.adapter.ts`;

    expect(tree.exists(portInterfacePath)).toBe(true);
    expect(tree.exists(inMemoryAdapterPath)).toBe(true);
  });

  it('should generate the correct content for the port interface', async () => {
    await portGenerator(tree, { name: portName, domain: domainName, language: 'ts' });

    const propertyName = names(portName).propertyName;
    const portInterfacePath = `libs/${domainName}/domain/src/lib/ports/${propertyName}.port.ts`;
    const content = tree.read(portInterfacePath).toString();

    const classifiedName = names(portName).className;
    expect(content).toContain(`export interface I${classifiedName} {`);
    expect(content).toContain(`// Add methods here`);
    expect(content).toContain(`}`);
  });

  it('should generate the correct content for the in-memory adapter', async () => {
    await portGenerator(tree, { name: portName, domain: domainName, language: 'ts' });

    const propertyName = names(portName).propertyName;
    const inMemoryAdapterPath = `libs/${domainName}/infrastructure/src/lib/adapters/${propertyName}.in-memory.adapter.ts`;
    const content = tree.read(inMemoryAdapterPath).toString();

    const classifiedName = names(portName).className;
    expect(content).toContain(`import { I${classifiedName} } from '@${domainName}/domain';`);
    expect(content).toContain(`export class ${classifiedName}InMemoryAdapter implements I${classifiedName} {`);
    expect(content).toContain(`// Implement methods here`);
    expect(content).toContain(`}`);
  });
});
