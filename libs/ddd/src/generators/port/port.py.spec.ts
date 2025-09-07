import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree } from '@nx/devkit';
import { hexDomainGenerator } from '../hex-domain/generator';
import { portGenerator } from './generator';

describe('portGenerator (Python)', () => {
  let tree: Tree;
  const domainName = 'test-domain';
  const portName = 'my_test_port';

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await hexDomainGenerator(tree, { name: domainName });
  });

  it('should create the port protocol and fake adapter', async () => {
    await portGenerator(tree, { name: portName, domain: domainName, language: 'py' });

    const portProtocolPath = `libs/${domainName}/domain/src/lib/ports/${portName}_port.py`;
    const fakeAdapterPath = `libs/${domainName}/infrastructure/src/lib/adapters/${portName}_fake_adapter.py`;

    expect(tree.exists(portProtocolPath)).toBe(true);
    expect(tree.exists(fakeAdapterPath)).toBe(true);
  });

  it('should generate the correct content for the port protocol', async () => {
    await portGenerator(tree, { name: portName, domain: domainName, language: 'py' });

    const portProtocolPath = `libs/${domainName}/domain/src/lib/ports/${portName}_port.py`;
    const content = tree.read(portProtocolPath).toString();

    expect(content).toContain(`from typing import Protocol`);
    expect(content).toContain(`class IMyTestPort(Protocol):`);
    expect(content).toContain(`    # Add methods here`);
    expect(content).toContain(`    pass`);
  });

  it('should generate the correct content for the fake adapter', async () => {
    await portGenerator(tree, { name: portName, domain: domainName, language: 'py' });

    const fakeAdapterPath = `libs/${domainName}/infrastructure/src/lib/adapters/${portName}_fake_adapter.py`;
    const content = tree.read(fakeAdapterPath).toString();

    const snakeCaseDomain = domainName.replace(/-/g, '_');
    expect(content).toContain(`from ${snakeCaseDomain}.domain.ports import IMyTestPort`);
    expect(content).toContain(`class MyTestPortFakeAdapter(IMyTestPort):`);
    expect(content).toContain(`    # Implement methods here`);
    expect(content).toContain(`    pass`);
  });
});
