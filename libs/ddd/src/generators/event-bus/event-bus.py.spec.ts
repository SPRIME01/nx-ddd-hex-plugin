import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree } from '@nx/devkit';
import { hexDomainGenerator } from '../hex-domain/generator';
import { eventBusGenerator } from './generator';

describe('eventBusGenerator (Python)', () => {
  let tree: Tree;
  const domainName = 'test-domain';

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await hexDomainGenerator(tree, { name: domainName });
  });

  it('should create the Event Bus protocol and in-memory adapter', async () => {
    await eventBusGenerator(tree, { domain: domainName, language: 'py' });

    const eventBusProtocolPath = `libs/${domainName}/domain/src/lib/ports/event_bus_port.py`;
    const inMemoryAdapterPath = `libs/${domainName}/infrastructure/src/lib/adapters/event_bus_in_memory_adapter.py`;

    expect(tree.exists(eventBusProtocolPath)).toBe(true);
    expect(tree.exists(inMemoryAdapterPath)).toBe(true);
  });

  it('should generate the correct content for the Event Bus protocol', async () => {
    await eventBusGenerator(tree, { domain: domainName, language: 'py' });

    const eventBusProtocolPath = `libs/${domainName}/domain/src/lib/ports/event_bus_port.py`;
    const content = tree.read(eventBusProtocolPath).toString();

    expect(content).toContain(`from typing import Protocol, Type, Callable`);
    expect(content).toContain(`class IEventBus(Protocol):`);
    expect(content).toContain(`    def publish(self, event: object) -> None:`);
    expect(content).toContain(`        ...`);
    expect(content).toContain(`    def subscribe(self, event_type: Type, handler: Callable) -> None:`);
    expect(content).toContain(`        ...`);
  });

  it('should generate the correct content for the in-memory adapter', async () => {
    await eventBusGenerator(tree, { domain: domainName, language: 'py' });

    const inMemoryAdapterPath = `libs/${domainName}/infrastructure/src/lib/adapters/event_bus_in_memory_adapter.py`;
    const content = tree.read(inMemoryAdapterPath).toString();

    expect(content).toContain(`from typing import Type, Callable, Dict, List`);
    const snakeCaseDomain = domainName.replace(/-/g, '_');
    expect(content).toContain(`from ${snakeCaseDomain}.domain.ports import IEventBus`);
    expect(content).toContain(`class EventBusInMemoryAdapter(IEventBus):`);
    expect(content).toContain(`    def __init__(self) -> None:`);
    expect(content).toContain(`        self._handlers: Dict[Type, List[Callable]] = {}`);
    expect(content).toContain(`    def publish(self, event: object) -> None:`);
    expect(content).toContain(`        event_type = type(event)`);
    expect(content).toContain(`        if event_type in self._handlers:`);
    expect(content).toContain(`            for handler in self._handlers[event_type]:`);
    expect(content).toContain(`                handler(event)`);
    expect(content).toContain(`    def subscribe(self, event_type: Type, handler: Callable) -> None:`);
    expect(content).toContain(`        if event_type not in self._handlers:`);
    expect(content).toContain(`            self._handlers[event_type] = []`);
    expect(content).toContain(`        self._handlers[event_type].append(handler)`);
  });
});
