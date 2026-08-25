"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/types/marketplace";
import styles from "./ProductGallery.module.css";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  if (!active) {
    return null;
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.main}>
        <Image
          src={active.src}
          alt={active.alt || productName}
          fill
          className={styles.mainImage}
          sizes="(max-width: 1023px) 92vw, 42vw"
          priority
        />
      </div>

      {images.length > 1 ? (
        <ul className={styles.thumbs} aria-label="Miniaturas do produto">
          {images.map((image, index) => {
            const selected = index === activeIndex;
            return (
              <li key={`${image.src}-${index}`}>
                <button
                  type="button"
                  className={`${styles.thumb} ${selected ? styles.thumbActive : ""}`}
                  aria-label={`Ver imagem ${index + 1} de ${images.length}`}
                  aria-pressed={selected}
                  onClick={() => setActiveIndex(index)}
                >
                  <Image
                    src={image.src}
                    alt=""
                    fill
                    className={styles.thumbImage}
                    sizes="88px"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
