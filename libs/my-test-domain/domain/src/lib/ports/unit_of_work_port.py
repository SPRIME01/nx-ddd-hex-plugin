from typing import Protocol, TypeVar, Callable, Awaitable

T = TypeVar('T')

class IUnitOfWork(Protocol):
    async def with_transaction(self, work: Callable[[], Awaitable[T]]) -> T:
        ...