import React, { useState, useEffect } from 'react';
import DosageMatrix from '../components/DosageMatrix';

type Patient = { id: string; name: string; age?: number };

export default function PrescriptionPage() {
  const [query, setQuery] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const [clinicTemplate, setClinicTemplate] = useState({ clinicName: '', doctorName: '', doctorType: '', signatureUrl: '' })
  const [vitals, setVitals] = useState({ bp: '', hr: '', temp: '' })
  const [diagnosis, setDiagnosis] = useState('')
  const [allergies, setAllergies] = useState('')
  const [drugs, setDrugs] = useState<any[]>([])

  useEffect(() => {
    if (!query) return setPatients([])
    // mock API call
    fetch(`/api/patients?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data) => setPatients(data))
  }, [query])

  function addDrug() {
    setDrugs((d) => [
      ...d,
      { id: Date.now(), name: '', type: '', strength: '', frequency: { morning: false, afternoon: false, evening: false, night: false }, timingRelation: 'After Food', timeOffsetMinutes: 0, notes: '' },
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
    return {
      patientId: selectedPatient.id,
      clinic: clinicTemplate,
      vitals,
      diagnosis,
      allergies,
      drugs,
      createdAt: new Date().toISOString(),
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const payload = buildPayload()
    if (!payload) return
    // mock POST
    fetch('/api/prescriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then((r) => r.json())
      .then((res) => {
        alert('Prescription submitted (mock)')
        setDrugs([])
        setDiagnosis('')
        setAllergies('')
      })
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
            <h3 className="font-medium">Quick Actions</h3>
            <div className="mt-2 flex flex-col gap-2">
              <button onClick={addDrug} className="px-3 py-2 bg-blue-600 text-white rounded">Add Drug</button>
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
              <ul className="mt-3 max-h-36 overflow-auto">
                {patients.map((p) => (
                  <li key={p.id} onClick={() => setSelectedPatient(p)} className={`p-2 rounded cursor-pointer ${selectedPatient?.id === p.id ? 'bg-indigo-50 border border-indigo-200' : 'bg-white'}`}>
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
                <h3 className="font-semibold">Drugs</h3>
                <button type="button" onClick={addDrug} className="px-3 py-1 bg-green-600 text-white rounded">+ Add Drug</button>
              </div>

              <div className="space-y-3">
                {drugs.map((drug, idx) => (
                  <div key={drug.id} className="p-3 border rounded bg-gray-50">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <input value={drug.name} onChange={(e) => updateDrug(idx, { name: e.target.value })} placeholder="Drug name" className="w-full p-2 border rounded mb-2" />
                        <div className="text-sm text-gray-600">Type: {drug.type || '—'} · Strength: {drug.strength || '—'}</div>
                      </div>
                      <div className="text-right">
                        <button type="button" onClick={() => removeDrug(idx)} className="text-red-600">Remove</button>
                      </div>
                    </div>

                    <DosageMatrix drug={drug} onChange={(patch: any) => updateDrug(idx, patch)} />

                    <input value={drug.notes} onChange={(e) => updateDrug(idx, { notes: e.target.value })} placeholder="Notes / duration" className="w-full p-2 border rounded mt-2" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setDrugs([]); setDiagnosis(''); setAllergies('') }} className="px-4 py-2 bg-gray-100 rounded">Reset</button>
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded">Submit Prescription</button>
            </div>
          </form>
        </main>

        <aside className="col-span-3 bg-white rounded-2xl p-4 shadow">
          <h3 className="font-semibold">Recent Activity</h3>
          <ul className="mt-2 text-sm text-gray-600 space-y-2">
            <li>Last prescription: 2025-10-27</li>
            <li>Pending referrals: 2</li>
            <li>Queued scans: 1</li>
          </ul>
        </aside>
      </div>
    </div>
  )
}