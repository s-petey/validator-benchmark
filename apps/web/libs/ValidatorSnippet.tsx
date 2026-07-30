import { validatorNames } from "@locals/bench/benchmarks";
import { createHighlightedCodeBlockProps } from "@tanstack/highlight/react";
import { CodeBlock } from "./CodeBlock";
import { highlighter } from "./highlight";
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

  const props = createHighlightedCodeBlockProps({
    highlighter,
    code: schemaCode,
    lang: "ts",
  });
  return (
    <div className="stack">
      <CodeBlock
        {...props}
        link={
          <a href={docLink} target="_blank" rel="noreferrer">
            {docLink}
          </a>
        }
      />
    </div>
  );
}
