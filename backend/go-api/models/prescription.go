package models

// DosageInstruction captures the structured data for a single drug's schedule
type DosageInstruction struct {
	DrugName        string `json:"drug_name"`         // e.g., "Paracetamol"
	DrugType        string `json:"drug_type"`         // e.g., "Tablet" or "Syrup"
	Strength        string `json:"strength"`          // e.g., "500 mg"
	Frequency       string `json:"frequency"`         // e.g., "Morning, Night"
	TimingRelation  string `json:"timing_relation"`   // e.g., "After Food"
	TimeOffset      int    `json:"time_offset"`       // e.g., 30 (minutes)
	DosageQuantity  string `json:"dosage_quantity"`   // e.g., "1 Tablet"
	DurationDays    int    `json:"duration_days"`
	PatientNote     string `json:"patient_note"`
}

// Prescription represents the complete digital prescription record.
type Prescription struct {
	ID                string              `json:"id"`
	PatientID         string              `json:"patient_id"`        // Link to the Patient's record
	ClinicID          string              `json:"clinic_id"`         // Link to the Clinic that issued it
	Diagnosis         string              `json:"diagnosis"`
	Vitals            map[string]string   `json:"vitals"`            // BP, Heart Rate, etc.
	Instructions      []DosageInstruction `json:"instructions"`      // The core medication data
	// AI-Processed Fields for the Patient App
	OriginalDoctorText string `json:"original_doctor_text"`   // Available for validation
	TranslatedText     string `json:"translated_text"`        // In patient's Regional Language
	AudioFileURL       string `json:"audio_file_url"`         // Narration of dosage/timing
	CreatedAt         int64  `json:"created_at"`
}

// AdherenceRequest defines the structure for logging adherence.
type AdherenceRequest struct {
	PrescriptionID string `json:"prescription_id" binding:"required"`
	DoseTime       int64  `json:"dose_time" binding:"required"` // Timestamp when dose was taken
}