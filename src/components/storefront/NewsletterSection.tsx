"use client";

import Image from "next/image";
import { useId, useState, type FormEvent } from "react";

type Status = "idle" | "success" | "error";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function NewsletterSection() {
  const inputId = useId();
  const statusId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setStatus("error");
      return;
    }

    setStatus("success");
    setEmail("");
  }

  return (
    <section
      id="newsletter"
      aria-labelledby="newsletter-title"
      className="border-y border-potala-border bg-potala-bg-secondary py-14 md:py-16"
    >
      <div className="potala-container grid items-center gap-8 lg:grid-cols-[180px_minmax(0,1fr)_auto]">
        <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-full border border-potala-border lg:mx-0">
          <Image
            src="/images/potala/newsletter-candle.jpg"
            alt="Placeholder temporário: vela acesa em base inspirada em flor de lótus"
            fill
            className="object-cover"
            sizes="144px"
          />
        </div>

        <div>
          <h2
            id="newsletter-title"
            className="font-serif text-3xl leading-tight text-potala-text md:text-4xl"
          >
            Receba inspiração, novidades e ofertas exclusivas
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-potala-muted md:text-base">
            Inscreva-se para conteúdos selecionados, lançamentos e convites
            especiais do Instituto Potala.
          </p>

          <form
            className="mt-6 flex flex-col gap-3 sm:flex-row"
            onSubmit={handleSubmit}
            noValidate
          >
            <label htmlFor={inputId} className="sr-only">
              Seu e-mail
            </label>
            <input
              id={inputId}
              type="email"
              name="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (status !== "idle") {
                  setStatus("idle");
                }
              }}
              placeholder="Seu melhor e-mail"
              className="potala-input sm:max-w-md"
              aria-invalid={status === "error"}
              aria-describedby={statusId}
              autoComplete="email"
            />
            <button type="submit" className="potala-btn potala-btn-primary shrink-0">
              Quero me inscrever
            </button>
          </form>

          <p
            id={statusId}
            role="status"
            aria-live="polite"
            className={`mt-3 min-h-5 text-sm ${
              status === "error"
                ? "text-red-300"
                : status === "success"
                  ? "text-potala-gold-light"
                  : "text-transparent"
            }`}
          >
            {status === "error"
              ? "Informe um e-mail válido para continuar."
              : status === "success"
                ? "Inscrição registrada localmente. Em breve você receberá novidades."
                : "."}
          </p>
        </div>

        <ul className="grid gap-3 text-sm text-potala-muted sm:grid-cols-3 lg:grid-cols-1">
          {[
            "Conteúdos exclusivos",
            "Ofertas especiais",
            "Lançamentos em primeira mão",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rotate-45 bg-potala-gold"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
