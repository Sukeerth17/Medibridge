import React, { useState, useEffect } from 'react';

interface Drug {
  id: string;
  name: string;
  type?: string;
  strength?: string;
}

interface DrugSearchProps {
  onSelectDrug: (drug: Drug) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function DrugSearch({ onSelectDrug }: DrugSearchProps) {
  const [query, setQuery] = useState('');
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalDrugs, setTotalDrugs] = useState(0);

  // Fetch total count on mount
  useEffect(() => {
    fetchTotalCount();
  }, []);

  const fetchTotalCount = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${API_URL}/v1/clinic/drugs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTotalDrugs(data.length || 0);
      }
    } catch (err) {
      console.error('Failed to fetch drug count:', err);
    }
  };

  // Search drugs from backend
  useEffect(() => {
    if (query.length < 2) {
      setDrugs([]);
      setShowResults(false);
      return;
    }

    const searchDrugs = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(
          `${API_URL}/v1/clinic/drugs/search?q=${encodeURIComponent(query)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setDrugs(data || []);
          setShowResults(true);
        } else {
          console.error('Failed to search drugs');
          setDrugs([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setDrugs([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchDrugs, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectDrug = (drug: Drug) => {
    onSelectDrug(drug);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search drug by name..."
          className="w-full p-2 border rounded"
          onFocus={() => query.length >= 2 && setShowResults(true)}
        />
        
        {isLoading && (
          <div style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '12px',
            color: '#666'
          }}>
            Searching...
          </div>
        )}

        {showResults && drugs.length > 0 && (
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
            {drugs.map((drug) => (
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
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {drug.type && `${drug.type}`}
                  {drug.strength && ` • ${drug.strength}`}
                </div>
              </div>
            ))}
          </div>
        )}

        {showResults && query.length >= 2 && drugs.length === 0 && !isLoading && (
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
            No drugs found matching "{query}"
          </div>
        )}
      </div>

      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
        {totalDrugs > 0 ? (
          `${totalDrugs} drugs available in database`
        ) : (
          'Loading drug database...'
        )}
      </div>
    </div>
  );
}