"""
Teeth Agent - Handles dental x-ray annotations for each tooth
"""
from typing import Dict, Tuple

class TeethAgent:
    """Agent responsible for storing and retrieving tooth-level findings."""
    
    def __init__(self):
        self.allowed_conditions = {'root', 'cavity', 'both', 'healthy', 'decay', 'filling', 'crown', 'missing', 'root_canal'}
        self.valid_tooth_ids = {f"t{q}{i}" for q in [1, 2, 3, 4] for i in range(1, 9)}
    
    def _normalize_condition(self, condition: str) -> str:
        """Normalize and validate condition strings."""
        if not condition:
            return ''
        condition = condition.strip().lower()
        return condition if condition in self.allowed_conditions else ''
    
    def _is_valid_tooth(self, tooth_id: str) -> bool:
        return isinstance(tooth_id, str) and (tooth_id.lower() in self.valid_tooth_ids or tooth_id.lower() == 'general_notes')
    
    def update_tooth_condition(self, patient_id: int, tooth_id: str, condition: str, db_session) -> Tuple[Dict, int]:
        """Create, update, or delete a tooth condition entry."""
        from database import DentalAssessment
        
        if not self._is_valid_tooth(tooth_id):
            return {'error': 'Invalid tooth identifier'}, 400
        
        if tooth_id.lower() == 'general_notes':
            normalized_condition = condition # Don't normalize notes
        else:
            normalized_condition = self._normalize_condition(condition)
        tooth_id = tooth_id.lower()
        
        record = (
            db_session.query(DentalAssessment)
            .filter_by(patient_id=patient_id, tooth_id=tooth_id)
            .first()
        )
        
        if not normalized_condition:
            if record:
                db_session.delete(record)
                db_session.commit()
            return {'tooth_id': tooth_id, 'condition': None, 'action': 'removed'}, 200
        
        if record:
            record.condition = normalized_condition
        else:
            record = DentalAssessment(
                patient_id=patient_id,
                tooth_id=tooth_id,
                condition=normalized_condition
            )
            db_session.add(record)
        
        db_session.commit()
        return {'tooth_id': tooth_id, 'condition': record.condition, 'action': 'saved'}, 200
    
    def get_teeth(self, patient_id: int, db_session) -> Dict[str, str]:
        """Return a mapping of tooth_id to condition for a patient."""
        from database import DentalAssessment
        
        records = (
            db_session.query(DentalAssessment)
            .filter_by(patient_id=patient_id)
            .all()
        )
        
        return {record.tooth_id: record.condition for record in records}
    
    def summarize_teeth(self, patient_id: int, db_session) -> str:
        """Provide a summary string of dental findings."""
        records = self.get_teeth(patient_id, db_session)
        if not records:
            return "No dental findings recorded."
        
        parts = [f"{tooth.upper()}: {condition}" for tooth, condition in sorted(records.items())]
        return "Dental Findings:\n" + "\n".join(parts)

