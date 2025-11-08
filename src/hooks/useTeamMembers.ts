import { useMemo } from 'react';
import { useFirestore } from './useFirestore';
import { TeamMember } from '../types/firebase';
import { orderBy } from 'firebase/firestore';

export const useTeamMembers = () => {
  const constraints = useMemo(() => [orderBy('createdAt', 'desc')], []);

  const {
    data: members,
    loading,
    error,
    addDocument: addMember,
    updateDocument: updateMember,
    deleteDocument: deleteMember,
  } = useFirestore<TeamMember>('team-members', constraints);

  const inviteMember = async (memberData: Omit<TeamMember, 'createdAt' | 'posts' | 'lastActive' | 'avatar'>) => {
    const now = new Date();
    const avatar = memberData.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return await addMember({
      ...memberData,
      avatar,
      posts: 0,
      lastActive: 'Noch nicht aktiv',
      createdAt: now,
    });
  };

  return {
    members,
    loading,
    error,
    inviteMember,
    updateMember,
    deleteMember,
  };
};