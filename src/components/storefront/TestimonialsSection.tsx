import Image from "next/image";
import { TESTIMONIALS } from "@/data/marketplace";
import { SectionHeading } from "@/components/storefront/SectionHeading";
import { StarIcon } from "@/components/storefront/icons";

export function TestimonialsSection() {
  return (
    <section
      aria-labelledby="depoimentos-title"
      className="potala-section-cream py-14 md:py-16"
    >
      <div className="potala-container">
        <SectionHeading
          id="depoimentos-title"
          title="Nossa comunidade fala"
          tone="light"
          align="center"
          ornament
        />

        <ul className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <li
              key={item.id}
              className="rounded-[0.9rem] border border-[rgb(4_17_38_/_12%)] bg-white/70 p-6 shadow-[0_10px_30px_rgb(4_17_38_/_6%)]"
            >
              <div className="mb-4 flex items-center gap-3">
                <Image
                  src={item.avatarSrc}
                  alt={`Foto ilustrativa temporária de ${item.name}`}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-potala-bg">{item.name}</p>
                  <p className="text-sm text-[color:var(--potala-bg)]/65">
                    {item.location}
                  </p>
                </div>
              </div>
              <blockquote className="text-sm leading-relaxed text-[color:var(--potala-bg)]/85">
                “{item.quote}”
              </blockquote>
              <div
                className="mt-4 flex gap-1 text-potala-gold"
                aria-label={`Avaliação ${item.rating} de 5`}
              >
                {Array.from({ length: item.rating }).map((_, index) => (
                  <StarIcon key={`${item.id}-star-${index}`} className="h-4 w-4" />
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
