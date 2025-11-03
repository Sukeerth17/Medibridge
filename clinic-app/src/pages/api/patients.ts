import type { NextApiRequest, NextApiResponse } from 'next';

type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
};

// Mock patient data
const mockPatients: Patient[] = [
  { id: 'PAT001', name: 'Amit Sharma', age: 45, gender: 'Male', condition: 'Hypertension' },
  { id: 'PAT002', name: 'Priya Patel', age: 32, gender: 'Female', condition: 'Diabetes' },
  { id: 'PAT003', name: 'Rajesh Kumar', age: 58, gender: 'Male', condition: 'Arthritis' },
  { id: 'PAT004', name: 'Sunita Reddy', age: 41, gender: 'Female', condition: 'Asthma' },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(200).json([]);
    }

    // Filter patients by search query
    const filtered = mockPatients.filter(
      (p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.id.toLowerCase().includes(q.toLowerCase())
    );

    return res.status(200).json(filtered);
  }

  res.status(405).json({ error: 'Method not allowed' });
}