import { validatorNames } from "@locals/bench/benchmarks";
import { validatorActualDetailCode } from './validators';

function getLowercaseValidatorName(name: string): Lowercase<(typeof validatorNames)[number]> {
  const found = validatorNames.find((v) => v.toLowerCase() === name.toLowerCase());

  if (!found) {
    throw new Error(`Validator "${name}" not found.`);
  } 

  return found.toLowerCase() as Lowercase<(typeof validatorNames)[number]>;
}

export function ValidatorSnippet({ validatorName }: { validatorName: (typeof validatorNames)[number] }) {
  const schemaCode = validatorActualDetailCode[getLowercaseValidatorName(validatorName)];

  return (
    <div>
      <h1>Validator: {validatorName}</h1>

      <pre style={{ background: "#222", color: "#fff", padding: 16, borderRadius: 8, overflowX: "auto" }}>
        {schemaCode}
      </pre>
    </div>
  );
}
