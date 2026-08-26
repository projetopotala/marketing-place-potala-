"use client";

import { useState, type FormEvent } from "react";
import { AccountChrome } from "@/components/account/AccountChrome";
import { useAccountData } from "@/features/account/AccountDataContext";

export default function AccountReviewsPage() {
  const { db, isHydrated, submitReview } = useAccountData();
  const [drafts, setDrafts] = useState<
    Record<string, { rating: number; comment: string }>
  >({});
  const [status, setStatus] = useState<string | null>(null);

  const pending = db?.reviews.filter((review) => review.status === "pending") ?? [];
  const published =
    db?.reviews.filter((review) => review.status === "published") ?? [];

  function handleSubmit(event: FormEvent, id: string) {
    event.preventDefault();
    const draft = drafts[id] ?? { rating: 5, comment: "" };
    if (draft.rating < 1 || draft.rating > 5) {
      setStatus("Selecione de 1 a 5 estrelas.");
      return;
    }
    submitReview({ id, rating: draft.rating, comment: draft.comment });
    setStatus("Avaliação salva (demonstrativo).");
  }

  return (
    <AccountChrome
      title="Avaliações"
      lead="Pendentes e publicadas neste navegador."
      breadcrumbCurrent="Avaliações"
    >
      {!isHydrated || !db ? (
        <p role="status">Carregando…</p>
      ) : (
        <>
          <section>
            <h2>Pendentes</h2>
            {pending.length === 0 ? (
              <p>Nenhuma avaliação pendente.</p>
            ) : (
              pending.map((review) => {
                const draft = drafts[review.id] ?? {
                  rating: 5,
                  comment: "",
                };
                return (
                  <form
                    key={review.id}
                    onSubmit={(event) => handleSubmit(event, review.id)}
                    style={{
                      display: "grid",
                      gap: 8,
                      marginBottom: 16,
                      border: "1px solid var(--potala-border)",
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    <p>{review.productName}</p>
                    <fieldset>
                      <legend>Nota</legend>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <label
                          key={star}
                          style={{
                            marginRight: 8,
                            display: "inline-flex",
                            gap: 4,
                            alignItems: "center",
                            minHeight: 44,
                          }}
                        >
                          <input
                            type="radio"
                            name={`rating-${review.id}`}
                            checked={draft.rating === star}
                            onChange={() =>
                              setDrafts((current) => ({
                                ...current,
                                [review.id]: { ...draft, rating: star },
                              }))
                            }
                          />
                          {star}
                        </label>
                      ))}
                    </fieldset>
                    <label htmlFor={`c-${review.id}`}>Comentário</label>
                    <textarea
                      id={`c-${review.id}`}
                      value={draft.comment}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [review.id]: {
                            ...draft,
                            comment: event.target.value,
                          },
                        }))
                      }
                      style={{ minHeight: 90 }}
                    />
                    <button type="submit" style={{ minHeight: 44 }}>
                      Enviar avaliação
                    </button>
                  </form>
                );
              })
            )}
          </section>

          <section>
            <h2>Publicadas</h2>
            {published.length === 0 ? (
              <p>Nenhuma avaliação publicada.</p>
            ) : (
              published.map((review) => (
                <form
                  key={review.id}
                  onSubmit={(event) => handleSubmit(event, review.id)}
                  style={{ marginBottom: 16 }}
                >
                  <p>
                    {review.productName} · {review.rating}/5
                  </p>
                  <label htmlFor={`e-${review.id}`}>Editar comentário</label>
                  <textarea
                    id={`e-${review.id}`}
                    defaultValue={review.comment}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [review.id]: {
                          rating: review.rating,
                          comment: event.target.value,
                        },
                      }))
                    }
                    style={{ width: "100%", minHeight: 80 }}
                  />
                  <button type="submit" style={{ minHeight: 44, marginTop: 8 }}>
                    Atualizar
                  </button>
                </form>
              ))
            )}
          </section>

          {status ? (
            <p role="status" aria-live="polite">
              {status}
            </p>
          ) : null}
        </>
      )}
    </AccountChrome>
  );
}
