import type { ReactNode } from "react";
import styles from "./shared.module.css";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  icon,
  actions,
}: AdminPageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerMain}>
        {icon ? <span className={styles.icon}>{icon}</span> : null}
        <div>
          <h1 className={styles.title}>{title}</h1>
          {description ? <p className={styles.subtitle}>{description}</p> : null}
        </div>
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
