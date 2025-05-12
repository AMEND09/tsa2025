import React, { useMemo } from 'react';
import { Label } from "@/components/ui/label";
import { Farm } from '../types';

interface CropFilterProps {
  farms: Farm[];
  cropFilter: string;
  setCropFilter: (filter: string) => void;
}

const CropFilter: React.FC<CropFilterProps> = ({ farms, cropFilter, setCropFilter }) => {
  const uniqueCrops = useMemo(() => {
    const crops = new Set(farms.map(farm => farm.crop));
    return ["all", ...Array.from(crops)];
  }, [farms]);

  return (
    <div className="flex items-center gap-2">
      <Label className="text-sm whitespace-nowrap">Filter:</Label>
      <select
        className="border rounded px-2 py-1 text-sm w-[120px]"
        value={cropFilter}
        onChange={(e) => setCropFilter(e.target.value)}
      >
        {uniqueCrops.map(crop => (
          <option key={crop} value={crop}>
            {crop === "all" ? "All Crops" : crop}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CropFilter;