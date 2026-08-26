"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AccountChrome } from "@/components/account/AccountChrome";
import { ACCOUNT_HELP_FAQS } from "@/data/account";
import { useAccountData } from "@/features/account/AccountDataContext";
import { textIncludes } from "@/lib/normalizeText";

export default function AccountHelpPage() {
  const { createSupportTicket, db } = useAccountData();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Pedidos");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [protocol, setProtocol] = useState<string | null>(null);

  const faqs = useMemo(
    () =>
      ACCOUNT_HELP_FAQS.filter(
        (faq) =>
          textIncludes(faq.question, query) ||
          textIncludes(faq.answer, query) ||
          textIncludes(faq.category, query),
      ),
    [query],
  );

  const categories = [...new Set(ACCOUNT_HELP_FAQS.map((faq) => faq.category))];

  function handleTicket(event: FormEvent) {
    event.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setProtocol(null);
      return;
    }
    const ticket = createSupportTicket({ category, subject, message });
    setProtocol(ticket.protocol);
    setSubject("");
    setMessage("");
  }

  return (
    <AccountChrome
      title="Central de ajuda"
      lead="FAQ local e atendimento demonstrativo — sem backend de suporte."
      breadcrumbCurrent="Ajuda"
    >
      <div>
        <label htmlFor="help-search">Buscar nas perguntas</label>
        <input
          id="help-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          style={{ width: "100%", minHeight: 44, marginBottom: 16 }}
        />
      </div>

      <p>Categorias: {categories.join(" · ")}</p>

      <div style={{ display: "grid", gap: 8 }}>
        {faqs.map((faq) => (
          <details
            key={faq.id}
            style={{
              border: "1px solid var(--potala-border)",
              borderRadius: 10,
              padding: "8px 12px",
            }}
          >
            <summary style={{ minHeight: 44, cursor: "pointer" }}>
              {faq.category}: {faq.question}
            </summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>

      <form
        onSubmit={handleTicket}
        style={{ display: "grid", gap: 12, maxWidth: 560, marginTop: 24 }}
      >
        <h2>Abrir chamado demonstrativo</h2>
        <div>
          <label htmlFor="tk-cat">Categoria</label>
          <select
            id="tk-cat"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            style={{ width: "100%", minHeight: 44 }}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tk-subject">Assunto</label>
          <input
            id="tk-subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            style={{ width: "100%", minHeight: 44 }}
          />
        </div>
        <div>
          <label htmlFor="tk-message">Mensagem</label>
          <textarea
            id="tk-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            style={{ width: "100%", minHeight: 110 }}
          />
        </div>
        <button type="submit" style={{ minHeight: 44 }}>
          Enviar
        </button>
        {protocol ? (
          <p role="status" aria-live="polite">
            Protocolo local {protocol}. Não há envio a um sistema real.
          </p>
        ) : null}
      </form>

      {(db?.tickets.length ?? 0) > 0 ? (
        <section style={{ marginTop: 16 }}>
          <h2>Chamados neste navegador</h2>
          <ul>
            {db?.tickets.map((ticket) => (
              <li key={ticket.id}>
                {ticket.protocol} · {ticket.subject} · {ticket.status}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </AccountChrome>
  );
}
