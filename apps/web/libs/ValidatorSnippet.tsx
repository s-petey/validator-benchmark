import { validatorNames } from "@locals/bench/benchmarks";
import { validatorActualDetailCode } from "./validators";

function getLowercaseValidatorName(name: string): Lowercase<(typeof validatorNames)[number]> {
  const found = validatorNames.find((v) => v.toLowerCase() === name.toLowerCase());

  if (!found) {
    throw new Error(`Validator "${name}" not found.`);
  }

  return found.toLowerCase() as Lowercase<(typeof validatorNames)[number]>;
}

export function ValidatorSnippet({
  validatorName,
  docLink,
}: {
  validatorName: (typeof validatorNames)[number];
  docLink: string;
}) {
  const schemaCode = validatorActualDetailCode[getLowercaseValidatorName(validatorName)];

  return (
    <pre>
      <code>
        <span style={{ color: "var(--blue)" }}>{`// Validator: ${validatorName}\n`}</span>
        <span style={{ color: "var(--blue)" }}>
          {"// Docs: "}
          <a href={docLink} target="_blank" rel="noreferrer">
            {docLink}
          </a>
          {"\n"}
        </span>
        {schemaCode}
      </code>
    </pre>
  );
}
