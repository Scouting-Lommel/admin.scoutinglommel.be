import * as React from "react";
import { Field, SingleSelect, SingleSelectOption } from "@strapi/design-system";

const DEFAULT_MIN_YEAR = 1900;
const DEFAULT_MAX_YEAR_OFFSET = 10;

const getMessageText = (intlObject, fallback = "") => {
  if (!intlObject) return fallback;
  if (typeof intlObject === "string") return intlObject;
  return intlObject.defaultMessage || fallback;
};

const resolveLabel = (label, intlLabel, name) => {
  // If label is a user-configured override (not the raw translation key), use it.
  if (label && label !== intlLabel?.id) {
    return label;
  }
  // Otherwise fall back to the registered default message.
  if (intlLabel?.defaultMessage) {
    return intlLabel.defaultMessage;
  }
  return label || name;
};

const resolvePlaceholder = (placeholder, intlLabel) => {
  if (placeholder && placeholder !== intlLabel?.id) {
    return placeholder;
  }
  return "Select...";
};

export const Input = React.forwardRef((props, ref) => {
  const {
    attribute,
    disabled,
    intlLabel,
    label: labelProp,
    name,
    onChange,
    required,
    value,
    error,
    hint,
    placeholder,
  } = props;

  const currentYear = new Date().getFullYear();
  const minYear = attribute?.options?.minYear ?? DEFAULT_MIN_YEAR;
  const maxYear = attribute?.options?.maxYear ?? currentYear + DEFAULT_MAX_YEAR_OFFSET;

  const years = React.useMemo(() => {
    const list = [];
    for (let year = maxYear; year >= minYear; year -= 1) {
      list.push(year);
    }
    return list;
  }, [minYear, maxYear]);

  const handleChange = (selectedValue) => {
    const parsed = selectedValue === "" ? null : Number(selectedValue);
    onChange({
      target: {
        name,
        type: "number",
        value: parsed,
      },
    });
  };

  const label = resolveLabel(labelProp, intlLabel, name);
  const hintMessage = hint;
  const errorMessage = error ? getMessageText(error) : undefined;
  const placeholderMessage = resolvePlaceholder(placeholder, intlLabel);

  return (
    <Field.Root id={name} name={name} hint={hintMessage} error={errorMessage} required={required}>
      <Field.Label action={<span aria-hidden="true">{required ? "*" : null}</span>}>
        {label}
      </Field.Label>
      <SingleSelect
        ref={ref}
        id={name}
        name={name}
        value={value ?? ""}
        placeholder={placeholderMessage}
        onChange={handleChange}
        disabled={disabled}
        hasError={Boolean(error)}
        aria-describedby={`${name}-hint`}
        required={required}
      >
        {years.map((year) => (
          <SingleSelectOption key={year} value={year}>
            {year}
          </SingleSelectOption>
        ))}
      </SingleSelect>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
});

Input.displayName = "YearPickerInput";

export default Input;
