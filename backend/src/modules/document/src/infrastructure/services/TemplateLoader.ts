import { Injectable, Inject, Logger } from '@nestjs/common';
import { IStorageService } from '../../../../../infrastructure/storage/IStorageService';
import { Readable } from 'stream';
import { LRUCache } from 'lru-cache';

@Injectable()
export class TemplateLoader {
  private readonly logger = new Logger(TemplateLoader.name);

  // Cache up to 100 templates in memory. TTL: 15 minutes.
  // We cache the buffer since streams can only be read once.
  private readonly cache = new LRUCache<string, Buffer>({
    max: 100,
    ttl: 1000 * 60 * 15,
  });

  constructor(
    @Inject('IStorageService') private readonly storageService: IStorageService,
  ) {}

  async loadTemplateStream(storageUri: string): Promise<Readable> {
    const cachedBuffer = this.cache.get(storageUri);
    if (cachedBuffer) {
      this.logger.debug(`Template loaded from cache: ${storageUri}`);
      return Readable.from([cachedBuffer]);
    }

    this.logger.log(`Downloading template from storage: ${storageUri}`);
    // If not in cache, we download as buffer so we can cache it.
    const buffer = await this.storageService.download(storageUri);
    this.cache.set(storageUri, buffer);

    return Readable.from([buffer]);
  }
}
