import Image from "next/image";

export function ProjectGallery({ images, title }: { images: string[]; title: string }) {
  if (images.length === 0) return null;
  return (
    <section aria-label="Gallery" className="mt-16 grid gap-6 sm:grid-cols-2">
      {images.map((src, i) => (
        <div key={src} className="relative aspect-video overflow-hidden rounded-card border border-line bg-surface-2">
          <Image
            src={src}
            alt={`${title} screenshot ${i + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, 600px"
            className="object-cover"
          />
        </div>
      ))}
    </section>
  );
}
