import ProducerProfile from '@/components/ProducerProfile'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProducerProfile producerId={id} onBack={() => history.back()} />
}
