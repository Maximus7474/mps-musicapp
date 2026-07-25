import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';
import './ImageFallback.scss';

interface ImageFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  fallbackLabel?: string;
}

export const Image: React.FC<ImageFallbackProps> = ({
  src,
  alt = 'Image',
  fallbackSrc,
  fallbackLabel,
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const showFallback = hasError || !src;

  return (
    <div className={`img-container ${className}`}>
      {isLoading && !showFallback && <div className='img-skeleton' />}

      {showFallback ? (
        fallbackSrc ? (
          <img src={fallbackSrc} alt={alt} className='img-element fallback' {...props} />
        ) : (
          <div className='img-fallback-placeholder' {...props}>
            <ImageOff size={24} />
            {fallbackLabel && <span className='fallback-label'>{fallbackLabel}</span>}
          </div>
        )
      ) : (
        <img
          src={src}
          alt={alt}
          className={`img-element ${isLoading ? 'loading' : 'loaded'}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          {...props}
        />
      )}
    </div>
  );
};
