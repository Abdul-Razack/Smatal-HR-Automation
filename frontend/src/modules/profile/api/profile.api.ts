import { Profile } from '../types';

export const profileApi = {
  getProfile: async (id: string): Promise<Profile | null> => {
    // Backend missing GET endpoint for Profile
    return Promise.resolve(null);
  },
  
  createProfile: async (data: Omit<Profile, 'id'>): Promise<{ id: string }> => {
    // Backend missing POST endpoint for Profile
    return Promise.resolve({ id: 'dummy-profile-id' });
  },
};
