"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import { CONTENT_STATUS_LABEL } from "@/features/admin/domain/status";
import type {
  ContentStatus,
  CourseContent,
} from "@/features/admin/domain/types";
import { formatMoney } from "@/features/admin/utils/currency";
import { downloadCsv, toCsv } from "@/features/admin/utils/csv";
import { includesQuery, paginate, sortBy } from "@/features/admin/utils/filters";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import {
  AdminMetricCard,
  AdminMetricsRow,
} from "@/components/admin/shared/AdminMetricCard";
import {
  AdminDataTable,
  sharedStyles,
} from "@/components/admin/shared/AdminDataTable";
import {
  AdminFilterBar,
  AdminPagination,
  AdminStatusBadge,
  Field,
} from "@/components/admin/shared/AdminStatusBadge";
import { AdminModal } from "@/components/admin/shared/AdminModal";
import { useAdminToast } from "@/components/admin/shared/AdminToastProvider";

function contentTone(status: ContentStatus) {
  if (status === "published") return "success" as const;
  if (status === "review") return "warning" as const;
  if (status === "rejected") return "danger" as const;
  return "muted" as const;
}

const EMPTY = {
  title: "",
  instructor: "",
  category: "Cursos",
  format: "video" as CourseContent["format"],
  priceCents: 9900,
  students: 0,
  status: "draft" as ContentStatus,
  description: "",
};

