import os
from dotenv import load_dotenv

load_dotenv()

ENVIRONMENT = os.getenv("ENVIRONMENT", "production")
HTTP_PROXY_URL = os.getenv("HTTP_PROXY_URL", "http://127.0.0.1:8889")

if ENVIRONMENT == "development":
    os.environ["HTTP_PROXY"] = HTTP_PROXY_URL
    os.environ["HTTPS_PROXY"] = HTTP_PROXY_URL

MODEL_URL_MAP = {
    "deepseek-reasoner": "https://api.deepseek.com/v1",
    "deepseek-chat": "https://api.deepseek.com",
    "gemini-3-pro-preview": "https://generativelanguage.googleapis.com/v1beta/openai/",
    "gemini-2.5-pro": "https://generativelanguage.googleapis.com/v1beta/openai/",
}

MODEL_CONFIG = {
    "deepseek-reasoner": {
        "provider": "openai",
        "base_url": "https://api.deepseek.com/v1",
    },
    "deepseek-chat": {"provider": "openai", "base_url": "https://api.deepseek.com/v1"},
    "gemini-3-pro-preview": {
        "provider": "google",
    },
    "gemini-2.5-pro": {
        "provider": "google",
    },
}

if ENVIRONMENT == "development":
    PROXIES = {
        "http://": HTTP_PROXY_URL,
        "https://": HTTP_PROXY_URL,
    }
else:
    PROXIES = {}  # 
