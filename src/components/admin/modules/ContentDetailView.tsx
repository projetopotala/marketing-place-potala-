"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import { CONTENT_STATUS_LABEL } from "@/features/admin/domain/status";
import type { ContentStatus, CourseContent } from "@/features/admin/domain/types";
import { formatMoney } from "@/features/admin/utils/currency";
import { formatDateTime } from "@/features/admin/utils/dates";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import {
  AdminEmptyState,
  AdminStatusBadge,
  Field,
} from "@/components/admin/shared/AdminStatusBadge";
import { sharedStyles } from "@/components/admin/shared/AdminDataTable";
import { AdminModal } from "@/components/admin/shared/AdminModal";
import { useAdminToast } from "@/components/admin/shared/AdminToastProvider";
import moduleStyles from "./modules.module.css";

export function ContentDetailView({ id }: { id: string }) {
  const { db, isHydrated, repo, refresh } = useAdminData();
  const toast = useAdminToast();
  const content = useMemo(
    () => db.contents.find((c) => c.id === id),
    [db.contents, id],
  );
  const [editOpen, setEditOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [form, setForm] = useState({
    title: "",
    instructor: "",
    category: "",
    description: "",
    priceCents: 0,
    format: "video" as CourseContent["format"],
  });

  if (!isHydrated) {
    return <div className={sharedStyles.skeleton} aria-busy="true" />;
  }

  if (!content) {
    return (
      <AdminEmptyState
        title="Conteúdo não encontrado"
        description="O identificador informado não existe."
      />
    );
  }

  const current = content;

  function setStatus(status: ContentStatus, note?: string) {
    refresh(repo.changeContentStatus(current.id, status, note));
    toast.push(`Status: ${CONTENT_STATUS_LABEL[status]}`);
  }

  return (
    <div className={sharedStyles.stack}>
      <AdminPageHeader
        title={content.title}
        description={`${content.instructor} · ${content.category}`}
        actions={
          <div className={sharedStyles.rowActions}>
            <Link href="/admin/conteudos" className={sharedStyles.btnGhost}>
              Voltar
            </Link>
            <button
              type="button"
              className={sharedStyles.btnSecondary}
              onClick={() => {
                setForm({
                  title: content.title,
                  instructor: content.instructor,
                  category: content.category,
                  description: content.description,
                  priceCents: content.priceCents,
                  format: content.format,
                });
                setEditOpen(true);
              }}
            >
              Editar
            </button>
            {content.status === "draft" ? (
              <button
                type="button"
                className={sharedStyles.btn}
                onClick={() => setStatus("review")}
              >
                Enviar para revisão
              </button>
            ) : null}
            {content.status === "review" ? (
              <>
                <button
                  type="button"
                  className={sharedStyles.btn}
                  onClick={() => setStatus("published")}
                >
                  Aprovar / Publicar
                </button>
                <button
                  type="button"
                  className={sharedStyles.btnDanger}
                  onClick={() => {
                    setRejectNote("");
                    setRejectOpen(true);
                  }}
                >
                  Rejeitar
                </button>
              </>
            ) : null}
            {content.status === "published" ? (
              <button
                type="button"
                className={sharedStyles.btnSecondary}
                onClick={() => setStatus("archived")}
              >
                Arquivar
              </button>
            ) : null}
          </div>
        }
      />

      <div className={sharedStyles.panel}>
        <h2 className={sharedStyles.panelTitle}>Detalhes</h2>
        <div className={moduleStyles.kvGrid}>
          <div>
            <p className={moduleStyles.kvLabel}>Status</p>
            <AdminStatusBadge label={CONTENT_STATUS_LABEL[content.status]} />
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Formato</p>
            <p className={moduleStyles.kvValue}>{content.format}</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Preço</p>
            <p className={moduleStyles.kvValue}>{formatMoney(content.priceCents)}</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Alunos</p>
            <p className={moduleStyles.kvValue}>{content.students}</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Descrição</p>
            <p className={moduleStyles.kvValue}>{content.description || "—"}</p>
          </div>
          {content.moderationNote ? (
            <div>
              <p className={moduleStyles.kvLabel}>Nota de moderação</p>
              <p className={moduleStyles.kvValue}>{content.moderationNote}</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className={sharedStyles.panel}>
        <h2 className={sharedStyles.panelTitle}>Módulos</h2>
        <ul className={moduleStyles.timeline}>
          {content.modules.map((mod) => (
            <li key={mod.id} className={moduleStyles.timelineItem}>
              <p className={moduleStyles.timelineLabel}>{mod.title}</p>
              <p className={moduleStyles.timelineDetail}>
                {mod.lessons.length} aulas ·{" "}
                {mod.lessons.reduce((sum, l) => sum + l.durationMinutes, 0)} min
              </p>
            </li>
          ))}
          {content.modules.length === 0 ? (
            <li className={moduleStyles.muted}>Sem módulos cadastrados.</li>
          ) : null}
        </ul>
      </div>

      <div className={sharedStyles.panel}>
        <h2 className={sharedStyles.panelTitle}>Linha do tempo</h2>
        <ul className={moduleStyles.timeline}>
          {content.timeline.map((event) => (
            <li key={event.id} className={moduleStyles.timelineItem}>
              <p className={moduleStyles.timelineAt}>{formatDateTime(event.at)}</p>
              <p className={moduleStyles.timelineLabel}>{event.label}</p>
              {event.detail ? (
                <p className={moduleStyles.timelineDetail}>{event.detail}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <AdminModal
        open={editOpen}
        title="Editar conteúdo"
        onClose={() => setEditOpen(false)}
        actions={
          <>
            <button
              type="button"
              className={sharedStyles.btnGhost}
              onClick={() => setEditOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={sharedStyles.btn}
              onClick={() => {
                refresh(
                  repo.updateContent(content.id, {
                    title: form.title.trim() || content.title,
                    instructor: form.instructor.trim(),
                    category: form.category.trim(),
                    description: form.description.trim(),
                    priceCents: form.priceCents,
                    format: form.format,
                  }),
                );
                setEditOpen(false);
                toast.push("Atualizado");
              }}
            >
              Salvar
            </button>
          </>
        }
      >
        <div className={sharedStyles.stack}>
          <Field label="Título">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <Field label="Instrutor">
            <input
              value={form.instructor}
              onChange={(e) => setForm({ ...form, instructor: e.target.value })}
            />
          </Field>
          <Field label="Categoria">
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </Field>
          <Field label="Preço (centavos)">
            <input
              type="number"
              value={form.priceCents}
              onChange={(e) =>
                setForm({ ...form, priceCents: Number(e.target.value) || 0 })
              }
            />
          </Field>
          <Field label="Descrição">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
        </div>
      </AdminModal>

      <AdminModal
        open={rejectOpen}
        title="Rejeitar conteúdo"
        onClose={() => setRejectOpen(false)}
        actions={
          <>
            <button
              type="button"
              className={sharedStyles.btnGhost}
              onClick={() => setRejectOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={sharedStyles.btnDanger}
              onClick={() => {
                setStatus("rejected", rejectNote);
                setRejectOpen(false);
              }}
            >
              Rejeitar
            </button>
          </>
        }
      >
        <Field label="Motivo">
          <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} />
        </Field>
      </AdminModal>
    </div>
  );
}
