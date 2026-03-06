import { redirect } from 'next/navigation';

const DAYS = [1, 2, 3, 4, 5, 6, 7];

export function generateStaticParams() {
  return DAYS.map((day) => ({ day: day.toString() }));
}

interface Props {
  params: Promise<{ day: string }>;
}

export default async function ZhDayRedirect({ params }: Props) {
  const { day } = await params;
  redirect(`/day/${day}`);
}
