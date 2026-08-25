"use client";

import { useState } from "react";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import styles from "./AccountMobileNavigation.module.css";

export function AccountMobileNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls="account-mobile-menu"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? "Fechar menu da conta" : "Menu da conta"}
      </button>
      <div id="account-mobile-menu" hidden={!open} className={styles.panel}>
        {open ? <AccountSidebar /> : null}
      </div>
    </div>
  );
}
