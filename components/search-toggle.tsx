'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  SearchIcon, 
  SparklesIcon, 
 BotMessageSquareIcon, 
  BotIcon 
} from 'lucide-react';

interface SearchToggleProps {
  onSearchTypeChange: (type: 'traditional' | 'semantic' | 'qwen-text' | 'qwen-multimodal') => void;
  currentSearchType: 'traditional' | 'semantic' | 'qwen-text' | 'qwen-multimodal';
}

const SearchToggle: React.FC<SearchToggleProps> = ({ 
  onSearchTypeChange, 
  currentSearchType 
}) => {
  const [selectedType, setSelectedType] = useState(currentSearchType);

  const handleToggle = (type: 'traditional' | 'semantic' | 'qwen-text' | 'qwen-multimodal') => {
    setSelectedType(type);
    onSearchTypeChange(type);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button
        variant={selectedType === 'traditional' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleToggle('traditional')}
        className="flex items-center gap-2"
      >
        <SearchIcon className="w-4 h-4" />
        Traditional
      </Button>
      
      <Button
        variant={selectedType === 'semantic' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleToggle('semantic')}
        className="flex items-center gap-2"
      >
        <SparklesIcon className="w-4 h-4" />
        Semantic Search
      </Button>
      
      <Button
        variant={selectedType === 'qwen-text' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleToggle('qwen-text')}
        className="flex items-center gap-2"
      >
        <BotIcon className="w-4 h-4" />
        Qwen Text
      </Button>
      
      <Button
        variant={selectedType === 'qwen-multimodal' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleToggle('qwen-multimodal')}
        className="flex items-center gap-2"
      >
        <BotMessageSquareIcon className="w-4 h-4" />
        Qwen Multimodal
      </Button>
    </div>
  );
};

export default SearchToggle;