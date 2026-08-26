"use client";

import Image from "next/image";
import Link from "next/link";
import { AccountChrome } from "@/components/account/AccountChrome";
import { useAccountData } from "@/features/account/AccountDataContext";
import { formatPrice } from "@/data/marketplace";

export default function AccountFavoritesPage() {
  const { db, isHydrated, toggleFavorite } = useAccountData();

  return (
    <AccountChrome
      title="Favoritos"
      lead="Lista de desejos sincronizada com os cards do catálogo."
      breadcrumbCurrent="Favoritos"
    >
      {!isHydrated || !db ? (
        <p role="status">Carregando…</p>
      ) : db.favorites.length === 0 ? (
        <p>Sua lista de desejos está vazia.</p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          }}
        >
          {db.favorites.map((item) => (
            <li
              key={item.productId}
              style={{
                border: "1px solid var(--potala-border)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <Link href={`/produto/${item.slug}`}>
                <div style={{ position: "relative", aspectRatio: "1" }}>
                  <Image
                    src={item.imageSrc}
                    alt={item.name}
                    fill
                    sizes="180px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <p style={{ padding: "0 8px" }}>{item.name}</p>
                <p style={{ padding: "0 8px 8px" }}>{formatPrice(item.price)}</p>
              </Link>
              <button
                type="button"
                style={{ minHeight: 44, width: "100%" }}
                onClick={() =>
                  toggleFavorite({
                    productId: item.productId,
                    slug: item.slug,
                    name: item.name,
                    imageSrc: item.imageSrc,
                    price: item.price,
                  })
                }
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </AccountChrome>
  );
}
