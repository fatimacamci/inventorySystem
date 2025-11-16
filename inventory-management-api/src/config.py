from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://inventory_user:inventory_password@mysql:3306/inventory_db"
    # Optional explicit fields you might have in .env (uncomment/add as needed)
    SECRET_KEY: str | None = None
    DEBUG: bool = False

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        # allow .env to contain keys not defined on this model
        "extra": "ignore",
    }

settings = Settings()