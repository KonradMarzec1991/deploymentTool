"""initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-02-09 00:45:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0001_initial_schema"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "repository",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("git_url", sa.String(length=500), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_repository_name"), "repository", ["name"])

    op.create_table(
        "user",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("provider", sa.String(length=50), nullable=False),
        sa.Column("provider_login", sa.String(length=200), nullable=False),
        sa.Column("provider_id", sa.String(length=50), nullable=True),
        sa.Column("email", sa.String(length=320), nullable=True),
        sa.Column("password_hash", sa.String(length=255), nullable=True),
        sa.Column("role", sa.String(length=50), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_user_provider_id"), "user", ["provider_id"])
    op.create_index(op.f("ix_user_provider_login"), "user", ["provider_login"])

    op.create_table(
        "deployment",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("repo_id", sa.Integer(), nullable=False),
        sa.Column("env", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["repo_id"], ["repository.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_deployment_repo_id"), "deployment", ["repo_id"])
    op.create_index(op.f("ix_deployment_status"), "deployment", ["status"])


def downgrade() -> None:
    op.drop_index(op.f("ix_deployment_status"), table_name="deployment")
    op.drop_index(op.f("ix_deployment_repo_id"), table_name="deployment")
    op.drop_table("deployment")
    op.drop_index(op.f("ix_user_provider_login"), table_name="user")
    op.drop_index(op.f("ix_user_provider_id"), table_name="user")
    op.drop_table("user")
    op.drop_index(op.f("ix_repository_name"), table_name="repository")
    op.drop_table("repository")
