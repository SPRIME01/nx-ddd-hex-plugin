import { IEventBus } from '@my-test-domain/domain';

export class EventBusInMemoryAdapter implements IEventBus {
  private handlers: Map<string, any[]> = new Map();

  publish(event: any): void {
    const eventName = event.constructor.name;
    const eventHandlers = this.handlers.get(eventName);
    if (eventHandlers) {
      eventHandlers.forEach((handler) => handler(event));
    }
  }

  subscribe(event: any, handler: any): void {
    const eventName = event.name;
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName).push(handler);
  }
}
