import { Children, isValidElement } from "react";
import type { ChangeEvent, InputHTMLAttributes, ReactElement, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { CustomSelect } from "@/components/ui/CustomSelect";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

const inputClasses =
  "min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputClasses} {...props} />;
}

export function SelectInput({ children, value, defaultValue, onChange, className, disabled, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  const options = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => {
      const option = child as ReactElement<{ value?: string; children?: ReactNode }>;
      const label = String(option.props.children ?? option.props.value ?? "");
      return { value: option.props.value ?? label, label };
    });

  return (
    <CustomSelect
      className={className}
      value={String(value ?? defaultValue ?? "")}
      disabled={disabled}
      placeholder={(props as { placeholder?: string }).placeholder}
      options={options}
      onChange={(nextValue) => {
        onChange?.({ target: { value: nextValue }, currentTarget: { value: nextValue } } as ChangeEvent<HTMLSelectElement>);
      }}
    />
  );
}

export function TextAreaInput(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputClasses} min-h-32 resize-none py-3`} {...props} />;
}
