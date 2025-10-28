import React from 'react';

const ToggleSwitch = ({ checked, onChange, label, id }) => {
  return (
    <label 
      htmlFor={id} 
      className="flex items-center justify-between cursor-pointer group"
    >
      <span className="text-gray-700 font-medium">{label}</span>
      <div className="flex items-center gap-2">
       
        <div className="relative">
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={onChange}
            className="sr-only"
          />
          <div className={`block w-12 h-6 rounded-full transition-colors duration-300 ${checked ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <div 
            className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-md 
            ${checked ? 'transform translate-x-6' : ''}`}
          ></div>
        </div>
       
      </div>
    </label>
  );
};

export default ToggleSwitch;