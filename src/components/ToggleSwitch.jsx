import React from 'react';

const ToggleSwitch = ({ checked, onChange, label, id }) => {
  return (
    <label 
      htmlFor={id} 
      className="flex items-center cursor-pointer group"
    >
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div className={`block w-12 h-6 rounded-full transition-colors duration-300 ${checked ? 'bg-red-500' : 'bg-blue-500'}`}></div>
        <div 
          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-md 
          ${checked ? 'transform tranblue-x-6' : ''}`}
        ></div>
      </div>
      <span className="ml-3 text-gray-700">{label}</span>
    </label>
  );
};

export default ToggleSwitch;