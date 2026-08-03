import { FileQuestionMark, Loader2 } from 'lucide-react';

interface StatusPageProps {
  text?: string;
}

export function LoadingPage({ text = 'Loading' }: StatusPageProps) {
  return (
    <div className='page-container status'>
      <p>{text}</p>
      <Loader2 className='spinner' />
    </div>
  );
}

export function NotFoundPage({ text = 'Content not found' }: StatusPageProps) {
  return (
    <div className='page-container status'>
      <p>{text}</p>
      <FileQuestionMark />
    </div>
  );
}
