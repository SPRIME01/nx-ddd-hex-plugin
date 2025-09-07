import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree } from '@nx/devkit';
import { hexDomainGenerator } from '../hex-domain/generator';
import { eventBusGenerator } from './generator';

describe('eventBusGenerator (TypeScript)', () => {
  let tree: Tree;
  const domainName = 'test-domain';

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await hexDomainGenerator(tree, { name: domainName });
  });

  it('should create the Event Bus interface and in-memory adapter', async () => {
    await eventBusGenerator(tree, { domain: domainName, language: 'ts' });

    const eventBusInterfacePath = `libs/${domainName}/domain/src/lib/ports/event-bus.port.ts`;
    const inMemoryAdapterPath = `libs/${domainName}/infrastructure/src/lib/adapters/event-bus.in-memory.adapter.ts`;

    expect(tree.exists(eventBusInterfacePath)).toBe(true);
    expect(tree.exists(inMemoryAdapterPath)).toBe(true);
  });

  it('should generate the correct content for the Event Bus interface', async () => {
    await eventBusGenerator(tree, { domain: domainName, language: 'ts' });

    const eventBusInterfacePath = `libs/${domainName}/domain/src/lib/ports/event-bus.port.ts`;
    const content = tree.read(eventBusInterfacePath).toString();

    expect(content).toContain(`export interface IEventBus {`);
    expect(content).toContain(`publish(event: any): void;`);
    expect(content).toContain(`subscribe(event: any, handler: any): void;`);
    expect(content).toContain(`}`);
  });

  it('should generate the correct content for the in-memory adapter', async () => {
    await eventBusGenerator(tree, { domain: domainName, language: 'ts' });

    const inMemoryAdapterPath = `libs/${domainName}/infrastructure/src/lib/adapters/event-bus.in-memory.adapter.ts`;
    const content = tree.read(inMemoryAdapterPath).toString();

    expect(content).toContain(`import { IEventBus } from '@${domainName}/domain';`);
    expect(content).toContain(`export class EventBusInMemoryAdapter implements IEventBus {`);
    expect(content).toContain(`private handlers: Map<string, any[]> = new Map();`);
    expect(content).toContain(`publish(event: any): void {`);
    expect(content).toContain(`const eventName = event.constructor.name;`);
    expect(content).toContain(`const eventHandlers = this.handlers.get(eventName);`);
    expect(content).toContain(`if (eventHandlers) {`);
    expect(content).toContain(`eventHandlers.forEach((handler) => handler(event));`);
    expect(content).toContain(`}`);
    expect(content).toContain(`}`);
    expect(content).toContain(`subscribe(event: any, handler: any): void {`);
    expect(content).toContain(`const eventName = event.name;`);
    expect(content).toContain(`if (!this.handlers.has(eventName)) {`);
    expect(content).toContain(`this.handlers.set(eventName, []);`);
    expect(content).toContain(`}`);
    expect(content).toContain(`this.handlers.get(eventName).push(handler);`);
    expect(content).toContain(`}`);
    expect(content).toContain(`}`);
  });
});
