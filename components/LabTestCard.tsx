import React from 'react';
import { LabTest } from '../types';
import { RupeeIcon, CheckCircleIcon } from './IconComponents';

interface LabTestCardProps {
  test: LabTest;
  onBook: (test: LabTest) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

const LabTestCard: React.FC<LabTestCardProps> = ({ test, onBook }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <img src={test.imageUrl} alt={test.name} className="h-40 w-full object-cover" />
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-gray-800">{test.name}</h3>
        <p className="text-sm text-gray-600 mt-1 flex-grow">{test.description}</p>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Includes {test.includes.length} parameters</h4>
            <div className="text-sm text-gray-600 mt-2 space-y-1">
                {test.includes.slice(0, 3).map(item => (
                     <div key={item} className="flex items-center">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{item}</span>
                    </div>
                ))}
                {test.includes.length > 3 && (
                    <p className="text-xs text-gray-400 pl-6">+ {test.includes.length - 3} more</p>
                )}
            </div>
        </div>
      </div>
      <div className="px-6 pb-6 pt-4 bg-gray-50/70 border-t border-gray-100">
          <p className="text-sm text-orange-600 bg-orange-100 p-2 rounded-md border border-orange-200 mb-4">
              <span className="font-bold">Preparation:</span> {test.preparations}
          </p>
          <div className="flex justify-between items-center">
              <div>
                <span className="text-2xl font-bold text-teal-600">{formatCurrency(test.price)}</span>
                <span className="text-md text-gray-500 line-through ml-2">{formatCurrency(test.mrp)}</span>
              </div>
              <button
                onClick={() => onBook(test)}
                className="px-6 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-md"
              >
                Book Now
              </button>
          </div>
      </div>
    </div>
  );
};

export default LabTestCard;
