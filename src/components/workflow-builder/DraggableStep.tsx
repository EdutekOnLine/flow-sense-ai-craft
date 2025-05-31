
import React from 'react';

interface DraggableStepProps {
  type: string;
  label: string;
}

export const DraggableStep: React.FC<DraggableStepProps> = ({ type, label }) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="bg-white border border-gray-300 rounded p-2 mb-2 cursor-grab hover:bg-gray-50"
      onDragStart={(event) => onDragStart(event, type)}
      draggable
    >
      <div className="text-sm font-medium">{label}</div>
    </div>
  );
};
