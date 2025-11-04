import React, { useState, useEffect } from 'react';

interface Drug {
  id: string;
  name: string;
  type?: string;
}

interface DrugSearchProps {
  onSelectDrug: (drug: Drug) => void;
}

export default function DrugSearch({ onSelectDrug }: DrugSearchProps) {
  const [query, setQuery] = useState('');
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [filteredDrugs, setFilteredDrugs] = useState<Drug[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load drugs from localStorage or initialize empty
  useEffect(() => {
    const storedDrugs = localStorage.getItem('drug_database');
    if (storedDrugs) {
      try {
        const parsed = JSON.parse(storedDrugs);
        setDrugs(parsed);
      } catch (err) {
        console.error('Failed to parse drug database:', err);
      }
    }
  }, []);

  // Filter drugs based on search query
  useEffect(() => {
    if (query.length < 2) {
      setFilteredDrugs([]);
      setShowResults(false);
      return;
    }

    const filtered = drugs.filter(drug =>
      drug.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredDrugs(filtered.slice(0, 10)); // Show top 10 results
    setShowResults(true);
  }, [query, drugs]);

  const handleSelectDrug = (drug: Drug) => {
    onSelectDrug(drug);
    setQuery('');
    setShowResults(false);
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const nameIndex = headers.indexOf('name');
        const idIndex = headers.indexOf('id');
        const typeIndex = headers.indexOf('type');

        if (nameIndex === -1) {
          alert('CSV must have a "name" column');
          setIsLoading(false);
          return;
        }

        const parsedDrugs: Drug[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          
          if (values[nameIndex]) {
            parsedDrugs.push({
              id: values[idIndex] || `drug-${i}`,
              name: values[nameIndex],
              type: values[typeIndex] || 'allopathy'
            });
          }
        }

        setDrugs(parsedDrugs);
        localStorage.setItem('drug_database', JSON.stringify(parsedDrugs));
        alert(`Successfully loaded ${parsedDrugs.length} drugs`);
      } catch (err) {
        console.error('Error parsing CSV:', err);
        alert('Failed to parse CSV file');
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search drug by name..."
            className="w-full p-2 border rounded"
            onFocus={() => query.length >= 2 && setShowResults(true)}
          />
          
          {showResults && filteredDrugs.length > 0 && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginTop: '4px',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              {filteredDrugs.map((drug) => (
                <div
                  key={drug.id}
                  onClick={() => handleSelectDrug(drug)}
                  style={{
                    padding: '10px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #eee'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <div style={{ fontWeight: '500' }}>{drug.name}</div>
                  {drug.type && (
                    <div style={{ fontSize: '12px', color: '#666' }}>{drug.type}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {showResults && query.length >= 2 && filteredDrugs.length === 0 && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginTop: '4px',
                padding: '10px',
                zIndex: 1000,
                color: '#666'
              }}
            >
              No drugs found. Upload a CSV file to add drugs.
            </div>
          )}
        </div>

        <label 
          htmlFor="csv-upload"
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? 'Loading...' : 'Upload CSV'}
        </label>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          style={{ display: 'none' }}
          disabled={isLoading}
        />
      </div>

      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
        {drugs.length > 0 ? `${drugs.length} drugs loaded` : 'No drugs loaded. Upload a CSV file.'}
      </div>
    </div>
  );
}