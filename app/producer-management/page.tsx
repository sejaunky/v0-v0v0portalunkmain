"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Producer {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  status: 'active' | 'inactive';
}

export default function ProducerManagementPage() {
  const queryClient = useQueryClient()

  const { data: producersData, isLoading, isError, error, refetch } = useQuery<{ producers: Producer[] }, Error>({
    queryKey: ["producers"],
    queryFn: async () => {
      const res = await fetch('/api/producers')
      if (!res.ok) throw new Error('Failed to fetch producers')
      return res.json()
    }
  })

  const producers = producersData?.producers || []
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
  });

  const handleAddProducer = async () => {
    if (!formData.name || !formData.email) {
      toast({ title: 'Erro', description: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }

    try {
      const res = await fetch('/api/producers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, status: 'active' }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Erro ao criar produtor')
      }

      // Invalidate/refresh producers
      queryClient.invalidateQueries({ queryKey: ['producers'] })
      setFormData({ name: '', email: '', company: '', phone: '' })
      setIsDialogOpen(false)
      toast({ title: 'Sucesso', description: 'Produtor adicionado com sucesso!' })
    } catch (err: any) {
      console.error('Failed to create producer', err)
      toast({ title: 'Erro', description: err?.message || 'Não foi possível adicionar o produtor', variant: 'destructive' })
    }
  }

  const filteredProducers = producers.filter((producer) => {
    const normalizedTerm = searchTerm.toLowerCase()
    const name = (producer.name || "").toString()
    const email = (producer.email || "").toString()

    return name.toLowerCase().includes(normalizedTerm) || email.toLowerCase().includes(normalizedTerm)
  })

  return (
    <div className="flex-1 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Produtores</h1>
          <p className="mt-1 text-muted-foreground">Cadastre e gerencie os produtores</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-glow hover:opacity-95 border-0">
              <Plus className="mr-2 h-4 w-4" />
              Novo Produtor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Produtor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do produtor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@empresa.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Nome da empresa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddProducer}>
                  Adicionar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar produtores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredProducers.length === 0 ? (
        <Card>
          <CardContent className="pt-12 text-center">
            <p className="text-muted-foreground">Nenhum produtor cadastrado ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducers.map((producer) => (
            <Card key={producer.id} className="glass-card hover-lift">
              <CardHeader>
                <CardTitle className="text-lg">{producer.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{producer.email}</p>
                {producer.company && <p className="text-sm text-muted-foreground">{producer.company}</p>}
                {producer.phone && <p className="text-sm text-muted-foreground">{producer.phone}</p>}
                <p className="text-sm font-medium mt-4">
                  Status: <span className="text-green-500">{producer.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
