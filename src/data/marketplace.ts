import type {
  CategoryHighlight,
  CompactProduct,
  ContactInfo,
  FooterColumn,
  NavCategory,
  PaymentMethod,
  PhilosophyPillar,
  Product,
  Testimonial,
} from "@/types/marketplace";

export const ANNOUNCEMENT_TEXT =
  "Frete grátis para todo o Brasil em compras acima de R$ 299";

export const BRAND = {
  name: "Instituto Potala",
  marketplace: "Marketplace",
  fullName: "Instituto Potala Marketplace",
  description:
    "Um espaço de bem-estar, aprendizado e consciência. Produtos, cursos e experiências selecionados para apoiar sua jornada espiritual.",
  logoSrc: "/images/potala/logo-mark.png",
};

export const NAV_CATEGORIES: NavCategory[] = [
  { id: "categorias", label: "Categorias", href: "#categorias", hasMenu: true },
  { id: "cursos", label: "Cursos", href: "#categoria-cursos" },
  { id: "terapias", label: "Terapias", href: "#categoria-terapias" },
  { id: "livros", label: "Livros", href: "#categoria-livros" },
  { id: "incensos", label: "Incensos", href: "#categoria-incensos" },
  { id: "cristais", label: "Cristais", href: "#categoria-cristais" },
  { id: "acessorios", label: "Acessórios", href: "#categoria-acessorios" },
  { id: "meditacao", label: "Meditação", href: "#categoria-meditacao" },
  { id: "novidades", label: "Novidades", href: "#novidades" },
  { id: "ofertas", label: "Ofertas", href: "#produtos" },
];

export const FEATURED_CATEGORIES: CategoryHighlight[] = [
  {
    id: "cursos",
    name: "Cursos",
    href: "#categoria-cursos",
    imageSrc: "/images/potala/category-cursos-final.png",
    imageAlt: "",
  },
  {
    id: "incensos",
    name: "Incensos",
    href: "#categoria-incensos",
    imageSrc: "/images/potala/category-incensos-final.png",
    imageAlt: "",
  },
  {
    id: "cristais",
    name: "Cristais",
    href: "#categoria-cristais",
    imageSrc: "/images/potala/category-cristais-final.png",
    imageAlt: "",
  },
  {
    id: "livros",
    name: "Livros",
    href: "#categoria-livros",
    imageSrc: "/images/potala/category-livros-final.png",
    imageAlt: "",
  },
  {
    id: "terapias",
    name: "Terapias",
    href: "#categoria-terapias",
    imageSrc: "/images/potala/category-terapias-final.png",
    imageAlt: "",
  },
  {
    id: "acessorios",
    name: "Acessórios",
    href: "#categoria-acessorios",
    imageSrc: "/images/potala/category-acessorios-final.png",
    imageAlt: "",
  },
  {
    id: "meditacao",
    name: "Meditação",
    href: "#categoria-meditacao",
    imageSrc: "/images/potala/category-meditacao-final.png",
    imageAlt: "",
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "ametista-premium",
    name: "Drusa de Ametista Premium",
    category: "Cristais",
    categoryId: "cristais",
    price: 249.9,
    rating: 4.9,
    reviewCount: 28,
    imageSrc: "/images/potala/product-ametista-final.png",
    imageAlt: "Drusa de Ametista Premium",
    badge: "Mais vendido",
    action: "cart",
    featured: true,
    popular: true,
  },
  {
    id: "palo-santo",
    name: "Incenso Natural Palo Santo",
    category: "Incensos",
    categoryId: "incensos",
    price: 39.9,
    rating: 4.8,
    reviewCount: 96,
    imageSrc: "/images/potala/product-palo-santo-final.png",
    imageAlt: "Incenso Natural Palo Santo",
    action: "cart",
    featured: true,
    popular: true,
  },
  {
    id: "curso-meditacao",
    name: "Curso Meditação e Atenção Plena",
    category: "Cursos",
    categoryId: "cursos",
    price: 297,
    rating: 5,
    reviewCount: 156,
    imageSrc: "/images/potala/product-curso-meditacao-final.png",
    imageAlt: "Curso Meditação e Atenção Plena",
    badge: "Novo",
    action: "details",
    featured: true,
    isNew: true,
  },
  {
    id: "poder-do-agora",
    name: "O Poder do Agora",
    category: "Livros",
    categoryId: "livros",
    price: 59.9,
    rating: 4.9,
    reviewCount: 75,
    imageSrc: "/images/potala/product-livro-agora-final.png",
    imageAlt: "O Poder do Agora",
    action: "cart",
    featured: true,
    popular: true,
  },
  {
    id: "japamala",
    name: "Pulseira Japamala 108 Contas",
    category: "Acessórios",
    categoryId: "acessorios",
    price: 129.9,
    rating: 4.7,
    reviewCount: 64,
    imageSrc: "/images/potala/product-japamala-final.png",
    imageAlt: "Pulseira Japamala 108 Contas",
    action: "cart",
    featured: true,
  },
  {
    id: "quartzo",
    name: "Cristal de Quartzo Transparente",
    category: "Cristais",
    categoryId: "cristais",
    price: 89.9,
    rating: 4.8,
    reviewCount: 156,
    imageSrc: "/images/potala/product-quartzo.jpg",
    imageAlt: "Placeholder temporário: Cristal de Quartzo Transparente",
    action: "cart",
    popular: true,
  },
  {
    id: "lavanda",
    name: "Óleo Essencial de Lavanda 10ml",
    category: "Terapias",
    categoryId: "terapias",
    price: 44.9,
    rating: 4.6,
    reviewCount: 73,
    imageSrc: "/images/potala/product-lavanda.jpg",
    imageAlt: "Placeholder temporário: Óleo Essencial de Lavanda 10ml",
    action: "cart",
    popular: true,
  },
  {
    id: "kit-limpeza",
    name: "Kit Limpeza Energética",
    category: "Meditação",
    categoryId: "meditacao",
    price: 119.9,
    rating: 4.9,
    reviewCount: 64,
    imageSrc: "/images/potala/product-kit-limpeza.jpg",
    imageAlt: "Placeholder temporário: Kit Limpeza Energética",
    badge: "Novo",
    action: "cart",
    isNew: true,
  },
  {
    id: "sino-tibetano",
    name: "Sino Tibetano 7 Metais",
    category: "Meditação",
    categoryId: "meditacao",
    price: 179.9,
    rating: 4.8,
    reviewCount: 51,
    imageSrc: "/images/potala/product-sino.jpg",
    imageAlt: "Placeholder temporário: Sino Tibetano 7 Metais",
    badge: "Novo",
    action: "cart",
    isNew: true,
  },
];

