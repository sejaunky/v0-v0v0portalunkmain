"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export type EventFormValues = {
	title: string;
	date: string;
	location: string;
	djs: number;
	status: 'pending' | 'confirmed' | 'completed';
};

export default function EventFormDialog({ onCreate, onClose }: { onCreate: (values: EventFormValues) => void; onClose?: () => void }) {
	const [title, setTitle] = useState('');
	const [date, setDate] = useState('');
	const [location, setLocation] = useState('');
	const [djs, setDjs] = useState<number>(1);
	const [status, setStatus] = useState<EventFormValues['status']>('pending');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || !date || !location.trim()) {
			toast({ title: 'Campos incompletos', description: 'Preencha título, data e local.' });
			return;
		}

		setIsSubmitting(true);
		const values: EventFormValues = {
			title: title.trim(),
			date,
			location: location.trim(),
			djs: Number(djs) || 0,
			status,
		};

		try {
			onCreate(values);
			toast({ title: 'Evento criado', description: `${values.title} adicionado.` });
			// reset
			setTitle('');
			setDate('');
			setLocation('');
			setDjs(1);
			setStatus('pending');
			onClose?.();
		} catch (err) {
			console.error(err);
			toast({ title: 'Erro', description: 'Não foi possível criar o evento.' });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			<div>
				<Label>Título</Label>
				<Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome do evento" />
			</div>

			<div>
				<Label>Data</Label>
				<Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
			</div>

			<div>
				<Label>Local</Label>
				<Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Local do evento" />
			</div>

			<div>
				<Label>DJs (quantidade)</Label>
				<Input type="number" value={djs} onChange={(e) => setDjs(Number(e.target.value))} min={0} />
			</div>

			<div>
				<Label>Status</Label>
				<select className="w-full rounded-md border px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value as EventFormValues['status'])}>
					<option value="pending">Pendente</option>
					<option value="confirmed">Confirmado</option>
					<option value="completed">Concluído</option>
				</select>
			</div>

			<div className="flex justify-end gap-2 pt-2">
				<Button variant="outline" type="button" onClick={() => onClose?.()} disabled={isSubmitting}>
					Cancelar
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Salvando...' : 'Criar Evento'}
				</Button>
			</div>
		</form>
	);
}
