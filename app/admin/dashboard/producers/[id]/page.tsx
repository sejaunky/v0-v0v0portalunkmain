import ProducerProfile from '@/components/ProducerProfile'

export default function Page({ params }: { params: { id: string } }) {
  return <ProducerProfile producerId={params.id} onBack={() => history.back()} />
}
