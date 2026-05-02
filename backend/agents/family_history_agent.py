"""
Family History Agent - Handles patient family history input and storage
"""

class FamilyHistoryAgent:
    """Agent responsible for managing patient family history"""
    
    def __init__(self):
        self.common_relations = [
            'Mother', 'Father', 'Sister', 'Brother',
            'Maternal Grandmother', 'Maternal Grandfather',
            'Paternal Grandmother', 'Paternal Grandfather',
            'Aunt', 'Uncle', 'Cousin', 'Other'
        ]
    
    def validate_family_history(self, history_data):
        """Validate family history data"""
        errors = []
        
        if not history_data.get('condition'):
            errors.append("Condition is required")
        
        if history_data.get('age_of_onset'):
            try:
                age = int(history_data['age_of_onset'])
                if age < 0 or age > 150:
                    errors.append("Age of onset should be between 0-150 years")
            except ValueError:
                errors.append("Age of onset must be a valid number")
        
        return errors
    
    def store_family_history(self, patient_id, history_data, db_session):
        """Store family history in database"""
        from database import FamilyHistory
        
        fh = FamilyHistory(
            patient_id=patient_id,
            condition=history_data.get('condition', ''),
            relation=history_data.get('relation'),
            age_of_onset=int(history_data.get('age_of_onset')) if history_data.get('age_of_onset') else None,
            notes=history_data.get('notes')
        )
        
        db_session.add(fh)
        db_session.commit()
        return fh.to_dict()
    
    def get_family_history_summary(self, patient_id, db_session):
        """Get formatted family history summary for a patient"""
        from database import FamilyHistory
        
        histories = db_session.query(FamilyHistory).filter_by(patient_id=patient_id).all()
        
        if not histories:
            return "No family history recorded."
        
        summary = "Family History:\n"
        for h in histories:
            summary += f"- {h.condition}"
            if h.relation:
                summary += f" ({h.relation})"
            if h.age_of_onset:
                summary += f" - Onset at age {h.age_of_onset}"
            if h.notes:
                summary += f" - Notes: {h.notes}"
            summary += "\n"
        
        return summary

