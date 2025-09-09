'use client';

import { Button } from '@/components/ui/button';
import { Gender } from '@prisma/client';
import { useState } from 'react';

interface LeftSideGridProps {
  onPreferenceChange?: (preference: Gender | 'BOTH' | null) => void;
}

const LeftSideGrid = ({ onPreferenceChange }: LeftSideGridProps) => {
  const [selectedPreference, setSelectedPreference] = useState<Gender | 'BOTH' | null>(null);

  const handlePreferenceClick = (preference: Gender | 'BOTH' | null) => {
    setSelectedPreference(preference);
    onPreferenceChange?.(preference);
  };

  const preferences = [
    { label: 'MALE', value: 'MALE' as Gender },
    { label: 'FEMALE', value: 'FEMALE' as Gender },
    { label: 'BOTH', value: 'BOTH' as const },
  ];

  return (
    <div className='p-6 space-y-6'>
      <div className='space-y-4'>
        <h5 className='text-base text-white/90'>Preferences</h5>
        
        <div className='space-y-2'>
          {preferences.map((preference) => (
            <Button
              key={preference.value}
              variant={selectedPreference === preference.value ? 'default' : 'outline'}
              className={`w-full justify-start ${
                selectedPreference === preference.value
                  ? 'bg-white text-black'
                  : 'bg-transparent border-white/20 text-white/80 hover:bg-white/10'
              }`}
              onClick={() => handlePreferenceClick(preference.value)}
            >
              {preference.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Add other left sidebar content here if needed */}
      <div className='space-y-4'>
        <h5 className='text-base text-white/90'>This is how it works!</h5>
        
        <div className='space-y-2 text-sm text-white/70'>
          <p>1. Lorem ipsum dolor sit amet consectetur elit accumsan nec.</p>
          <p>2. Lorem ipsum dolor sit amet consectetur elit accumsan nec.</p>
          <p>3. Lorem ipsum dolor sit amet consectetur elit accumsan nec.</p>
        </div>

        {/* Number buttons */}
        <div className='flex flex-wrap gap-2'>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <Button
              key={num}
              variant='outline'
              size='sm'
              className='w-10 h-10 rounded-full bg-transparent border-white/20 text-white/80 hover:bg-white/10'
            >
              {num}
            </Button>
          ))}
        </div>
      </div>

      <div className='space-y-4'>
        <h5 className='text-base text-white/90'>Share with friends</h5>
        <Button
          variant='outline'
          className='w-full bg-transparent border-white/20 text-white/80 hover:bg-white/10'
        >
          Share this post
        </Button>
      </div>

      <div className='space-y-4'>
        <h5 className='text-base text-white/90'>Downloads the app</h5>
        <div className='w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center'>
          {/* QR Code placeholder */}
          <div className='text-xs text-white/50'>QR Code</div>
        </div>
      </div>
    </div>
  );
};

export default LeftSideGrid;
