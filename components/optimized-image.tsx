import Image, { ImageProps } from 'next/image';

type OptimizedImageProps = Omit<ImageProps, 'src'> & {
  src: string;
  alt: string;
};

export const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  priority,
  ...props 
}: OptimizedImageProps) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      {...props}
    />
  );
};

export default OptimizedImage;