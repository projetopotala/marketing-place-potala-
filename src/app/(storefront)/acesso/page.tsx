import Link from "next/link";
import { Suspense } from "react";
import { AccessForm } from "@/components/auth/AccessForm";
import styles from "./page.module.css";

export default function AccessPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href="/">Início</Link>
            </li>
            <li aria-current="page">Acesso</li>
          </ol>
        </nav>

        <Suspense
          fallback={
            <p className={styles.loading} role="status">
              Carregando formulário…
            </p>
          }
        >
          <AccessForm />
        </Suspense>
      </div>
    </div>
  );
}
