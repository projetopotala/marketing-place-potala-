import type { ReactNode } from "react";
import styles from "./shared.module.css";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
}

interface AdminDataTableProps<T extends { id: string }> {
  caption: string;
  columns: Column<T>[];
  rows: T[];
  mobileCard?: (row: T) => ReactNode;
}

export function AdminDataTable<T extends { id: string }>({
  caption,
  columns,
  rows,
  mobileCard,
}: AdminDataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className={styles.empty} role="status">
        Nenhum registro encontrado.
      </div>
    );
  }

  return (
    <>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {mobileCard ? (
        <div className={styles.mobileCards}>
          {rows.map((row) => (
            <article key={row.id} className={styles.mobileCard}>
              {mobileCard(row)}
            </article>
          ))}
        </div>
      ) : null}
    </>
  );
}

export { styles as sharedStyles };
