from sqlmodel import SQLModel


class WebhookQueueResponse(SQLModel):
    status: str
    deployment_id: int
