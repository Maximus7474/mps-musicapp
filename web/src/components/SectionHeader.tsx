import React from 'react';
import './SectionHeader.scss';

interface SectionHeaderProps {
  title: string;
  action?: string;
  onActionClick?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, action, onActionClick }) => {
  return (
    <div className='section-header'>
      <h2 className='section-title'>{title}</h2>
      {action && (
        <button className='action-btn' onClick={onActionClick}>
          {action}
        </button>
      )}
    </div>
  );
};
