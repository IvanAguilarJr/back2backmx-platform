export type TaxonomyOption = {
  id: string;
  label: string;
};

export const AGE_OPTIONS: TaxonomyOption[] = [
  { id: "5-8", label: "5 a 8 años" },
  { id: "9-12", label: "9 a 12 años" },
  { id: "13-15", label: "13 a 15 años" },
  { id: "16-19", label: "16 a 19 años" },
];

export const GENDER_OPTIONS: TaxonomyOption[] = [
  { id: "nina", label: "Niña" },
  { id: "nino", label: "Niño" },
  { id: "todos", label: "Cualquiera" },
];

// El "kind" es lo que el admin elige al crear una pieza. Determina el
// renderType por default (ver PIECE_KIND_RENDER_TYPE en modules.ts) y qué
// ícono/etiqueta se muestra en la tarjeta colapsada.
export const PIECE_KIND_OPTIONS: TaxonomyOption[] = [
  { id: "articulo", label: "Artículo" },
  { id: "video", label: "Video" },
  { id: "tip", label: "Tip rápido" },
  { id: "checklist", label: "Checklist" },
  { id: "semaforo", label: "Semáforo" },
];

// Set de íconos que tiene sentido usar para un módulo (a diferencia de los
// íconos por-tipo-de-pieza como doc/play/bulb/checkcirc/traffic).
export const MODULE_ICON_OPTIONS: TaxonomyOption[] = [
  { id: "shield", label: "Escudo" },
  { id: "heart", label: "Corazón" },
  { id: "puzzle", label: "Rompecabezas" },
  { id: "pulse", label: "Pulso" },
  { id: "brain", label: "Cerebro" },
  { id: "handshake", label: "Apretón de manos" },
  { id: "sprout", label: "Brote" },
  { id: "laptop", label: "Laptop" },
];

function buildLabelMap(options: TaxonomyOption[]): Record<string, string> {
  return Object.fromEntries(options.map((o) => [o.id, o.label]));
}

export const AGE_LABELS = buildLabelMap(AGE_OPTIONS);
export const GENDER_LABELS = buildLabelMap(GENDER_OPTIONS);
export const PIECE_KIND_LABELS = buildLabelMap(PIECE_KIND_OPTIONS);
