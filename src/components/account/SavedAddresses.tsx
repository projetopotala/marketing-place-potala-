import type { AccountAddress } from "@/types/account";
import styles from "./SavedAddresses.module.css";

interface SavedAddressesProps {
  addresses: AccountAddress[];
}

export function SavedAddresses({ addresses }: SavedAddressesProps) {
  return (
    <section className={styles.section} aria-labelledby="addresses-title">
      <h2 id="addresses-title">Endereços principais</h2>
      <ul className={styles.list}>
        {addresses.map((address) => (
          <li key={address.id}>
            <div className={styles.head}>
              <strong>{address.label}</strong>
              {address.isDefault ? <span>Padrão</span> : null}
            </div>
            <p>{address.line}</p>
            <p>{address.city}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
