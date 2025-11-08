import { useMemo } from 'react';
import { useFirestore } from './useFirestore';
import { Partner } from '../types/firebase';
import { orderBy } from 'firebase/firestore';

export const usePartners = () => {
  const constraints = useMemo(() => [orderBy('createdAt', 'desc')], []);

  const {
    data: partners,
    loading,
    error,
    addDocument: addPartner,
    updateDocument: updatePartner,
    deleteDocument: deletePartner,
  } = useFirestore<Partner>('partners', constraints);

  const createPartner = async (partnerData: Omit<Partner, 'createdAt' | 'avatar' | 'projects' | 'rating'>) => {
    const now = new Date();
    const avatar = partnerData.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return await addPartner({
      ...partnerData,
      avatar,
      projects: 0,
      rating: 0,
      createdAt: now,
    });
  };

  return {
    partners,
    loading,
    error,
    createPartner,
    updatePartner,
    deletePartner,
  };
};