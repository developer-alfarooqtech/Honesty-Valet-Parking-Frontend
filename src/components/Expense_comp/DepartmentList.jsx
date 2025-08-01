import React from 'react';
import { Building } from 'lucide-react';
import DepartmentCard from './DepartmentCard';

const DepartmentList = ({ departments, onViewHistory }) => {
  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-lg text-blue-500 flex items-center gap-2">
          <Building size={20} />
          Departments - Payment History
        </h3>
      </div>
      <div className="p-4">
        {departments.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No departments found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {departments.map((department) => (
              <DepartmentCard
                key={department._id}
                department={department}
                onViewHistory={onViewHistory}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentList;