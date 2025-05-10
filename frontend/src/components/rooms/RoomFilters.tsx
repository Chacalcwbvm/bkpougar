
import React from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

interface FilterProps {
  filter: {
    capacity: number;
    minPrice: number;
    maxPrice: number;
  };
  onFilterChange: (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
  onApplyFilter: () => void;
}

const RoomFilters = ({ filter, onFilterChange, onApplyFilter }: FilterProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="font-serif text-xl mb-4">{t("filterRooms")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("capacityLabel")}
          </label>
          <select
            name="capacity"
            value={filter.capacity}
            onChange={onFilterChange}
            className="w-full border border-gray-300 rounded-md p-2"
          >
            <option value={0}>{t("any")}</option>
            <option value={1}>1+</option>
            <option value={2}>2+</option>
            <option value={3}>3+</option>
            <option value={4}>4+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("minPrice")}
          </label>
          <input
            type="number"
            name="minPrice"
            value={filter.minPrice}
            onChange={onFilterChange}
            className="w-full border border-gray-300 rounded-md p-2"
            min="0"
            max="500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("maxPrice")}
          </label>
          <input
            type="number"
            name="maxPrice"
            value={filter.maxPrice}
            onChange={onFilterChange}
            className="w-full border border-gray-300 rounded-md p-2"
            min="0"
            max="500"
          />
        </div>
      </div>
      <div className="mt-4 text-right">
        <Button 
          onClick={onApplyFilter}
          className="bg-hotel-gold hover:bg-hotel-gold/80 text-white"
        >
          {t("applyFilter")}
        </Button>
      </div>
    </div>
  );
};

export default RoomFilters;
