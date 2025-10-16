import React from 'react';

const Container = ({ children }: { children: React.ReactNode }) => {
  return <div className="px-4 py-4 lg:px-10 lg:py-5">{children}</div>;
};

export default Container;
