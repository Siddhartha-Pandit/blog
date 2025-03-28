"use client";

import React, { useState, useEffect } from 'react';
import { Save, ArrowUpToLine } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CreatePage = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="mt-15 p-4">
      {/* Header with Save Draft and Publish buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Create</h1>
       
      </div>
      
      {/* Your CMS components go below */}
      <div>
        <p>Your CMS editor components go here...</p>
      </div>
    </div>
  );
};

export default CreatePage;
