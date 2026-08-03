import { ArrowLeft, FileQuestionMark, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  return (
    <div className='page-container status'>
      <FileQuestionMark />
      <p className='status-text'>{text}</p>

      <button onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
        Go Back
      </button>
    </div>
  );
}
