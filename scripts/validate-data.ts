/**
 * Validates every dataset under data/ against its Zod schema and the cross-file
 * integrity rules in lib/data.ts. Exits with code 1 on any problem.
 */
import { getDataset } from '../lib/data';

function main(): void {
  try {
    const d = getDataset();
    console.log(
      `OK: ${d.degrees.length} degrees, ${d.families.length} families, ${d.universities.length} universities, ` +
        `${d.scholarships.length} scholarship record(s), ${d.sources.length} sources, FX ${d.fx.rate} (${d.fx.rateDate}).`,
    );
  } catch (err) {
    console.error('Data validation FAILED');
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
