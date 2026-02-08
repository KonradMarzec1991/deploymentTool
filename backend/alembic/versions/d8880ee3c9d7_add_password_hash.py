"""add password hash

Revision ID: d8880ee3c9d7
Revises:
Create Date: 2026-02-09 00:34:31.083128

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy import inspect

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "d8880ee3c9d7"
down_revision: Union[str, Sequence[str], None] = "0001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if "user" not in inspector.get_table_names():
        return
    columns = {col["name"] for col in inspector.get_columns("user")}
    if "password_hash" in columns:
        return
    op.add_column(
        "user",
        sa.Column("password_hash", sa.String(length=255), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if "user" not in inspector.get_table_names():
        return
    columns = {col["name"] for col in inspector.get_columns("user")}
    if "password_hash" not in columns:
        return
    op.drop_column("user", "password_hash")
