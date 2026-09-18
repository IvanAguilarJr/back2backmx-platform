"use client";

export type ChipOption = {
  id: string;
  label: string;
};

type SingleChipSelectorProps = {
  mode: "single";
  options: ChipOption[];
  selected: string | null;
  onChange: (id: string) => void;
};

type MultiChipSelectorProps = {
  mode: "multi";
  options: ChipOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
};

type ChipSelectorProps = SingleChipSelectorProps | MultiChipSelectorProps;

export default function ChipSelector(props: ChipSelectorProps) {
  const { options } = props;

  function isSelected(id: string) {
    return props.mode === "single"
      ? props.selected === id
      : props.selected.includes(id);
  }

  function toggle(id: string) {
    if (props.mode === "single") {
      props.onChange(id);
      return;
    }
    const next = props.selected.includes(id)
      ? props.selected.filter((s) => s !== id)
      : [...props.selected, id];
    props.onChange(next);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = isSelected(option.id);
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(option.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? "border-yellow bg-yellow text-ink"
                : "border-line bg-bg text-ink hover:border-ink/30"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
