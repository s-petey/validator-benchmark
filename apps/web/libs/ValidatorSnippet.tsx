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
	docLink,
}: {
	validatorName: (typeof validatorNames)[number];
	docLink: string;
}) {
	const schemaCode =
		validatorActualDetailCode[getLowercaseValidatorName(validatorName)];

	return (
		<pre className="rounded-lg p-4 bg-gray-800 text-white overflow-x-auto">
			<code>
				<span className="text-blue-500">{`// Validator: ${validatorName}\n`}</span>
				<span className="text-blue-500">
					{"// Docs: "}
					<a
						className="text-blue-700 hover:underline dark:text-blue-500"
						href={docLink}
						target="_blank"
						rel="noreferrer"
					>
						{docLink}
					</a>
					{"\n"}
				</span>
				{schemaCode}
			</code>
		</pre>
	);
}
