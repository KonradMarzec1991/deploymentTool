"""add created_at to repository

Revision ID: 7f3c2d9e1a4b
Revises: ec9d0b4f16f9
Create Date: 2026-02-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7f3c2d9e1a4b"
down_revision: Union[str, Sequence[str], None] = "ec9d0b4f16f9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add as nullable with DB default so existing rows can be backfilled safely.
    op.add_column(
        "repository",
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=True,
            server_default=sa.text("now()"),
        ),
    )

    # Ensure any pre-existing NULLs are populated before tightening constraint.
    op.execute("UPDATE repository SET created_at = now() WHERE created_at IS NULL")

    op.alter_column("repository", "created_at", nullable=False)
    op.alter_column("repository", "created_at", server_default=None)


def downgrade() -> None:
    op.drop_column("repository", "created_at")
