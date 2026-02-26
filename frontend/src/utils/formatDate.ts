import type { Time } from '../backend';

export function formatDate(time: Time): string {
  // Convert nanoseconds to milliseconds
  const milliseconds = Number(time / BigInt(1_000_000));
  const date = new Date(milliseconds);
  
  // Format as "Month Day, Year"
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
