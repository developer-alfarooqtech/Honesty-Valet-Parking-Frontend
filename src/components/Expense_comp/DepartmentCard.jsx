import React from "react";
import { Building, History } from "lucide-react";

const DepartmentCard = ({ department, onViewHistory }) => {
  return (
    <div
      className="bg-white rounded-lg shadow border border-blue-500 p-4 flex justify-between items-center hover:bg-blue-50 cursor-pointer"
      onClick={() => onViewHistory(department)}
    >
      <div className="flex items-center">
        <div className="p-2 bg-blue-100 rounded-full mr-3">
          <Building size={18} className="text-blue-500" />
        </div>
        <div>
          <h3 className="font-medium">{department.name}</h3>
          <p className="text-sm text-green-600 font-semibold">
            {department.availableAmount}
          </p>
        </div>
      </div>
      <div
        className="p-2 text-blue-500 hover:bg-blue-100 rounded-full"
      >
        <History size={18} />
      </div>
    </div>
  );
};

export default DepartmentCard;
