import type { Route } from './+types/home';
import { Welcome } from '../welcome/welcome';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Node validators benchmark' }];
}

const resultsSchema = z.record(
  z.string(),
  z.object({
    success: z.boolean(),
    size: z.number(),
    min: z.number(),
    max: z.number(),
    mean: z.number(),
    stddev: z.number(),
  })
);

// From `cronometro`
// // Sort results by least performant first, then compare relative performances and also printing padding
// let last = 0;
// let compared = '';
// let standardErrorPadding = 0;
// const entries = Object.entries(results).sort((a, b)=>!a[1].success ? -1 : b[1].mean - a[1].mean).map(([name, result])=>{
//     if (!result.success) {
//         return {
//             name,
//             size: 0,
//             error: result.error,
//             throughput: '',
//             standardError: '',
//             relative: '',
//             compared: ''
//         };
//     }
//     const { size, mean, standardError } = result;
//     const relative = last !== 0 ? (last / mean - 1) * 100 : 0;
//     if (mode === 'base') {
//         if (last === 0) {
//             last = mean;
//             compared = name;
//         }
//     } else {
//         last = mean;
//         compared = name;
//     }
//     const standardErrorString = (standardError / mean * 100).toFixed(2);
//     standardErrorPadding = Math.max(standardErrorPadding, standardErrorString.length);
//     return {
//         name,
//         size,
//         error: null,
//         throughput: (1e9 / mean).toFixed(2),
//         standardError: standardErrorString,
//         relative: relative.toFixed(2),
//         compared
//     };
// });

// export async function loader(args: Route.LoaderArgs) {
//   // Get the latest set of validation results
//   // Using JS read the files most recently updated from the results dir

//   const resultsDir = path.join(process.cwd(), '../../results');
//   const files = fs
//     .readdirSync(resultsDir)
//     .map((file) => ({
//       file,
//       time: fs.statSync(path.join(resultsDir, file)).mtime.getTime(),
//     }))
//     .sort((a, b) => b.time - a.time)
//     .slice(0, 4)
//     .map(({ file }) => file);

//   console.log(files);

//   const fileContents = files.map((file) => {
//     const filePath = path.join(resultsDir, file);
//     return fs.readFileSync(filePath, 'utf-8');
//   });

//   return { files: fileContents };
// }

export default function Home({}: Route.ComponentProps) {
  return (
    <Welcome
    // files={loaderData.files}
    />
  );
}
