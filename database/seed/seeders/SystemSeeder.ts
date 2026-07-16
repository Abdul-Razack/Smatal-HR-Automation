import { BaseSeeder } from '../BaseSeeder';
import { SeedContext } from '../SeedContext';

export class SystemSeeder extends BaseSeeder {
  readonly name = 'SystemSeeder';

  async run(context: SeedContext): Promise<void> {
    // Placeholder for global system settings:
    // e.g. Default Language, Time Zone, Currency
    // Since Smatal HR System uses env-based or tenant-specific settings mostly,
    // this seeder will serve as a foundation for future SystemSettings table.
    
    console.log(`  -> Initialized System settings (Placeholder).`);
  }
}
