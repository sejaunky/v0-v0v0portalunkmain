'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.image || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        displayName,
        photoFile: imageFile
      });
      // Mostrar mensagem de sucesso
    } catch (error) {
      // Tratar erro
      console.error('Erro ao atualizar perfil:', error);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass-card p-6">
          <h1 className="text-2xl font-bold mb-6 gradient-text">Configurações do Perfil</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32 group">
                <div className="relative w-full h-full rounded-full overflow-hidden glass-button">
                  <Image
                    src={previewUrl || '/logo.png'}
                    alt="Foto de perfil"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm">Alterar foto</span>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              
              <div className="w-full space-y-2">
                <label htmlFor="displayName" className="block text-sm font-medium">
                  Nome de Exibição
                </label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="glass-button w-full"
                  placeholder="Seu nome"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full glass-button hover:shadow-glow"
            >
              Salvar Alterações
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
