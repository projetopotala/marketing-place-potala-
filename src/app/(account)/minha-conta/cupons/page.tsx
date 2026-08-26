"use client";

import { AccountChrome } from "@/components/account/AccountChrome";
import { ActiveCoupons } from "@/components/account/ActiveCoupons";
import { ACCOUNT_ACTIVE_COUPONS } from "@/data/account";

export default function AccountCouponsPage() {
  return (
    <AccountChrome
      title="Cupons"
      lead="Cupons demonstrativos disponíveis para a loja."
      breadcrumbCurrent="Cupons"
    >
      <ActiveCoupons coupons={ACCOUNT_ACTIVE_COUPONS} />
    </AccountChrome>
  );
}
