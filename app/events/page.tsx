import { redirect } from 'next/navigation'

export default function EventsPage() {
  // redirect on the server to the event calendar route
  redirect('/event-calendar')
}
