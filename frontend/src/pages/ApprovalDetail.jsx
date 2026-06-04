import React from 'react';
import { useParams } from 'react-router-dom';

const ApprovalDetail = () => {
  const { id } = useParams();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Approval Detail: {id}</h1>
    </div>
  );
};

export default ApprovalDetail;
