import React from 'react';

const Loader = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
};

export default Loader;
