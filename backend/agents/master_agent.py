"""
Master Agent - Orchestrates all sub-agents in the clinical assistant system
"""
from agents.document_agent import DocumentAgent
from agents.vitals_agent import VitalsAgent
from agents.family_history_agent import FamilyHistoryAgent
from agents.chatbot_agent import ChatbotAgent
from agents.image_agent import ImageAgent
from agents.teeth_agent import TeethAgent

class MasterAgent:
    """Master agent that controls and coordinates all sub-agents"""
    
    def __init__(self):
        self.document_agent = DocumentAgent()
        self.vitals_agent = VitalsAgent()
        self.family_history_agent = FamilyHistoryAgent()
        self.chatbot_agent = ChatbotAgent()
        self.image_agent = ImageAgent()
        self.teeth_agent = TeethAgent()
    
    def get_agent(self, agent_type):
        """Get a specific agent by type"""
        agents = {
            'document': self.document_agent,
            'vitals': self.vitals_agent,
            'family_history': self.family_history_agent,
            'chatbot': self.chatbot_agent,
            'image': self.image_agent,
            'teeth': self.teeth_agent
        }
        return agents.get(agent_type)
    
    def get_patient_context(self, patient_id, db_session):
        """Aggregate all patient information for context"""
        from database import Patient, Document, Vital, FamilyHistory, MedicalImage
        
        patient = db_session.query(Patient).filter_by(id=patient_id).first()
        if not patient:
            return None
        
        context = {
            'patient': patient.to_dict(),
            'documents': [doc.to_dict() for doc in patient.documents],
            'vitals': [vital.to_dict() for vital in patient.vitals],
            'family_history': [fh.to_dict() for fh in patient.family_history],
            'images': [img.to_dict() for img in patient.images],
            'dental_records': [record.to_dict() for record in patient.dental_records]
        }
        
        return context

