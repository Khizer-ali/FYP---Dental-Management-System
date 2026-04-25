"""
Chatbot Agent - Medical chatbot that uses patient context for responses.
Uses Google Gemini API. You can EITHER:
- paste your API key into API_KEY below, OR
- set GEMINI_API_KEY / GOOGLE_API_KEY in the environment.
"""
import os
import json

# Paste your Gemini API key here if you don't want to use .env/env vars.
# Example: API_KEY = "AIza...."
API_KEY = ""

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

class ChatbotAgent:
    """Agent responsible for medical chatbot functionality using Gemini API."""

    def __init__(self):
        # Pick a model that exists for the configured API key.
        # (Some older model names like gemini-1.5-flash may no longer be available.)
        self.model_name = os.environ.get("GEMINI_MODEL", "").strip() or "models/gemini-flash-latest"
        self.chatbot = None  # Truthy when Gemini is configured and ready
        # Prefer hard-coded API_KEY if you pasted it above, otherwise fall back to env vars.
        # Strip to avoid treating whitespace as a "real" key.
        hardcoded = (API_KEY or "").strip()
        env_key = (os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or "").strip()
        self._api_key = hardcoded or env_key

        if GEMINI_AVAILABLE and self._api_key:
            self._initialize_model()
        else:
            if not GEMINI_AVAILABLE:
                print("Warning: google-generativeai not installed. Using fallback responses.")
            elif not self._api_key:
                print("Warning: GEMINI_API_KEY (or GOOGLE_API_KEY) not set. Using fallback responses.")

    def _initialize_model(self):
        """Initialize the Gemini model."""
        try:
            genai.configure(api_key=self._api_key)
            # If a model name is wrong/expired, fall back to a known good default.
            try:
                self.chatbot = genai.GenerativeModel(self.model_name)
            except Exception:
                self.model_name = "models/gemini-flash-latest"
                self.chatbot = genai.GenerativeModel(self.model_name)
            print(f"Chatbot ready: {self.model_name}")
        except Exception as e:
            print(f"Warning: Could not initialize Gemini: {str(e)}")
            self.chatbot = None

    def build_context(self, patient_context):
        """
        Build context for the model.

        Requirement: patient information should be converted to a JSON file automatically and used as context.
        We persist that JSON file in `MasterAgent.get_patient_context()` and pass the JSON *content* into the prompt.
        """
        try:
            # Keep full JSON for faithful context; Gemini can handle this size for typical records.
            return json.dumps(patient_context, ensure_ascii=False, indent=2)
        except Exception:
            # Last-resort fallback
            return str(patient_context)

    def generate_response(self, question, patient_context):
        """Generate response to user question using patient context."""
        context = self.build_context(patient_context)

        prompt = f"""You are a helpful medical/dental assistant. Use ONLY the following patient context to answer. Do not make up information. If the context does not contain the answer, say so briefly.

Patient Context (JSON):
{context}

Question: {question}

Answer concisely (2-4 sentences):"""

        if self.chatbot:
            try:
                # Use a simple dict for generation_config to avoid version-specific
                # GenerationConfig class issues.
                response = self.chatbot.generate_content(
                    prompt,
                    generation_config={
                        "max_output_tokens": 256,
                        "temperature": 0.4,
                    },
                )
                if getattr(response, "text", None):
                    return response.text.strip()[:500]
            except Exception as e:
                # Surface the Gemini error in the UI instead of always falling back,
                # so it's clear why the model isn't responding.
                return f"Gemini error while generating response: {str(e)}"

        return self._fallback_response(question, context)

    def _fallback_response(self, question, context):
        """Fallback when Gemini is not available or request fails."""
        question_lower = question.lower()

        if any(word in question_lower for word in ['temperature', 'fever', 'temp']):
            return "Based on the patient's vital signs, I can see their temperature readings. Please review the latest vitals for current temperature status."

        if any(word in question_lower for word in ['weight', 'bmi', 'body mass']):
            return "The patient's weight and height measurements are available in their vital signs. You can calculate BMI using weight (kg) / height (m)²."

        if any(word in question_lower for word in ['blood pressure', 'bp', 'hypertension']):
            return "Blood pressure readings are recorded in the patient's vital signs. Please check the latest measurements for current status."

        if any(word in question_lower for word in ['family history', 'genetic', 'hereditary']):
            return "Family history information is available in the patient's records. Please review the family history section for details."

        if any(word in question_lower for word in ['document', 'report', 'test result']):
            return "Medical documents and reports have been uploaded and parsed. Please review the documents section for detailed information."

        return f"I have access to the patient's medical records including documents, vital signs, and family history. Based on the context: {context[:200]}... How can I help you with this patient's care?"
