import React from 'react';

const TitleBar = ({ title }) => {
  return (
    <div className="title-bar">
      <div className="title-bar-main">
        <h1 className="title-bar-heading">{title}</h1>
      </div>
    </div>
  );
};

export default TitleBar;