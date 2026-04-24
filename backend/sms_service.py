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
    return bool(
        os.environ.get("TWILIO_ACCOUNT_SID")
        and os.environ.get("TWILIO_AUTH_TOKEN")
        and os.environ.get("TWILIO_FROM_NUMBER")
    )


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

    try:
        client = Client(os.environ["TWILIO_ACCOUNT_SID"], os.environ["TWILIO_AUTH_TOKEN"])
        msg = client.messages.create(
            from_=os.environ["TWILIO_FROM_NUMBER"],
            to=to_number,
            body=body,
        )
        return SmsSendResult(ok=True, provider="twilio", message_sid=getattr(msg, "sid", None))
    except Exception as e:
        return SmsSendResult(ok=False, provider="twilio", error=str(e))

