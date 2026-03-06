import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ day: string }>;
}

export default async function ZhDayRedirect({ params }: Props) {
  const { day } = await params;
  redirect(`/day/${day}`);
}
