import { SeedContext } from './SeedContext';

export abstract class BaseSeeder {
  /**
   * The name of the seeder, used for logging and tracking.
   */
  abstract readonly name: string;

  /**
   * Execute the seeder logic.
   * @param context The SeedContext providing PrismaClient and env configuration.
   */
  abstract run(context: SeedContext): Promise<void>;
}
