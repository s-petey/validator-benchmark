import { validatorNames } from "@locals/bench/benchmarks";
import { validatorActualDetailCode } from "./validators";

function getLowercaseValidatorName(
	name: string,
): Lowercase<(typeof validatorNames)[number]> {
	const found = validatorNames.find(
		(v) => v.toLowerCase() === name.toLowerCase(),
	);

	if (!found) {
		throw new Error(`Validator "${name}" not found.`);
	}

	return found.toLowerCase() as Lowercase<(typeof validatorNames)[number]>;
}

export function ValidatorSnippet({
	validatorName,
}: {
	validatorName: (typeof validatorNames)[number];
}) {
	const schemaCode =
		validatorActualDetailCode[getLowercaseValidatorName(validatorName)];

	return (
		<pre className="rounded-lg p-4 bg-gray-800 text-white overflow-x-auto">
			<code>
				<span className="text-blue-500">{`// Validator: ${validatorName}\n`}</span>
				{schemaCode}
			</code>
		</pre>
	);
}
