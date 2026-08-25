import { PHILOSOPHY_PILLARS } from "@/data/marketplace";
import {
  ArrowRightIcon,
  CommunityPillarIcon,
  HealingPillarIcon,
  KnowledgePillarIcon,
  ProductsPillarIcon,
} from "@/components/storefront/icons";

const pillarIcons = {
  products: ProductsPillarIcon,
  knowledge: KnowledgePillarIcon,
  healing: HealingPillarIcon,
  community: CommunityPillarIcon,
} as const;

export function PhilosophySection() {
  return (
    <section
      id="filosofia"
      aria-labelledby="filosofia-title"
      className="philosophy-section"
    >
      <div aria-hidden="true" className="philosophy-background" />
      <div aria-hidden="true" className="philosophy-buddha-art" />
      <div aria-hidden="true" className="philosophy-palace-art" />
      <div aria-hidden="true" className="philosophy-overlay" />

      <div className="philosophy-container">
        <div className="philosophy-copy">
          <p className="philosophy-eyebrow">
            A filosofia do Instituto Potala
          </p>
          <h2 id="filosofia-title" className="philosophy-title">
            Espiritualidade, conhecimento e consciência em tudo o que fazemos
          </h2>
          <p className="philosophy-text">
            Acreditamos que o caminho espiritual é trilhado através do estudo,
            da prática e de escolhas conscientes. Nosso marketplace reúne
            produtos e experiências que apoiam sua jornada de autoconhecimento,
            cura e transformação.
          </p>
          <a href="#filosofia" className="philosophy-cta">
            Conheça nossa história
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </a>
        </div>

        <ul className="philosophy-principles">
          {PHILOSOPHY_PILLARS.map((pillar) => {
            const Icon = pillarIcons[pillar.icon];
            return (
              <li key={pillar.id} className="philosophy-principle">
                <span className="philosophy-principle-icon" aria-hidden="true">
                  <Icon />
                </span>
                <h3 className="philosophy-principle-title">{pillar.title}</h3>
                <p className="philosophy-principle-desc">{pillar.description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
