"""
Declarative base for all SQLAlchemy models.
Import this in every model file so Alembic can auto-detect them.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Shared base class — all ORM models inherit from this."""
    pass