export function ContentsView() {
  const { db, isHydrated, repo, refresh } = useAdminData();
  const toast = useAdminToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ContentStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<"create" | CourseContent | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const filtered = useMemo(() => {
    const list = db.contents.filter((content) => {
      if (status !== "all" && content.status !== status) return false;
      return includesQuery(
        `${content.title} ${content.instructor} ${content.category}`,
        query,
      );
    });
    return sortBy(list, (c) => c.title, "asc");
  }, [db.contents, query, status]);

  const paged = paginate(filtered, page, 8);

  const metrics = useMemo(
    () => ({
      total: db.contents.length,
      review: db.contents.filter((c) => c.status === "review").length,
      published: db.contents.filter((c) => c.status === "published").length,
      students: db.contents.reduce((sum, c) => sum + c.students, 0),
    }),
    [db.contents],
  );

  function openCreate() {
    setForm(EMPTY);
    setModal("create");
  }

  function openEdit(content: CourseContent) {
    setForm({
      title: content.title,
      instructor: content.instructor,
      category: content.category,
      format: content.format,
      priceCents: content.priceCents,
      students: content.students,
      status: content.status,
      description: content.description,
    });
    setModal(content);
  }

  function save() {
    if (!form.title.trim()) {
      toast.push("Informe o título", "error");
      return;
    }
    if (modal === "create") {
      refresh(
        repo.createContent({
          title: form.title.trim(),
          instructor: form.instructor.trim() || "Instrutor",
          category: form.category.trim() || "Cursos",
          format: form.format,
          priceCents: form.priceCents,
          students: form.students,
          status: form.status,
          description: form.description.trim(),
          modules: [],
        }),
      );
      toast.push("Conteúdo criado");
    } else if (modal) {
      refresh(
        repo.updateContent(modal.id, {
          title: form.title.trim(),
          instructor: form.instructor.trim(),
          category: form.category.trim(),
          format: form.format,
          priceCents: form.priceCents,
          description: form.description.trim(),
        }),
      );
      toast.push("Conteúdo atualizado");
    }
    setModal(null);
  }

  function exportCsv() {
    downloadCsv(
      "conteudos.csv",
      toCsv(
        ["Título", "Instrutor", "Status", "Preço", "Alunos"],
        filtered.map((c) => [
          c.title,
          c.instructor,
          CONTENT_STATUS_LABEL[c.status],
          formatMoney(c.priceCents),
          String(c.students),
        ]),
      ),
    );
    toast.push("CSV exportado");
  }

  if (!isHydrated) {
    return <div className={sharedStyles.skeleton} aria-busy="true" />;
  }

  return (
    <div className={sharedStyles.stack}>
      <AdminPageHeader
        title="Conteúdos / Cursos"
        description="Crie, revise, publique e arquive conteúdos do marketplace."
        actions={
          <>
            <button type="button" className={sharedStyles.btnSecondary} onClick={exportCsv}>
              Exportar CSV
            </button>
            <button type="button" className={sharedStyles.btn} onClick={openCreate}>
              Novo conteúdo
            </button>
          </>
        }
      />

      <AdminMetricsRow>
        <AdminMetricCard label="Total" value={String(metrics.total)} />
        <AdminMetricCard label="Em revisão" value={String(metrics.review)} />
        <AdminMetricCard label="Publicados" value={String(metrics.published)} />
        <AdminMetricCard label="Alunos" value={String(metrics.students)} />
      </AdminMetricsRow>

      <AdminFilterBar>
        <Field label="Buscar">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </Field>
        <Field label="Status">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ContentStatus | "all");
              setPage(1);
            }}
          >
            <option value="all">Todos</option>
            {(Object.keys(CONTENT_STATUS_LABEL) as ContentStatus[]).map((key) => (
              <option key={key} value={key}>
                {CONTENT_STATUS_LABEL[key]}
              </option>
            ))}
          </select>
        </Field>
      </AdminFilterBar>

      <AdminDataTable
        caption="Conteúdos"
        rows={paged.items}
        columns={[
          {
            key: "title",
            header: "Título",
            render: (row) => (
              <Link href={`/admin/conteudos/${row.id}`} className={sharedStyles.linkBtn}>
                {row.title}
              </Link>
            ),
          },
          { key: "instructor", header: "Instrutor", render: (row) => row.instructor },
          {
            key: "status",
            header: "Status",
            render: (row) => (
              <AdminStatusBadge
                label={CONTENT_STATUS_LABEL[row.status]}
                tone={contentTone(row.status)}
              />
            ),
          },
          {
            key: "price",
            header: "Preço",
            render: (row) => formatMoney(row.priceCents),
          },
          {
            key: "actions",
            header: "Ações",
            render: (row) => (
              <div className={sharedStyles.rowActions}>
                <button
                  type="button"
                  className={sharedStyles.linkBtn}
                  onClick={() => openEdit(row)}
                >
                  Editar
                </button>
                {row.status === "draft" ? (
                  <button
                    type="button"
                    className={sharedStyles.linkBtn}
                    onClick={() => {
                      refresh(repo.changeContentStatus(row.id, "review"));
                      toast.push("Enviado para revisão");
                    }}
                  >
                    Revisar
                  </button>
                ) : null}
                {row.status === "review" ? (
                  <>
                    <button
                      type="button"
                      className={sharedStyles.linkBtn}
                      onClick={() => {
                        refresh(repo.changeContentStatus(row.id, "published"));
                        toast.push("Aprovado e publicado");
                      }}
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      className={sharedStyles.linkBtn}
                      onClick={() => {
                        setRejectId(row.id);
                        setRejectNote("");
                      }}
                    >
                      Rejeitar
                    </button>
                  </>
                ) : null}
                {row.status === "published" ? (
                  <button
                    type="button"
                    className={sharedStyles.linkBtn}
                    onClick={() => {
                      refresh(repo.changeContentStatus(row.id, "archived"));
                      toast.push("Arquivado");
                    }}
                  >
                    Arquivar
                  </button>
                ) : null}
              </div>
            ),
          },
        ]}
        mobileCard={(row) => (
          <>
            <Link href={`/admin/conteudos/${row.id}`} className={sharedStyles.linkBtn}>
              {row.title}
            </Link>
            <span>{row.instructor}</span>
            <AdminStatusBadge
              label={CONTENT_STATUS_LABEL[row.status]}
              tone={contentTone(row.status)}
            />
          </>
        )}
      />

      <AdminPagination
        page={paged.page}
        pages={paged.pages}
        total={paged.total}
        onChange={setPage}
      />

      <AdminModal
        open={Boolean(modal)}
        title={modal === "create" ? "Novo conteúdo" : "Editar conteúdo"}
        onClose={() => setModal(null)}
        actions={
          <>
            <button
              type="button"
              className={sharedStyles.btnGhost}
              onClick={() => setModal(null)}
            >
              Cancelar
            </button>
            <button type="button" className={sharedStyles.btn} onClick={save}>
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
          <Field label="Formato">
            <select
              value={form.format}
              onChange={(e) =>
                setForm({
                  ...form,
                  format: e.target.value as CourseContent["format"],
                })
              }
            >
              <option value="video">Vídeo</option>
              <option value="live">Ao vivo</option>
              <option value="text">Texto</option>
            </select>
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
        open={Boolean(rejectId)}
        title="Rejeitar conteúdo"
        onClose={() => setRejectId(null)}
        actions={
          <>
            <button
              type="button"
              className={sharedStyles.btnGhost}
              onClick={() => setRejectId(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={sharedStyles.btnDanger}
              onClick={() => {
                if (!rejectId) return;
                refresh(repo.changeContentStatus(rejectId, "rejected", rejectNote));
                setRejectId(null);
                toast.push("Conteúdo rejeitado");
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
