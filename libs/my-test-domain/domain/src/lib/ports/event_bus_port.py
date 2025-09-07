from typing import Protocol, Type, Callable

class IEventBus(Protocol):
    def publish(self, event: object) -> None:
        ...
    def subscribe(self, event_type: Type, handler: Callable) -> None:
        ...