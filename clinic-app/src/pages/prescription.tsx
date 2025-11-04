import React, { useState, useEffect } from 'react';
import DosageMatrix from '../components/DosageMatrix';
import DrugSearch from '../components/DrugSearch';

type Patient = { id: string; name: string; age?: number };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function PrescriptionPage() {
  const [query, setQuery] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const [clinicTemplate, setClinicTemplate] = useState({ clinicName: '', doctorName: '', doctorType: '', signatureUrl: '' })
  const [vitals, setVitals] = useState({ bp: '', hr: '', temp: '' })
  const [diagnosis, setDiagnosis] = useState('')
  const [allergies, setAllergies] = useState('')
  const [drugs, setDrugs] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch patients from backend
  useEffect(() => {
    if (!query || query.length < 2) {
      setPatients([])
      return
    }

    const fetchPatients = async () => {
      try {
        const response = await fetch(`${API_URL}/v1/clinic/patients/search?q=${encodeURIComponent(query)}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setPatients(data.results || [])
        }
      } catch (error) {
        console.error('Failed to fetch patients:', error)
      }
    }

    const timeoutId = setTimeout(fetchPatients, 300)
    return () => clearTimeout(timeoutId)
  }, [query])

  function handleDrugSelect(drug: any) {
    setDrugs((d) => [
      ...d,
      { 
        id: Date.now(), 
        name: drug.name, 
        type: drug.type || 'Tablet', 
        strength: drug.strength || '', 
        frequency: { morning: false, afternoon: false, evening: false, night: false }, 
        timingRelation: 'After Food', 
        timeOffsetMinutes: 0, 
        notes: '' 
      },
    ])
  }

  function updateDrug(i: number, patch: any) {
    setDrugs((arr) => arr.map((x, idx) => (idx === i ? { ...x, ...patch } : x)))
  }

  function removeDrug(i: number) {
    setDrugs((arr) => arr.filter((_, idx) => idx !== i))
  }

  function buildPayload() {
    if (!selectedPatient) {
      alert('Please select a patient')
      return null
    }

    if (drugs.length === 0) {
      alert('Please add at least one drug')
      return null
    }

    // Convert frequency object to array of strings
    const instructions = drugs.map(drug => {
      const frequencyArray = [];
      if (drug.frequency.morning) frequencyArray.push('Morning');
      if (drug.frequency.afternoon) frequencyArray.push('Afternoon');
      if (drug.frequency.evening) frequencyArray.push('Evening');
      if (drug.frequency.night) frequencyArray.push('Night');

      return {
        drug_name: drug.name,
        drug_type: drug.type,
        strength: drug.strength,
        frequency: frequencyArray.join(', '),
        timing_relation: drug.timingRelation,
        time_offset: drug.timeOffsetMinutes,
        dosage_quantity: '1', // Default
        duration_days: 7, // Default
        patient_note: drug.notes
      };
    });

    return {
      patient_id: selectedPatient.id,
      clinic_id: localStorage.getItem('user_id') || 'CLI002',
      diagnosis,
      vitals,
      instructions,
      original_doctor_text: diagnosis,
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const payload = buildPayload()
    if (!payload) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/v1/clinic/prescriptions/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        alert('Prescription submitted successfully!')
        setDrugs([])
        setDiagnosis('')
        setAllergies('')
        setVitals({ bp: '', hr: '', temp: '' })
        setSelectedPatient(null)
        setQuery('')
      } else {
        const error = await response.json()
        alert(`Failed to submit: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('Network error. Make sure backend is running on port 8080.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        <section className="col-span-4 bg-white rounded-2xl p-4 shadow">
          <h2 className="font-semibold mb-3">Clinic Template</h2>
          <input value={clinicTemplate.clinicName} onChange={(e) => setClinicTemplate({ ...clinicTemplate, clinicName: e.target.value })} className="w-full p-2 border rounded mb-2" placeholder="Clinic Name" />
          <input value={clinicTemplate.doctorName} onChange={(e) => setClinicTemplate({ ...clinicTemplate, doctorName: e.target.value })} className="w-full p-2 border rounded mb-2" placeholder="Doctor Name" />
          <input value={clinicTemplate.doctorType} onChange={(e) => setClinicTemplate({ ...clinicTemplate, doctorType: e.target.value })} className="w-full p-2 border rounded mb-2" placeholder="Specialty" />
          <input value={clinicTemplate.signatureUrl} onChange={(e) => setClinicTemplate({ ...clinicTemplate, signatureUrl: e.target.value })} className="w-full p-2 border rounded" placeholder="Signature image URL" />

          <div className="mt-4">
            <h3 className="font-medium mb-2">Drug Database</h3>
            <DrugSearch onSelectDrug={handleDrugSelect} />
          </div>

          <div className="mt-4">
            <h3 className="font-medium">Quick Actions</h3>
            <div className="mt-2 flex flex-col gap-2">
              <button onClick={() => { setDrugs([]); setDiagnosis(''); setAllergies('') }} className="px-3 py-2 bg-gray-100 rounded">Clear Consultation</button>
            </div>
          </div>
        </section>

        <main className="col-span-5 bg-white rounded-2xl p-6 shadow">
          <div>
            <label className="text-sm text-gray-600">Search Patient</label>
            <div className="flex gap-2 mt-2">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name or ID" className="flex-1 p-2 border rounded" />
              <button onClick={() => setQuery('')} className="px-3 py-2 bg-gray-100 rounded">Clear</button>
            </div>

            {patients.length > 0 && (
              <ul className="mt-3 max-h-36 overflow-auto border rounded">
                {patients.map((p) => (
                  <li key={p.id} onClick={() => setSelectedPatient(p)} className={`p-2 cursor-pointer ${selectedPatient?.id === p.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-gray-50'}`}>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500">ID: {p.id}</div>
                  </li>
                ))}
              </ul>
            )}

            {selectedPatient && <div className="mt-3 p-3 bg-indigo-50 rounded">Selected: <b>{selectedPatient.name}</b> — {selectedPatient.id}</div>}
          </div>

          <form onSubmit={submit} className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <input value={vitals.bp} onChange={(e) => setVitals({ ...vitals, bp: e.target.value })} placeholder="BP" className="p-2 border rounded" />
              <input value={vitals.hr} onChange={(e) => setVitals({ ...vitals, hr: e.target.value })} placeholder="Heart Rate" className="p-2 border rounded" />
              <input value={vitals.temp} onChange={(e) => setVitals({ ...vitals, temp: e.target.value })} placeholder="Temp" className="p-2 border rounded" />
            </div>

            <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Diagnosis / Clinical notes" className="w-full p-2 border rounded" rows={3} />
            <input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Allergy history" className="w-full p-2 border rounded" />

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Drugs ({drugs.length})</h3>
              </div>

              {drugs.length === 0 && (
                <div className="p-4 border-2 border-dashed border-gray-300 rounded text-center text-gray-500">
                  No drugs added. Use the search box on the left to add drugs.
                </div>
              )}

              <div className="space-y-3">
                {drugs.map((drug, idx) => (
                  <div key={drug.id} className="p-3 border rounded bg-gray-50">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="font-medium text-lg">{drug.name}</div>
                        <div className="text-sm text-gray-600">Type: {drug.type} · Strength: {drug.strength}</div>
                      </div>
                      <button type="button" onClick={() => removeDrug(idx)} className="text-red-600 hover:text-red-800">Remove</button>
                    </div>

                    <DosageMatrix drug={drug} onChange={(patch: any) => updateDrug(idx, patch)} />

                    <input value={drug.notes} onChange={(e) => updateDrug(idx, { notes: e.target.value })} placeholder="Notes / duration" className="w-full p-2 border rounded mt-2" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setDrugs([]); setDiagnosis(''); setAllergies('') }} className="px-4 py-2 bg-gray-100 rounded">Reset</button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 text-white rounded disabled:bg-gray-400">
                {isSubmitting ? 'Submitting...' : 'Submit Prescription'}
              </button>
            </div>
          </form>
        </main>

        <aside className="col-span-3 bg-white rounded-2xl p-4 shadow">
          <h3 className="font-semibold">Session Info</h3>
          <ul className="mt-2 text-sm text-gray-600 space-y-2">
            <li>Doctor: {clinicTemplate.doctorName || 'Not set'}</li>
            <li>Drugs loaded: {localStorage.getItem('drug_database') ? JSON.parse(localStorage.getItem('drug_database') || '[]').length : 0}</li>
            <li>Current Drugs: {drugs.length}</li>
          </ul>
        </aside>
      </div>
    </div>
  )
}