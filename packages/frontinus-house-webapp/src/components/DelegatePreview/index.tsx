import React from 'react';
import classes from './DelegatePreview.module.css';

export interface ProposalData {
  title: string;
  tldr: string;
  // Add other fields here if needed
}

const DelegatePreview: React.FC<{ data: ProposalData }> = ({ data }) => {
  // Display the preview content using the `data` prop
  return (
    <div>
      <h1>Preview</h1>
      <h2>{data.title}</h2>
      <p>{data.tldr}</p>
      {/* Display other fields as needed */}
    </div>
  );
};

export default DelegatePreview;
