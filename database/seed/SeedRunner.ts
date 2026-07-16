import { BaseSeeder } from './BaseSeeder';
import { SeedContext } from './SeedContext';

export class SeedRunner {
  private seeders: BaseSeeder[] = [];

  constructor(private context: SeedContext) {}

  /**
   * Registers seeders in the order they should be executed.
   */
  public addSeeders(seeders: BaseSeeder[]): void {
    this.seeders.push(...seeders);
  }

  /**
   * Runs all registered seeders sequentially.
   * Execution stops on the first failure.
   */
  public async run(): Promise<void> {
    console.log(`\n[Smatal Seed] Starting execution of ${this.seeders.length} seeders...`);
    
    for (const seeder of this.seeders) {
      console.log(`\n▶ Starting: ${seeder.name}`);
      try {
        await seeder.run(this.context);
        console.log(`✓ Completed: ${seeder.name}`);
      } catch (error) {
        console.error(`\n❌ Failed: ${seeder.name}`);
        console.error(error);
        throw new Error(`Seeding aborted due to failure in ${seeder.name}.`);
      }
    }
    
    console.log(`\n[Smatal Seed] All seeders completed successfully.\n`);
  }
}
