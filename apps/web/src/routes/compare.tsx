import { type Validator, validators } from "@locals/bench/benchmarks";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ValidatorSnippet } from "../../libs/ValidatorSnippet";

export const Route = createFileRoute("/compare")({
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
        return prev.filter((n) => n.name !== item.name);
      } else {
        return [...prev, item];
      }
    });
  }

  return (
    <div className="flex flex-col justify-center">
      <header className="flex flex-col p-4">
        <h1 className="text-4xl font-bold">Compare validator syntax</h1>
        <Link to="/" className="text-blue-500 hover:text-blue-700">
          Go home
        </Link>
      </header>

      <ul className="items-center mx-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {validators.map((item) => (
          <li key={item.name} className="flex items-center space-x-3 bg-gray-800 rounded-lg px-4 py-3 shadow">
            <input
              id={item.name}
              type="checkbox"
              checked={isNameIncluded(item.name, checked)}
              onChange={() => handleChange(item)}
              className="form-checkbox h-5 w-5 text-blue-600 accent-blue-500"
            />
            <label htmlFor={item.name} className="text-white text-lg cursor-pointer select-none">
              {item.name}
            </label>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-4 mt-4">
        {checked.map((item) => (
          <ValidatorSnippet key={item.name} validatorName={item.name} docLink={item.href} />
        ))}
      </div>
    </div>
  );
}