export const MOST_SEARCHED_PRODUCTS: CompactProduct[] = [
  {
    id: "incenso-7-ervas",
    name: "Incenso Natural 7 Ervas Sagradas",
    imageSrc: "/images/potala/discovery-incenso-7-ervas-final.png",
    price: 36.9,
    rating: 5,
    reviewCount: 82,
    href: "#produtos",
  },
  {
    id: "quartzo-transparente",
    name: "Cristal de Quartzo Transparente",
    imageSrc: "/images/potala/discovery-quartzo-transparente-final.png",
    price: 89.9,
    rating: 5,
    reviewCount: 64,
    href: "#produtos",
  },
  {
    id: "livro-despertar",
    name: "Livro O Despertar da Consciência",
    imageSrc: "/images/potala/discovery-livro-despertar-final.png",
    price: 49.9,
    rating: 5,
    reviewCount: 53,
    href: "#produtos",
  },
  {
    id: "oleo-lavanda-discovery",
    name: "Óleo Essencial de Lavanda 10ml",
    imageSrc: "/images/potala/discovery-oleo-lavanda-final.png",
    price: 44.9,
    rating: 5,
    reviewCount: 47,
    href: "#produtos",
  },
];

export const NEW_ARRIVAL_PRODUCTS: CompactProduct[] = [
  {
    id: "curso-chakras",
    name: "Curso Chakras e Equilíbrio Energético",
    imageSrc: "/images/potala/discovery-curso-chakras-final.png",
    price: 297,
    rating: 5,
    reviewCount: 85,
    href: "#novidades",
  },
  {
    id: "kit-limpeza-discovery",
    name: "Kit Limpeza Energética",
    imageSrc: "/images/potala/discovery-kit-limpeza-final.png",
    price: 119.9,
    rating: 5,
    reviewCount: 29,
    href: "#novidades",
  },
  {
    id: "caderno-mantras",
    name: "Caderno de Mantras",
    imageSrc: "/images/potala/discovery-caderno-mantras-final.png",
    price: 39.9,
    rating: 5,
    reviewCount: 19,
    href: "#novidades",
  },
  {
    id: "sino-tibetano-discovery",
    name: "Sino Tibetano 7 Metais",
    imageSrc: "/images/potala/discovery-sino-tibetano-final.png",
    price: 179.9,
    rating: 5,
    reviewCount: 244,
    href: "#novidades",
  },
];

