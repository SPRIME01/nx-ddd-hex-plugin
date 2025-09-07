from typing import TypeVar, Callable, Awaitable
from sqlalchemy.ext.asyncio import AsyncSession
from my-test-domain.domain.ports import IUnitOfWork

T = TypeVar('T')

class UnitOfWorkSQLAlchemyAdapter(IUnitOfWork):
    def __init__(self, session: AsyncSession):
        self._session = session

    async def with_transaction(self, work: Callable[[], Awaitable[T]]) -> T:
        async with self._session.begin():
            return await work()