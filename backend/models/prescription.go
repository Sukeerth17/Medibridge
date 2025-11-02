package models

// DosageInstruction captures the structured data for a single drug's schedule [cite: 67]
type DosageInstruction struct {
	DrugName        string `json:"drug_name"`         // e.g., "Paracetamol" [cite: 21]
	DrugType        string `json:"drug_type"`         // e.g., "Tablet" or "Syrup" [cite: 21]
	Strength        string `json:"strength"`          // e.g., "500 mg" [cite: 21]
	Frequency       string `json:"frequency"`         // e.g., "Morning, Night" [cite: 22]
	TimingRelation  string `json:"timing_relation"`   // e.g., "After Food" [cite: 23]
	TimeOffset      int    `json:"time_offset"`       // e.g., 30 (minutes) [cite: 24]
	DosageQuantity  string `json:"dosage_quantity"`   // e.g., "1 Tablet"
	DurationDays    int    `json:"duration_days"`
	PatientNote     string `json:"patient_note"`
}

// Prescription represents the complete digital prescription record.
type Prescription struct {
	ID                string              `json:"id"`
	PatientID         string              `json:"patient_id"`        // Link to the Patient's record [cite: 116]
	ClinicID          string              `json:"clinic_id"`         // Link to the Clinic that issued it [cite: 113]
	Diagnosis         string              `json:"diagnosis"`         // [cite: 25]
	Vitals            map[string]string   `json:"vitals"`            // BP, Heart Rate, etc. [cite: 25]
	Instructions      []DosageInstruction `json:"instructions"`      // The core medication data
	
	// AI-Processed Fields for the Patient App
	OriginalDoctorText string `json:"original_doctor_text"`   // Available for validation [cite: 6]
	TranslatedText     string `json:"translated_text"`      // In patient's Regional Language [cite: 4]
	AudioFileURL       string `json:"audio_file_url"`       // Narration of dosage/timing [cite: 48]
	
	CreatedAt         int64  `json:"created_at"`
}