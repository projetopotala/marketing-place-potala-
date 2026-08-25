"use client";

import { useMemo, useState } from "react";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import type { Attribute, Category } from "@/features/admin/domain/types";
import { downloadCsv, toCsv } from "@/features/admin/utils/csv";
import { includesQuery } from "@/features/admin/utils/filters";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import {
  AdminMetricCard,
  AdminMetricsRow,
} from "@/components/admin/shared/AdminMetricCard";
import { sharedStyles } from "@/components/admin/shared/AdminDataTable";
import {
  AdminStatusBadge,
  Field,
} from "@/components/admin/shared/AdminStatusBadge";
import { AdminModal, AdminConfirmDialog } from "@/components/admin/shared/AdminModal";
import { useAdminToast } from "@/components/admin/shared/AdminToastProvider";
import moduleStyles from "./modules.module.css";

export function CatalogView() {
  const { db, isHydrated, repo, refresh } = useAdminData();
  const toast = useAdminToast();
  const [query, setQuery] = useState("");
  const [categoryModal, setCategoryModal] = useState<"create" | Category | null>(null);
  const [attrModal, setAttrModal] = useState<"create" | Attribute | null>(null);
  const [assocCategory, setAssocCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState("");
  const [catParent, setCatParent] = useState<string>("");
  const [attrName, setAttrName] = useState("");
  const [attrValues, setAttrValues] = useState("");
  const [assocIds, setAssocIds] = useState<string[]>([]);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);

  const roots = useMemo(() => {
    const filtered = db.categories.filter((c) =>
      includesQuery(c.name, query),
    );
    const ids = new Set(filtered.map((c) => c.id));
    // include parents of matched children
    for (const c of filtered) {
      if (c.parentId) ids.add(c.parentId);
    }
    return db.categories.filter((c) => !c.parentId && ids.has(c.id));
  }, [db.categories, query]);

  const childrenOf = (parentId: string) =>
    db.categories.filter(
      (c) =>
        c.parentId === parentId &&
        (includesQuery(c.name, query) || includesQuery(
          db.categories.find((p) => p.id === parentId)?.name ?? "",
          query,
        )),
    );

  const metrics = useMemo(
    () => ({
      categories: db.categories.length,
      active: db.categories.filter((c) => c.status === "active").length,
      attributes: db.attributes.length,
      linked: db.categories.filter((c) => c.attributeIds.length > 0).length,
    }),
    [db.categories, db.attributes],
  );

  function openCreateCategory() {
    setCatName("");
    setCatParent("");
    setCategoryModal("create");
  }

  function openEditCategory(category: Category) {
    setCatName(category.name);
    setCatParent(category.parentId ?? "");
    setCategoryModal(category);
  }

  function saveCategory() {
    if (!catName.trim()) {
      toast.push("Informe o nome", "error");
      return;
    }
    if (categoryModal === "create") {
      refresh(
        repo.createCategory({
          name: catName.trim(),
          parentId: catParent || null,
          status: "active",
          attributeIds: [],
        }),
      );
      toast.push("Categoria criada");
    } else if (categoryModal) {
      refresh(
        repo.updateCategory(categoryModal.id, {
          name: catName.trim(),
          parentId: catParent || null,
        }),
      );
      toast.push("Categoria atualizada");
    }
    setCategoryModal(null);
  }

  function openCreateAttr() {
    setAttrName("");
    setAttrValues("");
    setAttrModal("create");
  }

  function openEditAttr(attr: Attribute) {
    setAttrName(attr.name);
    setAttrValues(attr.values.join(", "));
    setAttrModal(attr);
  }

  function saveAttribute() {
    if (!attrName.trim()) {
      toast.push("Informe o nome", "error");
      return;
    }
    const values = attrValues
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    if (attrModal === "create") {
      refresh(repo.createAttribute({ name: attrName.trim(), values }));
      toast.push("Atributo criado");
    } else if (attrModal) {
      refresh(repo.updateAttribute(attrModal.id, { name: attrName.trim(), values }));
      toast.push("Atributo atualizado");
    }
    setAttrModal(null);
  }

  function exportCsv() {
    downloadCsv(
      "catalogo.csv",
      toCsv(
        ["Categoria", "Pai", "Status", "Atributos"],
        db.categories.map((c) => [
          c.name,
          db.categories.find((p) => p.id === c.parentId)?.name ?? "",
          c.status,
          c.attributeIds
            .map((id) => db.attributes.find((a) => a.id === id)?.name ?? id)
            .join("; "),
        ]),
      ),
    );
    toast.push("CSV exportado");
  }

  if (!isHydrated) {
    return <div className={sharedStyles.skeleton} aria-busy="true" />;
  }

  function renderNode(category: Category, nested = false) {
    return (
      <div
        key={category.id}
        className={`${moduleStyles.treeNode} ${nested ? moduleStyles.treeChild : ""}`}
      >
        <div className={sharedStyles.rowActions} style={{ justifyContent: "space-between" }}>
          <div>
            <strong>{category.name}</strong>{" "}
            <AdminStatusBadge
              label={category.status === "active" ? "Ativa" : "Inativa"}
              tone={category.status === "active" ? "success" : "muted"}
            />
            <p className={moduleStyles.muted}>
              Atributos:{" "}
              {category.attributeIds
                .map((id) => db.attributes.find((a) => a.id === id)?.name ?? id)
                .join(", ") || "—"}
            </p>
          </div>
          <div className={sharedStyles.rowActions}>
            <button
              type="button"
              className={sharedStyles.linkBtn}
              onClick={() => openEditCategory(category)}
            >
              Editar
            </button>
            <button
              type="button"
              className={sharedStyles.linkBtn}
              onClick={() => {
                setAssocCategory(category);
                setAssocIds([...category.attributeIds]);
              }}
            >
              Atributos
            </button>
            {category.status === "active" ? (
              <button
                type="button"
                className={sharedStyles.linkBtn}
                onClick={() => setDeactivateId(category.id)}
              >
                Desativar
              </button>
            ) : null}
          </div>
        </div>
        {childrenOf(category.id).map((child) => renderNode(child, true))}
      </div>
    );
  }

  return (
    <div className={sharedStyles.stack}>
      <AdminPageHeader
        title="Catálogo"
        description="Árvore de categorias e atributos do marketplace."
        actions={
          <>
            <button type="button" className={sharedStyles.btnSecondary} onClick={exportCsv}>
              Exportar CSV
            </button>
            <button type="button" className={sharedStyles.btnSecondary} onClick={openCreateAttr}>
              Novo atributo
            </button>
            <button type="button" className={sharedStyles.btn} onClick={openCreateCategory}>
              Nova categoria
            </button>
          </>
        }
      />

      <AdminMetricsRow>
        <AdminMetricCard label="Categorias" value={String(metrics.categories)} />
        <AdminMetricCard label="Ativas" value={String(metrics.active)} />
        <AdminMetricCard label="Atributos" value={String(metrics.attributes)} />
        <AdminMetricCard label="Com atributos" value={String(metrics.linked)} />
      </AdminMetricsRow>

      <Field label="Buscar categoria">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nome da categoria…"
        />
      </Field>

      <div className={sharedStyles.grid2}>
        <div className={sharedStyles.panel}>
          <h2 className={sharedStyles.panelTitle}>Árvore de categorias</h2>
          <div className={moduleStyles.tree}>
            {roots.map((root) => renderNode(root))}
            {roots.length === 0 ? (
              <p className={moduleStyles.muted}>Nenhuma categoria encontrada.</p>
            ) : null}
          </div>
        </div>
        <div className={sharedStyles.panel}>
          <h2 className={sharedStyles.panelTitle}>Atributos</h2>
          <ul className={moduleStyles.timeline}>
            {db.attributes.map((attr) => (
              <li key={attr.id} className={moduleStyles.timelineItem}>
                <div className={sharedStyles.rowActions} style={{ justifyContent: "space-between" }}>
                  <div>
                    <p className={moduleStyles.timelineLabel}>{attr.name}</p>
                    <p className={moduleStyles.timelineDetail}>{attr.values.join(", ")}</p>
                  </div>
                  <button
                    type="button"
                    className={sharedStyles.linkBtn}
                    onClick={() => openEditAttr(attr)}
                  >
                    Editar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <AdminModal
        open={Boolean(categoryModal)}
        title={categoryModal === "create" ? "Nova categoria" : "Editar categoria"}
        onClose={() => setCategoryModal(null)}
        actions={
          <>
            <button
              type="button"
              className={sharedStyles.btnGhost}
              onClick={() => setCategoryModal(null)}
            >
              Cancelar
            </button>
            <button type="button" className={sharedStyles.btn} onClick={saveCategory}>
              Salvar
            </button>
          </>
        }
      >
        <div className={sharedStyles.stack}>
          <Field label="Nome">
            <input value={catName} onChange={(e) => setCatName(e.target.value)} />
          </Field>
          <Field label="Categoria pai">
            <select value={catParent} onChange={(e) => setCatParent(e.target.value)}>
              <option value="">Nenhuma (raiz)</option>
              {db.categories
                .filter((c) =>
                  categoryModal === "create" || categoryModal
                    ? c.id !== (typeof categoryModal === "object" ? categoryModal.id : "")
                    : true,
                )
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </Field>
        </div>
      </AdminModal>

      <AdminModal
        open={Boolean(attrModal)}
        title={attrModal === "create" ? "Novo atributo" : "Editar atributo"}
        onClose={() => setAttrModal(null)}
        actions={
          <>
            <button
              type="button"
              className={sharedStyles.btnGhost}
              onClick={() => setAttrModal(null)}
            >
              Cancelar
            </button>
            <button type="button" className={sharedStyles.btn} onClick={saveAttribute}>
              Salvar
            </button>
          </>
        }
      >
        <div className={sharedStyles.stack}>
          <Field label="Nome">
            <input value={attrName} onChange={(e) => setAttrName(e.target.value)} />
          </Field>
          <Field label="Valores (separados por vírgula)">
            <input value={attrValues} onChange={(e) => setAttrValues(e.target.value)} />
          </Field>
        </div>
      </AdminModal>

      <AdminModal
        open={Boolean(assocCategory)}
        title={`Atributos · ${assocCategory?.name ?? ""}`}
        onClose={() => setAssocCategory(null)}
        actions={
          <>
            <button
              type="button"
              className={sharedStyles.btnGhost}
              onClick={() => setAssocCategory(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={sharedStyles.btn}
              onClick={() => {
                if (!assocCategory) return;
                refresh(repo.updateCategory(assocCategory.id, { attributeIds: assocIds }));
                setAssocCategory(null);
                toast.push("Atributos associados");
              }}
            >
              Salvar
            </button>
          </>
        }
      >
        <div className={sharedStyles.stack}>
          {db.attributes.map((attr) => (
            <label key={attr.id} className={moduleStyles.checkboxRow}>
              <input
                type="checkbox"
                checked={assocIds.includes(attr.id)}
                onChange={() =>
                  setAssocIds((current) =>
                    current.includes(attr.id)
                      ? current.filter((x) => x !== attr.id)
                      : [...current, attr.id],
                  )
                }
              />
              {attr.name}
            </label>
          ))}
        </div>
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(deactivateId)}
        title="Desativar categoria"
        description="A categoria será desativada (sem exclusão permanente se estiver em uso)."
        confirmLabel="Desativar"
        onClose={() => setDeactivateId(null)}
        onConfirm={() => {
          if (!deactivateId) return;
          refresh(repo.deactivateCategory(deactivateId));
          setDeactivateId(null);
          toast.push("Categoria desativada");
        }}
      />
    </div>
  );
}
