import { Injectable, Inject } from '@nestjs/common';
import { IDocumentGeneratorStrategy } from './IDocumentGeneratorStrategy';

@Injectable()
export class DocumentGeneratorFactory {
  constructor(
    @Inject('DOCUMENT_GENERATOR_STRATEGIES')
    private readonly strategies: IDocumentGeneratorStrategy[],
  ) {}

  getStrategy(contentType: string): IDocumentGeneratorStrategy {
    const strategy = this.strategies.find((s) => s.supports(contentType));

    if (!strategy) {
      throw new Error(`Unsupported template content type: ${contentType}`);
    }

    return strategy;
  }
}
