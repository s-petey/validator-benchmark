import { type Validator, validators } from "@locals/bench/benchmarks";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ValidatorSnippet } from "../../../libs/ValidatorSnippet";

export const Route = createFileRoute("/_app/compare")({
  component: RouteComponent,
});

function isNameIncluded(name: Validator["name"], checked: Validator[]): boolean {
  const found = checked.find((item) => item.name === name);
  if (!found) {
    return false;
  }
  return true;
}

function RouteComponent() {
  const [checked, setChecked] = useState<Validator[]>([]);

  function handleChange(item: Validator) {
    setChecked((prev) => {
      const found = prev.find((n) => n.name === item.name);
      if (found) {
        return prev.filter((n) => n !== item);
      } else {
        return [...prev, item];
      }
    });
  }

  return (
    <div className="stack">
      <header className="stack">
        <h2>Compare validator syntax</h2>
      </header>

      <ul className="no-list grid auto">
        {validators.map((item) => (
          <li key={item.name} className="form-option-row box" style={{ padding: "0.75rem 1rem" }}>
            <input
              id={item.name}
              type="checkbox"
              checked={isNameIncluded(item.name, checked)}
              onChange={() => handleChange(item)}
            />
            <label htmlFor={item.name} style={{ cursor: "pointer" }}>
              {item.name}
            </label>
          </li>
        ))}
      </ul>

      <div className="layout-card">
        {checked.map((item) => (
          <article key={item.name} className="card" style={{ maxWidth: "450px" }}>
            <header>
              <h3 className="h3 no-margin">{item.name}</h3>
            </header>
            <div style={{ overflowX: "auto" }}>
              <ValidatorSnippet validatorName={item.name} docLink={item.href} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
