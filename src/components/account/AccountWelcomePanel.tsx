import { ACCOUNT_WELCOME_STATS } from "@/data/account";
import { formatPrice } from "@/data/marketplace";
import styles from "./AccountWelcomePanel.module.css";

interface AccountWelcomePanelProps {
  name: string;
}

export function AccountWelcomePanel({ name }: AccountWelcomePanelProps) {
  return (
    <section className={styles.panel} aria-labelledby="welcome-title">
      <div>
        <h2 id="welcome-title" className={styles.title}>
          Bem-vindo(a), {name}
        </h2>
        <p className={styles.text}>
          Que sua jornada continue com presença, clareza e escolhas conscientes.
          Este painel reúne um resumo demonstrativo da sua conta no Instituto
          Potala Marketplace.
        </p>
      </div>
      <dl className={styles.stats}>
        <div>
          <dt>Cliente desde</dt>
          <dd>{ACCOUNT_WELCOME_STATS.memberSince}</dd>
        </div>
        <div>
          <dt>Total de pedidos</dt>
          <dd>{ACCOUNT_WELCOME_STATS.totalOrders}</dd>
        </div>
        <div>
          <dt>Total gasto</dt>
          <dd>{formatPrice(ACCOUNT_WELCOME_STATS.totalSpent)}</dd>
        </div>
      </dl>
    </section>
  );
}
