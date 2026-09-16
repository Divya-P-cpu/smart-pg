# pyrefly: ignore [missing-import]
import urllib.parse
from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    db_user: str = "root"
    db_password: str = ""
    db_host: str = "localhost"
    db_port: int = 3306
    db_name: str = "smart_pg"
    db_ssl: bool = False
    database_url_custom: Optional[str] = Field(default=None, validation_alias="DATABASE_URL")
    SECRET_KEY: str = "change-this-secret"
        
    @property
    def database_url(self) -> str:
        if self.database_url_custom:
            return self.database_url_custom

        encoded_user = urllib.parse.quote_plus(self.db_user)
        encoded_password = urllib.parse.quote_plus(self.db_password)

        url = f"mysql+pymysql://{encoded_user}:{encoded_password}@{self.db_host}:{self.db_port}/{self.db_name}"
        if self.db_ssl:
            url += "?ssl_verify_cert=true&ssl_verify_identity=true"
        return url

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()