"use client"

import { useState } from 'react';
import type { User as AppUser } from "@/types"

export function useAuth() {
  const [userData, setUserData] = useState<AppUser>({
    id: "default-user",
    username: "Admin",
    role: "admin",
    email: "admin@portal.local",
    createdAt: new Date().toISOString(),
    profile: undefined,
    name: "",
    image: null
  });

  const updateProfile = async ({ displayName, photoFile }: { displayName: string; photoFile: File | null }) => {
    try {
      let imageUrl = userData.image;

      if (photoFile) {
        // Aqui você implementaria a lógica de upload da imagem para seu servidor
        // Por enquanto, vamos apenas simular
        imageUrl = URL.createObjectURL(photoFile);
      }

      // Atualiza os dados do usuário localmente
      setUserData(prev => ({
        ...prev,
        name: displayName,
        image: imageUrl
      }));

      // Aqui você implementaria a chamada real para sua API
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  return {
    user: userData,
    userProfile: userData.profile || null,
    role: userData.role || null,
    isAuthenticated: true,
    isLoading: false,
    loading: false,
    profileLoading: false,
    loginPending: false,
    signIn: async () => ({ data: null, error: null }),
    login: async () => ({ data: null, error: null }),
    logout: async () => {},
    refreshProfile: async () => {},
    updateProfile,
    supabaseReachable: true,
    loginMutation: { isPending: false },
  }
}
