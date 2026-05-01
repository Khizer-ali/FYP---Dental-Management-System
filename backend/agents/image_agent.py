<<<<<<< HEAD
"""
Image Agent - Handles medical image upload and storage
"""
import os

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("Warning: PIL/Pillow not available. Image processing will not work.")

class ImageAgent:
    """Agent responsible for managing medical images"""
    
    def __init__(self):
        self.supported_formats = ['png', 'jpg', 'jpeg', 'dicom', 'dcm']
        self.max_image_size = (2048, 2048)  # Max dimensions
    
    def validate_image(self, file_path):
        """Validate medical image file"""
        if not PIL_AVAILABLE:
            return False, "PIL/Pillow library not installed. Please install it to process images."
        
        try:
            # Try to open and verify it's a valid image
            img = Image.open(file_path)
            img.verify()
            return True, None
        except Exception as e:
            return False, f"Invalid image file: {str(e)}"
    
    def process_image(self, file_path):
        """Process and optionally resize image"""
        if not PIL_AVAILABLE:
            return {'error': 'PIL/Pillow library not installed'}
        
        try:
            img = Image.open(file_path)
            
            # Get image info
            info = {
                'format': img.format,
                'mode': img.mode,
                'size': img.size
            }
            
            # Optionally resize if too large
            if img.size[0] > self.max_image_size[0] or img.size[1] > self.max_image_size[1]:
                img.thumbnail(self.max_image_size, Image.Resampling.LANCZOS)
                img.save(file_path, optimize=True)
                info['resized'] = True
            
            return info
        except Exception as e:
            return {'error': str(e)}
    
    def store_image(self, patient_id, filename, file_path, image_type, description, db_session):
        """Store image metadata in database"""
        from database import MedicalImage
        
        img = MedicalImage(
            patient_id=patient_id,
            filename=filename,
            file_path=file_path,
            image_type=image_type,
            description=description
        )
        
        db_session.add(img)
        db_session.commit()
        return img.to_dict()
    
    def get_image_summary(self, patient_id, db_session):
        """Get summary of all images for a patient"""
        from database import MedicalImage
        
        images = db_session.query(MedicalImage).filter_by(patient_id=patient_id).all()
        
        if not images:
            return "No medical images uploaded."
        
        summary = f"Medical Images ({len(images)} total):\n"
        for img in images:
            summary += f"- {img.filename} ({img.image_type or 'Unknown type'})"
            if img.description:
                summary += f": {img.description}"
            summary += "\n"
        
        return summary

=======
"""
Image Agent - Handles medical image upload and storage
"""
import os

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("Warning: PIL/Pillow not available. Image processing will not work.")

class ImageAgent:
    """Agent responsible for managing medical images"""
    
    def __init__(self):
        self.supported_formats = ['png', 'jpg', 'jpeg', 'dicom', 'dcm']
        self.max_image_size = (2048, 2048)  # Max dimensions
    
    def validate_image(self, file_path):
        """Validate medical image file"""
        if not PIL_AVAILABLE:
            return False, "PIL/Pillow library not installed. Please install it to process images."
        
        try:
            # Try to open and verify it's a valid image
            img = Image.open(file_path)
            img.verify()
            return True, None
        except Exception as e:
            return False, f"Invalid image file: {str(e)}"
    
    def process_image(self, file_path):
        """Process and optionally resize image"""
        if not PIL_AVAILABLE:
            return {'error': 'PIL/Pillow library not installed'}
        
        try:
            img = Image.open(file_path)
            
            # Get image info
            info = {
                'format': img.format,
                'mode': img.mode,
                'size': img.size
            }
            
            # Optionally resize if too large
            if img.size[0] > self.max_image_size[0] or img.size[1] > self.max_image_size[1]:
                img.thumbnail(self.max_image_size, Image.Resampling.LANCZOS)
                img.save(file_path, optimize=True)
                info['resized'] = True
            
            return info
        except Exception as e:
            return {'error': str(e)}
    
    def store_image(self, patient_id, filename, file_path, image_type, description, db_session):
        """Store image metadata in database"""
        from database import MedicalImage
        
        img = MedicalImage(
            patient_id=patient_id,
            filename=filename,
            file_path=file_path,
            image_type=image_type,
            description=description
        )
        
        db_session.add(img)
        db_session.commit()
        return img.to_dict()
    
    def get_image_summary(self, patient_id, db_session):
        """Get summary of all images for a patient"""
        from database import MedicalImage
        
        images = db_session.query(MedicalImage).filter_by(patient_id=patient_id).all()
        
        if not images:
            return "No medical images uploaded."
        
        summary = f"Medical Images ({len(images)} total):\n"
        for img in images:
            summary += f"- {img.filename} ({img.image_type or 'Unknown type'})"
            if img.description:
                summary += f": {img.description}"
            summary += "\n"
        
        return summary

>>>>>>> 21d5d1dd93ec57f1b541daadb89588e7896dc201
