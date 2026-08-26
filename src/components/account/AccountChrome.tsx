"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AccountMobileNavigation } from "@/components/account/AccountMobileNavigation";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import styles from "@/app/(account)/minha-conta/page.module.css";

interface AccountChromeProps {
  title: string;
  lead?: string;
  breadcrumbCurrent: string;
  children: ReactNode;
}

export function AccountChrome({
  title,
  lead,
  breadcrumbCurrent,
  children,
}: AccountChromeProps) {
  return (
    <AuthGuard>
      <div className={styles.page}>
        <div className={styles.container}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">Início</Link>
              </li>
              <li>
                <Link href="/minha-conta">Minha conta</Link>
              </li>
              <li aria-current="page">{breadcrumbCurrent}</li>
            </ol>
          </nav>

          <AccountMobileNavigation />

          <div className={styles.layout}>
            <div className={styles.sidebarDesktop}>
              <AccountSidebar />
            </div>
            <div className={styles.content}>
              <header className={styles.heading}>
                <h1>{title}</h1>
                {lead ? <p>{lead}</p> : null}
              </header>
              {children}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
