import os


class SmsSendResult:
    def __init__(self, ok: bool, provider: str, message_sid: str | None = None, error: str | None = None):
        self.ok = ok
        self.provider = provider
        self.message_sid = message_sid
        self.error = error

    def to_dict(self):
        return {
            "ok": self.ok,
            "provider": self.provider,
            "message_sid": self.message_sid,
            "error": self.error,
        }


def _twilio_is_configured() -> bool:
    sid = os.environ.get("TWILIO_ACCOUNT_SID")
    token = os.environ.get("TWILIO_AUTH_TOKEN")
    api_key = os.environ.get("TWILIO_API_KEY")
    api_secret = os.environ.get("TWILIO_API_SECRET")
    phone = os.environ.get("TWILIO_PHONE_NUMBER")

    if not sid or not phone:
        return False

    # Check for valid auth token (not a placeholder)
    has_valid_token = bool(token and "your_auth_token" not in token and "xxxx" not in token)
    
    # Check for valid API keys (not placeholders)
    has_valid_keys = bool(api_key and api_secret and "your_api" not in api_key and "xxxx" not in api_key)

    return has_valid_token or has_valid_keys

import re
def format_phone_number(phone: str) -> str:
    if not phone:
        return phone
    # Remove all non-numeric characters except +
    clean = re.sub(r'[^\d+]', '', phone)
    
    if clean.startswith('+92'):
        return clean
    if clean.startswith('03') and len(clean) == 11:
        return '+92' + clean[1:]
    if clean.startswith('923') and len(clean) == 12:
        return '+' + clean
    if not clean.startswith('+'):
        return '+' + clean
    return clean


def send_sms(to_number: str, body: str) -> SmsSendResult:
    """
    Send an SMS using Twilio if configured; otherwise fall back to a stub.

    Wiring note:
    - Keep this function signature stable; the rest of the app calls this.
    - If env vars are not set, we intentionally do not error — we print a stub message instead.
    """
    if not to_number:
        return SmsSendResult(ok=False, provider="none", error="Missing destination phone number")

    if not _twilio_is_configured():
        print(f"\n{'-'*50}\n[SMS API STUB] Sending SMS to {to_number}: {body}\n{'-'*50}\n")
        return SmsSendResult(ok=True, provider="stub")

    try:
        from twilio.rest import Client  # type: ignore
    except Exception as e:
        # Twilio package not installed or import failed; preserve stub behavior.
        print(
            f"\n{'-'*50}\n[SMS API STUB] Twilio not available ({str(e)}). "
            f"Would send SMS to {to_number}: {body}\n{'-'*50}\n"
        )
        return SmsSendResult(ok=True, provider="stub", error=f"Twilio import failed: {str(e)}")

    to_number = format_phone_number(to_number)

    try:
        # Support both standard auth and API Key auth
        api_key = os.environ.get("TWILIO_API_KEY")
        api_secret = os.environ.get("TWILIO_API_SECRET")
        
        if api_key and api_secret:
            client = Client(
                api_key, 
                api_secret, 
                os.environ["TWILIO_ACCOUNT_SID"]
            )
        else:
            client = Client(
                os.environ["TWILIO_ACCOUNT_SID"], 
                os.environ["TWILIO_AUTH_TOKEN"]
            )
        msg = client.messages.create(
            from_=os.environ["TWILIO_PHONE_NUMBER"],
            to=to_number,
            body=body,
        )
        return SmsSendResult(ok=True, provider="twilio", message_sid=getattr(msg, "sid", None))
    except Exception as e:
        return SmsSendResult(ok=False, provider="twilio", error=str(e))

