import React, { useEffect, useState } from 'react';

export const useModelList = () => {
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    reloadModels();
  }, []);

  const reloadModels = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    return new Promise((resolve, reject) => {
      fetch('http://localhost:11434/api/tags')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to load models');
          }
          return response.json();
        })
        .then(data => {
          setModels(data.models);
          setIsLoading(false);
          resolve();
        })
        .catch(error => {
          setIsLoading(false);
          setError(error.message);
          reject(error);
        });
    })
  };

  return { models, isLoading, error, reloadModels };
};