export const PHILOSOPHY_PILLARS: PhilosophyPillar[] = [
  {
    id: "produtos",
    title: "Produtos Conscientes",
    description: "Selecionados com propósito e amor.",
    icon: "products",
  },
  {
    id: "saber",
    title: "Saber que Transforma",
    description: "Conteúdos e cursos para expandir.",
    icon: "knowledge",
  },
  {
    id: "cura",
    title: "Cura que Acolhe",
    description: "Terapias e práticas para o bem-estar.",
    icon: "healing",
  },
  {
    id: "comunidade",
    title: "Comunidade que Inspira",
    description: "Conexão, troca e evolução coletiva.",
    icon: "community",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "ana",
    name: "Ana Beatriz",
    location: "São Paulo, SP",
    quote:
      "Os cristais e os cursos do Instituto Potala trouxeram mais presença e calma para a minha rotina. A qualidade dos produtos é notável.",
    rating: 5,
    avatarSrc: "/images/potala/avatar-1.jpg",
  },
  {
    id: "rafael",
    name: "Rafael Mendes",
    location: "Curitiba, PR",
    quote:
      "Comprei o kit de limpeza energética e o sino tibetano. Chegaram com cuidado e a experiência de compra foi simples e acolhedora.",
    rating: 5,
    avatarSrc: "/images/potala/avatar-2.jpg",
  },
  {
    id: "lucia",
    name: "Lúcia Ferreira",
    location: "Belo Horizonte, MG",
    quote:
      "Encontrei livros e incensos que uso diariamente nas minhas práticas. Sinto a identidade espiritual do Instituto em cada detalhe.",
    rating: 5,
    avatarSrc: "/images/potala/avatar-3.jpg",
  },
];

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Institucional",
    links: [
      { label: "Sobre o Instituto Potala", href: "#filosofia" },
      { label: "Nossa filosofia", href: "#filosofia" },
      { label: "Blog e inspirações", href: "#newsletter" },
      { label: "Trabalhe conosco", href: "#contato" },
    ],
  },
  {
    title: "Ajuda",
    links: [
      { label: "Central de ajuda", href: "#contato" },
      { label: "Como comprar", href: "#produtos" },
      { label: "Trocas e devoluções", href: "#contato" },
      { label: "Política de privacidade", href: "#contato" },
    ],
  },
  {
    title: "Minha conta",
    links: [
      { label: "Entrar / Minha conta", href: "#topo" },
      { label: "Meus pedidos", href: "#topo" },
      { label: "Lista de desejos", href: "#topo" },
      { label: "Carrinho", href: "#topo" },
    ],
  },
];

export const CONTACT_INFO: ContactInfo = {
  phone: "(11) 4000-2020",
  email: "contato@institutopotala.com.br",
  hours: "Seg. a sex., das 9h às 18h",
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "visa",
    label: "Visa",
    imageSrc: "/images/potala/pay-visa.png",
  },
  {
    id: "master",
    label: "Mastercard",
    imageSrc: "/images/potala/pay-master.png",
  },
  {
    id: "elo",
    label: "Elo",
    imageSrc: "/images/potala/pay-elo.png",
  },
  {
    id: "pix",
    label: "Pix",
    imageSrc: "/images/potala/pay-pix.png",
  },
  {
    id: "boleto",
    label: "Boleto",
    imageSrc: "/images/potala/pay-boleto.png",
  },
];

export const SOCIAL_LINKS = [
  { id: "instagram", label: "Instagram", href: "#topo" },
  { id: "facebook", label: "Facebook", href: "#topo" },
  { id: "youtube", label: "YouTube", href: "#topo" },
  { id: "pinterest", label: "Pinterest", href: "#topo" },
] as const;

export function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter((product) => product.featured);
}

export function getPopularProducts(): Product[] {
  return PRODUCTS.filter((product) => product.popular);
}

export function getNewProducts(): Product[] {
  return PRODUCTS.filter((product) => product.isNew || product.badge === "Novo");
}
