export interface IEventBus {
  publish(event: any): void;
  subscribe(event: any, handler: any): void;
}
