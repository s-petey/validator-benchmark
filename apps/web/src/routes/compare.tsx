import { validatorNames } from "@locals/bench/benchmarks";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ValidatorSnippet } from "../../libs/ValidatorSnippet";

export const Route = createFileRoute("/compare")({
  component: RouteComponent,
});

function RouteComponent() {
  const [checked, setChecked] = useState<typeof validatorNames>([]);

  function handleChange(name: (typeof validatorNames)[number]) {
    setChecked((prev) => {
      if (prev.includes(name)) {
        return prev.filter((n) => n !== name);
      } else if (prev.length < 3) {
        return [...prev, name];
      } else {
        return prev;
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

      <div className="flex flex-col gap-4 items-center">
        <p className="text-small text-gray-400 text-center">Select up to 3 validators to compare</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {validatorNames.map((name) => (
            <li key={name} className="flex items-center space-x-3 bg-gray-800 rounded-lg px-4 py-3 shadow">
              <input
                id={name}
                type="checkbox"
                checked={checked.includes(name)}
                onChange={() => handleChange(name)}
                disabled={!checked.includes(name) && checked.length >= 3}
                className="form-checkbox h-5 w-5 text-blue-600 accent-blue-500"
              />
              <label htmlFor={name} className="text-white text-lg cursor-pointer select-none">
                {name}
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checked.map((name) => (
          <ValidatorSnippet key={name} validatorName={name} />
        ))}
      </div>
    </div>
  );
}
