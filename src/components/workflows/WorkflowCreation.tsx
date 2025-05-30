
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import WorkflowEditor from './WorkflowEditor';
import { useNavigate } from 'react-router-dom';

export default function WorkflowCreation() {
  const navigate = useNavigate();

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email');
      
      if (error) throw error;
      return data;
    },
  });

  const handleSave = () => {
    navigate('/?tab=list');
  };

  const handleCancel = () => {
    navigate('/?tab=list');
  };

  return (
    <WorkflowEditor
      profiles={profiles}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
