from typing import Type, Callable, Dict, List
from my-test-domain.domain.ports import IEventBus

class EventBusInMemoryAdapter(IEventBus):
    def __init__(self) -> None:
        self._handlers: Dict[Type, List[Callable]] = {}

    def publish(self, event: object) -> None:
        event_type = type(event)
        if event_type in self._handlers:
            for handler in self._handlers[event_type]:
                handler(event)

    def subscribe(self, event_type: Type, handler: Callable) -> None:
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        self._handlers[event_type].append(handler)