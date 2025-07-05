import ajvRaw from "@locals/bench/ajv?raw";
import arktypeRaw from "@locals/bench/arktype?raw";
import arriRaw from "@locals/bench/arri?raw";
import effectRaw from "@locals/bench/effectSchema?raw";
import myzodRaw from "@locals/bench/myzod?raw";
import typeboxRaw from "@locals/bench/typebox?raw";
import valibotRaw from "@locals/bench/valibot?raw";
import yupRaw from "@locals/bench/yup?raw";
import zodRaw from "@locals/bench/zod?raw";
import zodv4Raw from "@locals/bench/zod4?raw";
import {validatorNames} from "@locals/bench/benchmarks"


function getDetailsSection(code: string): string {
  const match = code.match(/export const detailsSchema = (.+?);/s);
  let validMatch = match && match.at(1);
  if (validMatch) {
    validMatch = validMatch
      .split('\n')
      .map(line => line.replace(/\/\/.*$/, ''))
      .filter(line => line.trim() !== '')
      .join('\n');
    return validMatch;
  }
  return "";
}


export const validatorActualDetailCode = {
  ajv: getDetailsSection(ajvRaw),
  arktype: getDetailsSection(arktypeRaw),
  arri: getDetailsSection(arriRaw),
  effect: getDetailsSection(effectRaw),
  myzod: getDetailsSection(myzodRaw),
  typebox: getDetailsSection(typeboxRaw),
  valibot: getDetailsSection(valibotRaw),
  yup: getDetailsSection(yupRaw),
  zod: getDetailsSection(zodRaw),
  zodv4: getDetailsSection(zodv4Raw),
} satisfies Record<Lowercase <typeof validatorNames[number]>, string>;
