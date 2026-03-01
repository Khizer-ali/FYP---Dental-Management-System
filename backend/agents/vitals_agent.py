"""
Vitals Agent - Handles patient vital signs input and storage
"""
from datetime import datetime

class VitalsAgent:
    """Agent responsible for managing patient vital signs"""
    
    def __init__(self):
        self.vital_fields = [
            'temperature', 'weight', 'height',
            'blood_pressure_systolic', 'blood_pressure_diastolic',
            'heart_rate', 'respiratory_rate', 'oxygen_saturation'
        ]
    
    def validate_vitals(self, vitals_data):
        """Validate vital signs data"""
        errors = []
        
        # Temperature validation (Celsius)
        if 'temperature' in vitals_data and vitals_data['temperature']:
            temp = float(vitals_data['temperature'])
            if temp < 30 or temp > 45:
                errors.append("Temperature should be between 30-45°C")
        
        # Weight validation (kg)
        if 'weight' in vitals_data and vitals_data['weight']:
            weight = float(vitals_data['weight'])
            if weight < 0 or weight > 500:
                errors.append("Weight should be between 0-500 kg")
        
        # Height validation (cm)
        if 'height' in vitals_data and vitals_data['height']:
            height = float(vitals_data['height'])
            if height < 0 or height > 300:
                errors.append("Height should be between 0-300 cm")
        
        # Blood pressure validation
        if 'blood_pressure_systolic' in vitals_data and vitals_data['blood_pressure_systolic']:
            bp_sys = int(vitals_data['blood_pressure_systolic'])
            if bp_sys < 50 or bp_sys > 250:
                errors.append("Systolic BP should be between 50-250 mmHg")
        
        if 'blood_pressure_diastolic' in vitals_data and vitals_data['blood_pressure_diastolic']:
            bp_dia = int(vitals_data['blood_pressure_diastolic'])
            if bp_dia < 30 or bp_dia > 150:
                errors.append("Diastolic BP should be between 30-150 mmHg")
        
        # Heart rate validation
        if 'heart_rate' in vitals_data and vitals_data['heart_rate']:
            hr = int(vitals_data['heart_rate'])
            if hr < 30 or hr > 220:
                errors.append("Heart rate should be between 30-220 bpm")
        
        # Respiratory rate validation
        if 'respiratory_rate' in vitals_data and vitals_data['respiratory_rate']:
            rr = int(vitals_data['respiratory_rate'])
            if rr < 8 or rr > 40:
                errors.append("Respiratory rate should be between 8-40 per minute")
        
        # Oxygen saturation validation
        if 'oxygen_saturation' in vitals_data and vitals_data['oxygen_saturation']:
            spo2 = float(vitals_data['oxygen_saturation'])
            if spo2 < 0 or spo2 > 100:
                errors.append("Oxygen saturation should be between 0-100%")
        
        return errors
    
    def store_vitals(self, patient_id, vitals_data, db_session):
        """Store vital signs in database"""
        from database import Vital
        
        # Convert empty strings to None
        for key in vitals_data:
            if vitals_data[key] == '':
                vitals_data[key] = None
        
        vital = Vital(
            patient_id=patient_id,
            temperature=float(vitals_data.get('temperature')) if vitals_data.get('temperature') else None,
            weight=float(vitals_data.get('weight')) if vitals_data.get('weight') else None,
            height=float(vitals_data.get('height')) if vitals_data.get('height') else None,
            blood_pressure_systolic=int(vitals_data.get('blood_pressure_systolic')) if vitals_data.get('blood_pressure_systolic') else None,
            blood_pressure_diastolic=int(vitals_data.get('blood_pressure_diastolic')) if vitals_data.get('blood_pressure_diastolic') else None,
            heart_rate=int(vitals_data.get('heart_rate')) if vitals_data.get('heart_rate') else None,
            respiratory_rate=int(vitals_data.get('respiratory_rate')) if vitals_data.get('respiratory_rate') else None,
            oxygen_saturation=float(vitals_data.get('oxygen_saturation')) if vitals_data.get('oxygen_saturation') else None
        )
        
        db_session.add(vital)
        db_session.commit()
        return vital.to_dict()

