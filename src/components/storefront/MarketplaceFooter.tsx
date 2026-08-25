import Image from "next/image";
import {
  BRAND,
  CONTACT_INFO,
  FOOTER_COLUMNS,
  PAYMENT_METHODS,
  SOCIAL_LINKS,
} from "@/data/marketplace";
import {
  FacebookIcon,
  InstagramIcon,
  PinterestIcon,
  YoutubeIcon,
} from "@/components/storefront/icons";

const socialIcons = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  youtube: YoutubeIcon,
  pinterest: PinterestIcon,
} as const;

export function MarketplaceFooter() {
  return (
    <footer id="contato" className="border-t border-potala-border bg-potala-bg">
      <div className="potala-container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_repeat(3,minmax(0,1fr))_1.1fr]">
        <div>
          <a href="#topo" className="inline-flex items-center gap-3">
            <Image
              src={BRAND.logoSrc}
              alt=""
              width={44}
              height={44}
              className="h-11 w-11"
            />
            <span>
              <span className="block font-serif text-lg text-potala-gold">
                {BRAND.name}
              </span>
              <span className="block text-[0.7rem] uppercase tracking-[0.18em] text-potala-muted">
                {BRAND.marketplace}
              </span>
            </span>
          </a>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-potala-muted">
            {BRAND.description}
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {SOCIAL_LINKS.map((social) => {
              const Icon = socialIcons[social.id];
              return (
                <li key={social.id}>
                  <a
                    href={social.href}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-potala-border text-potala-gold transition hover:border-potala-gold hover:bg-potala-panel"
                    aria-label={social.label}
                  >
                    <Icon />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="mb-4 font-serif text-xl text-potala-text">
              {column.title}
            </h2>
            <ul className="space-y-2.5 text-sm text-potala-muted">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="transition hover:text-potala-gold">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h2 className="mb-4 font-serif text-xl text-potala-text">Fale conosco</h2>
          <ul className="space-y-2.5 text-sm text-potala-muted">
            <li>
              <a href={`tel:${CONTACT_INFO.phone.replace(/\D/g, "")}`} className="hover:text-potala-gold">
                {CONTACT_INFO.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-potala-gold">
                {CONTACT_INFO.email}
              </a>
            </li>
            <li>{CONTACT_INFO.hours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-potala-border">
        <div className="potala-container flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-potala-muted">
            © {new Date().getFullYear()} Instituto Potala Marketplace. Todos os
            direitos reservados.
          </p>
          <ul className="flex flex-wrap items-center gap-2" aria-label="Formas de pagamento">
            {PAYMENT_METHODS.map((method) => (
              <li key={method.id}>
                <Image
                  src={method.imageSrc}
                  alt={method.label}
                  width={96}
                  height={56}
                  className="h-8 w-auto"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
