import { ADMIN_ALERTS } from "@/data/admin";
import styles from "./admin.module.css";

export function AdminAlerts() {
  return (
    <section className={styles.panel} aria-labelledby="admin-alerts-title">
      <div className={styles.panelHead}>
        <h2 id="admin-alerts-title" className={styles.panelTitle}>
          Alertas
        </h2>
      </div>

      <div className={styles.alertList}>
        {ADMIN_ALERTS.map((alert) => {
          const toneClass =
            alert.severity === "danger"
              ? styles.alertDanger
              : alert.severity === "warning"
                ? styles.alertWarning
                : styles.alertInfo;

          return (
            <article key={alert.id} className={`${styles.alertItem} ${toneClass}`}>
              <h3 className={styles.alertTitle}>{alert.title}</h3>
              <p className={styles.alertDetail}>{alert.detail}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
