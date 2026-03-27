"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginFormState } from "@/app/login/actions";
import InvitationFrame from "@/components/invitation-frame";

const initialState: LoginFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-3 rounded-xl bg-rose-800 px-4 py-3 text-sm font-bold text-rose-50 shadow-[0_10px_18px_rgba(90,20,33,0.32)] transition hover:bg-rose-900 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Submitting..." : "submit"}
    </button>
  );
}

export default function LoginForm() {
  const [state, action] = useActionState(loginAction, initialState);

  return (
    <InvitationFrame contentClassName="px-4 py-32">
      <span
        className="pointer-events-none absolute left-[8%] top-[7%] h-44 w-44 rounded-full bg-[radial-gradient(circle,#ffceaab3,transparent_70%)] [animation:floatSlow_9s_ease-in-out_infinite]"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute bottom-[10%] right-[6%] h-52 w-52 rounded-full bg-[radial-gradient(circle,#ffb5c6a8,transparent_70%)] [animation:floatSlow_11s_ease-in-out_infinite_reverse]"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute bottom-[24%] left-[10%] h-36 w-36 rounded-full bg-[radial-gradient(circle,#ffeec7b5,transparent_70%)] [animation:floatSlow_10s_ease-in-out_infinite]"
        aria-hidden="true"
      />

      <section className="relative mx-auto h-[520px] w-full max-w-[420px] [animation:popIn_0.8s_cubic-bezier(0.2,0.9,0.3,1)_both]">
        <button
          type="button"
          className={`absolute inset-x-0 bottom-0 mx-auto h-[270px] w-full cursor-pointer bg-transparent [perspective:1000px] transition-transform duration-300 hover:-translate-y-1 ${
            state.message ? "[animation:shakeX_0.38s_linear_1]" : ""
          }`}
          aria-label="Close wedding envelope"
        >
          <span
            className="absolute inset-x-0 top-0 z-20 h-[135px] origin-top bg-[linear-gradient(135deg,#ffe6d1,#ebb8a5)] [clip-path:polygon(0_0,100%_0,50%_100%)] transition-transform duration-700 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] rotate-x-180"
            aria-hidden="true"
          />
          <span
            className="absolute inset-0 rounded-b-2xl bg-[linear-gradient(145deg,#ffe9da,#efc1ab_70%,#e7ac95)] shadow-[0_10px_30px_rgba(80,24,35,0.22)]"
            aria-hidden="true"
          />
        </button>

        <div className="absolute inset-x-5 bottom-[120px] top-7 rounded-2xl border border-[#f0d8c7] bg-white px-4 py-5 shadow-[0_6px_20px_rgba(80,24,35,0.16)] transition-all duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] sm:px-[18px] sm:py-[22px] pointer-events-auto translate-y-0 opacity-100 [animation:letterGlow_2.2s_ease-in-out_infinite_alternate]">
          <h1 className="text-center font-serif text-2xl font-bold text-rose-950">
            Wedding Album
          </h1>

          <p className="mb-4 mt-2 text-center text-sm text-rose-900/85">
            Enter login details to continue.
          </p>

          <form action={action} className="grid gap-2">
            <label
              htmlFor="username"
              className="text-sm font-semibold text-rose-950"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              className="rounded-lg border border-[#d7b6a4] bg-white px-3 py-2.5 text-sm text-[#3f1d2b] outline-none transition focus:border-rose-700/60 focus:ring-2 focus:ring-rose-700/20"
              required
            />

            <label
              htmlFor="password"
              className="text-sm font-semibold text-rose-950"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="rounded-lg border border-[#d7b6a4] bg-white px-3 py-2.5 text-sm text-[#3f1d2b] outline-none transition focus:border-rose-700/60 focus:ring-2 focus:ring-rose-700/20"
              required
            />

            {state.message ? (
              <p className="text-left text-xs text-rose-700">{state.message}</p>
            ) : null}

            <SubmitButton />
          </form>
        </div>
      </section>
    </InvitationFrame>
  );
}
