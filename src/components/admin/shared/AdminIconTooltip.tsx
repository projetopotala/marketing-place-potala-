"use client";

import type { ReactNode } from "react";
import { Tooltip } from "radix-ui";
import styles from "./shared.module.css";

interface AdminIconTooltipProps {
  label: string;
  children: ReactNode;
}

export function AdminIconTooltip({ label, children }: AdminIconTooltipProps) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className={styles.tooltip} sideOffset={6}>
            {label}
            <Tooltip.Arrow className={styles.tooltipArrow} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
