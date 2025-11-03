import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const prescriptionData = req.body;
    
    console.log('Received prescription:', prescriptionData);
    
    // In a real app, this would:
    // 1. Validate the data
    // 2. Call the Go API: POST http://go-api:8080/v1/clinic/prescriptions/new
    // 3. Return the response
    
    // Mock success response
    return res.status(200).json({
      success: true,
      message: 'Prescription submitted successfully (mock)',
      prescriptionId: `RX-${Date.now()}`,
      data: prescriptionData,
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}