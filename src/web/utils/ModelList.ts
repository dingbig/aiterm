import React, { useEffect, useState } from 'react';

export const useModelList = () => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);

  useEffect(() => {
    reloadModels();
  }, []);

  const reloadModels = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      const data = await response.json();
      console.log(data)
      setModels(data.models);
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  return { models, reloadModels };
};