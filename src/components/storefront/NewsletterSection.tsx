"use client";

import { useId, useState, type FormEvent } from "react";
import {
  ArrowRightIcon,
  ContentExclusiveIcon,
  FirstLaunchIcon,
  PrivacyShieldIcon,
  SpecialOfferIcon,
} from "@/components/storefront/icons";

type Status = "idle" | "success" | "error";

const BENEFITS = [
  { id: "conteudos", label: "Conteúdos exclusivos", Icon: ContentExclusiveIcon },
  { id: "ofertas", label: "Ofertas especiais", Icon: SpecialOfferIcon },
  { id: "lancamentos", label: "Lançamentos em primeira mão", Icon: FirstLaunchIcon },
] as const;

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

  const statusMessage =
    status === "error"
      ? "Informe um e-mail válido para continuar."
      : status === "success"
        ? "Inscrição registrada localmente. Em breve você receberá novidades."
        : "Ao se inscrever, você concorda em receber nossos e-mails. Você pode cancelar a qualquer momento.";

  return (
    <section
      id="newsletter"
      aria-labelledby="newsletter-title"
      className="newsletter-section"
    >
      <div aria-hidden="true" className="newsletter-section__overlay" />

      <div className="newsletter-section__container">
        <div aria-hidden="true" className="newsletter-section__visual-space" />

        <div className="newsletter-section__content">
          <h2 id="newsletter-title" className="newsletter-section__title">
            Receba inspiração, novidades e ofertas exclusivas
          </h2>
          <p className="newsletter-section__description">
            Junte-se à nossa comunidade e receba conteúdos especiais para nutrir
            sua jornada espiritual.
          </p>

          <form
            className="newsletter-section__form"
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
              className="newsletter-section__input"
              aria-invalid={status === "error"}
              aria-describedby={statusId}
              autoComplete="email"
            />
            <button type="submit" className="newsletter-section__submit">
              Quero me inscrever
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </form>

          <p
            id={statusId}
            role="status"
            aria-live="polite"
            className={`newsletter-section__consent ${
              status === "error"
                ? "newsletter-section__consent--error"
                : status === "success"
                  ? "newsletter-section__consent--success"
                  : ""
            }`}
          >
            {status === "idle" ? (
              <PrivacyShieldIcon className="newsletter-section__consent-icon" />
            ) : null}
            <span>{statusMessage}</span>
          </p>
        </div>

        <ul className="newsletter-section__benefits">
          {BENEFITS.map(({ id, label, Icon }) => (
            <li key={id} className="newsletter-section__benefit">
              <span className="newsletter-section__benefit-icon" aria-hidden="true">
                <Icon />
              </span>
              <span className="newsletter-section__benefit-label">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
