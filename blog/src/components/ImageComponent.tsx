// components/ImageComponent.tsx
import Image from 'next/image';

export function ImageComponent({ src }: { src?: string }) {
  if (!src) return null;

  if (src.startsWith('data:image/')) {
    return <img src={src} className="my-4 rounded-lg max-w-full h-auto" alt="" />;
  }

  return (
    <div className="my-4 rounded-lg overflow-hidden">
      <Image
        src={src}
        width={1200}
        height={630}
        alt=""
        className="max-w-full h-auto"
      />
    </div>
  );
}

// components/YouTubeEmbed.tsx
export function YouTubeEmbed({ src }: { src?: string }) {
  if (!src) return null;
  const videoId = src.split('v=')[1]?.split('&')[0];
  
  return (
    <div className="my-4 aspect-video w-full">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        className="w-full h-full rounded-lg"
        allowFullScreen
      />
    </div>
  );
}