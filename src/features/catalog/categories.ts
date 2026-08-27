/**
 * Definição central das sete categorias do catálogo público demonstrativo.
 * Menu, cards, filtros, breadcrumbs e contagens devem derivar daqui.
 *
 * Nota: estes IDs públicos (`cristais`, `cursos`, …) não se misturam com
 * IDs administrativos (`cat-cristais`, …). Produtos novos aqui são apenas
 * da vitrine pública e não entram automaticamente no CRUD admin/vendedor.
 */

export const CATALOG_CATEGORY_IDS = [
  "cursos",
  "terapias",
  "livros",
  "incensos",
  "cristais",
  "acessorios",
  "meditacao",
] as const;

export type CatalogCategoryId = (typeof CATALOG_CATEGORY_IDS)[number];

export interface CatalogCategory {
  id: CatalogCategoryId;
  slug: CatalogCategoryId;
  name: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
}

export const CATALOG_CATEGORIES: readonly CatalogCategory[] = [
  {
    id: "cursos",
    slug: "cursos",
    name: "Cursos",
    description:
      "Programas demonstrativos de meditação, atenção plena e equilíbrio energético.",
    imageSrc: "/images/potala/category-cursos-final.png",
    imageAlt: "Categoria Cursos",
    href: "/categoria/cursos",
  },
  {
    id: "terapias",
    slug: "terapias",
    name: "Terapias",
    description:
      "Óleos essenciais e kits aromáticos para rituais de bem-estar e presença.",
    imageSrc: "/images/potala/category-terapias-final.png",
    imageAlt: "Categoria Terapias",
    href: "/categoria/terapias",
  },
  {
    id: "livros",
    slug: "livros",
    name: "Livros",
    description:
      "Leituras selecionadas sobre presença, consciência e jornada interior.",
    imageSrc: "/images/potala/category-livros-final.png",
    imageAlt: "Categoria Livros",
    href: "/categoria/livros",
  },
  {
    id: "incensos",
    slug: "incensos",
    name: "Incensos",
    description:
      "Incensos naturais para ambientação, rituais e momentos de quietude.",
    imageSrc: "/images/potala/category-incensos-final.png",
    imageAlt: "Categoria Incensos",
    href: "/categoria/incensos",
  },
  {
    id: "cristais",
    slug: "cristais",
    name: "Cristais",
    description:
      "Cristais e pedras selecionados para meditação, presença e harmonia do espaço.",
    imageSrc: "/images/potala/category-cristais-final.png",
    imageAlt: "Categoria Cristais",
    href: "/categoria/cristais",
  },
  {
    id: "acessorios",
    slug: "acessorios",
    name: "Acessórios",
    description:
      "Japamalas, cadernos e objetos de apoio para práticas cotidianas.",
    imageSrc: "/images/potala/category-acessorios-final.png",
    imageAlt: "Categoria Acessórios",
    href: "/categoria/acessorios",
  },
  {
    id: "meditacao",
    slug: "meditacao",
    name: "Meditação",
    description:
      "Kits e instrumentos para abertura, presença e rituais de quietude.",
    imageSrc: "/images/potala/category-meditacao-final.png",
    imageAlt: "Categoria Meditação",
    href: "/categoria/meditacao",
  },
] as const;

const BY_SLUG = new Map(
  CATALOG_CATEGORIES.map((category) => [category.slug, category]),
);

export function isCatalogCategoryId(
  value: string,
): value is CatalogCategoryId {
  return (CATALOG_CATEGORY_IDS as readonly string[]).includes(value);
}

export function getCatalogCategory(
  slug: string,
): CatalogCategory | undefined {
  return BY_SLUG.get(slug as CatalogCategoryId);
}

export function getCatalogCategoryOrThrow(slug: string): CatalogCategory {
  const category = getCatalogCategory(slug);
  if (!category) {
    throw new Error(`Categoria desconhecida: ${slug}`);
  }
  return category;
}
