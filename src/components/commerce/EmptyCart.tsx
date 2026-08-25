import Link from "next/link";
import styles from "./EmptyCart.module.css";

export function EmptyCart() {
  return (
    <div className={styles.empty}>
      <h2 className={styles.title}>Seu carrinho está vazio</h2>
      <p className={styles.text}>
        Explore o marketplace e adicione produtos, cursos e experiências para
        continuar sua jornada.
      </p>
      <Link href="/#produtos" className={styles.cta}>
        Ver produtos
      </Link>
    </div>
  );
}
