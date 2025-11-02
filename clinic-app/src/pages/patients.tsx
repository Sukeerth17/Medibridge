// src/pages/patients.tsx
import { useEffect, useState } from "react";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch patients from backend
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch("/api/patients"); // ✅ backend endpoint
        if (!response.ok) throw new Error("Failed to fetch patients");

        const data = await response.json();
        setPatients(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  if (loading) return <p className="text-center mt-8">Loading patients...</p>;
  if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Patients</h1>
      {patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <table className="w-full border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3 border-b">Name</th>
              <th className="text-left p-3 border-b">Age</th>
              <th className="text-left p-3 border-b">Gender</th>
              <th className="text-left p-3 border-b">Condition</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-3 border-b">{p.name}</td>
                <td className="p-3 border-b">{p.age}</td>
                <td className="p-3 border-b">{p.gender}</td>
                <td className="p-3 border-b">{p.condition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
