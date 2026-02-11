import os

os.environ["HTTP_PROXY"] = "http://127.0.0.1:8889"
os.environ["HTTPS_PROXY"] = "http://127.0.0.1:8889"

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

PROXIES = {
    "http://": "http://127.0.0.1:8889",
    "https://": "http://127.0.0.1:8889",
}
