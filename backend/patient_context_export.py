import json
import os
from typing import Any


def export_patient_context_json_file(patient_id: int, context: dict[str, Any], base_dir: str = "uploads") -> str:
    """
    Persist patient context to a JSON file and return its path.

    This is used as a lightweight "RAG-style" artifact: the chatbot prompt receives the JSON content
    (and the file is available on disk for inspection/debugging).
    """
    out_dir = os.path.join(base_dir, "contexts")
    os.makedirs(out_dir, exist_ok=True)

    out_path = os.path.join(out_dir, f"patient_{patient_id}_context.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(context, f, ensure_ascii=False, indent=2)

    return out_path

