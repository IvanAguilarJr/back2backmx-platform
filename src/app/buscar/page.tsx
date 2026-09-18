"use client";

import { useEffect, useMemo, useState } from "react";
import Logo from "@/components/Logo";
import ChipSelector from "@/components/ChipSelector";
import ModuleCard from "@/components/ModuleCard";
import NavLink from "@/components/NavLink";
import { getAllModules } from "@/lib/modules";
import { AGE_OPTIONS, GENDER_OPTIONS } from "@/lib/taxonomy";
import type { Module } from "@/lib/types";

type Step = "quiz" | "results";

export default function BuscarPage() {
  const [step, setStep] = useState<Step>("quiz");
  const [age, setAge] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [moduleIds, setModuleIds] = useState<string[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);

  useEffect(() => {
    getAllModules()
      .then(setModules)
      .finally(() => setLoadingModules(false));
  }, []);

  const canSubmit = age !== null && gender !== null && moduleIds.length > 0;

  const selectedModules = useMemo(
    () => modules.filter((m) => moduleIds.includes(m.id)),
    [modules, moduleIds],
  );

  return (
    <main className="min-h-screen bg-bg px-4 pb-24 pt-10 sm:px-6">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <Logo className="h-8" />
        <NavLink href="/">← Inicio</NavLink>
      </div>

      {step === "quiz" ? (
        <QuizScreen
          age={age}
          setAge={setAge}
          gender={gender}
          setGender={setGender}
          moduleIds={moduleIds}
          setModuleIds={setModuleIds}
          modules={modules}
          loadingModules={loadingModules}
          canSubmit={canSubmit}
          onSubmit={() => setStep("results")}
        />
      ) : (
        <ResultsScreen
          age={age}
          modules={selectedModules}
          onBack={() => setStep("quiz")}
        />
      )}
    </main>
  );
}

function QuizScreen({
  age,
  setAge,
  gender,
  setGender,
  moduleIds,
  setModuleIds,
  modules,
  loadingModules,
  canSubmit,
  onSubmit,
}: {
  age: string | null;
  setAge: (id: string) => void;
  gender: string | null;
  setGender: (id: string) => void;
  moduleIds: string[];
  setModuleIds: (ids: string[]) => void;
  modules: Module[];
  loadingModules: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
}) {
  const moduleOptions = modules.map((m) => ({ id: m.id, label: m.title }));

  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-[22px] border border-line bg-paper-soft p-8 sm:p-10">
      <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
        Cuéntanos sobre tu hijo o hija
      </h1>
      <p className="mt-2 text-muted">
        Con esto te mostramos solo el contenido que es relevante para su
        situación.
      </p>

      <div className="mt-8 space-y-8">
        <fieldset>
          <legend className="text-sm font-semibold uppercase tracking-wide text-muted">
            Edad
          </legend>
          <div className="mt-3">
            <ChipSelector
              mode="single"
              options={AGE_OPTIONS}
              selected={age}
              onChange={setAge}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold uppercase tracking-wide text-muted">
            Género
          </legend>
          <div className="mt-3">
            <ChipSelector
              mode="single"
              options={GENDER_OPTIONS}
              selected={gender}
              onChange={setGender}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold uppercase tracking-wide text-muted">
            ¿Qué situación están viviendo?
          </legend>
          <p className="mt-1 text-sm text-muted">Puedes elegir varias.</p>
          <div className="mt-3">
            {loadingModules ? (
              <p className="text-sm text-muted">Cargando módulos…</p>
            ) : (
              <ChipSelector
                mode="multi"
                options={moduleOptions}
                selected={moduleIds}
                onChange={setModuleIds}
              />
            )}
          </div>
        </fieldset>
      </div>

      <button
        type="button"
        disabled={!canSubmit}
        onClick={onSubmit}
        className="mt-10 w-full rounded-full bg-yellow px-6 py-3 font-medium text-ink transition-colors hover:bg-yellow-deep disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        Ver información para nuestra familia
      </button>
    </div>
  );
}

function ResultsScreen({
  age,
  modules,
  onBack,
}: {
  age: string | null;
  modules: Module[];
  onBack: () => void;
}) {
  return (
    <div className="mx-auto mt-10 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
          Recursos para tu familia
        </h1>
        <NavLink onClick={onBack}>Cambiar respuestas</NavLink>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => (
          <ModuleCard
            key={mod.id}
            module={mod}
            href={age ? `/modulo/${mod.id}?age=${age}` : `/modulo/${mod.id}`}
          />
        ))}
      </div>
    </div>
  );
}
