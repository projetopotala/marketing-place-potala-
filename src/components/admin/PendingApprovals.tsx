import { ADMIN_PENDING_APPROVALS } from "@/data/admin";
import styles from "./admin.module.css";

export function PendingApprovals() {
  return (
    <section className={styles.panel} aria-labelledby="pending-approvals-title">
      <div className={styles.panelHead}>
        <h2 id="pending-approvals-title" className={styles.panelTitle}>
          Aprovações Pendentes
        </h2>
      </div>

      <div className={styles.approvalList}>
        {ADMIN_PENDING_APPROVALS.map((item) => (
          <article key={item.id} className={styles.approvalItem}>
            <h3 className={styles.approvalTitle}>
              {item.title}
              <span className={styles.approvalCount}>{item.count}</span>
            </h3>
            <p className={styles.approvalDesc}>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
