import { Controller, Post, Body, Param, Get, Put, Delete, Req, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../identity/src/presentation/guards/JwtAuthGuard';
import { GenerateOfferCommand } from '../../application/commands/GenerateOffer/GenerateOfferCommand';
import { UpdateOfferCommand } from '../../application/commands/UpdateOffer/UpdateOfferCommand';
import { AcceptOfferCommand } from '../../application/commands/AcceptOffer/AcceptOfferCommand';
import { RejectOfferCommand } from '../../application/commands/RejectOffer/RejectOfferCommand';
import { GetCandidateOffersQuery } from '../../application/queries/GetCandidateOffers/GetCandidateOffersQuery';

@ApiTags('Candidate Offers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('candidates/:candidateId/offers')
export class OfferController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Generate a new offer' })

  async generateOffer(
    @Param('candidateId') candidateId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.commandBus.execute(
      new GenerateOfferCommand(
        candidateId,
        req.user.companyId,
        body.documentTypeId,
        body.baseSalary,
        body.currency,
        body.joiningDate ? new Date(body.joiningDate) : new Date(),
        body.validUntil ? new Date(body.validUntil) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
        body.notes,
        req.user.userId,
      ),
    );
  }

  @Put(':offerId')
  @ApiOperation({ summary: 'Update an existing offer' })

  async updateOffer(
    @Param('offerId') offerId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.commandBus.execute(
      new UpdateOfferCommand(
        offerId,
        req.user.companyId,
        body.baseSalary,
        body.currency,
        body.joiningDate ? new Date(body.joiningDate) : null,
        body.validUntil ? new Date(body.validUntil) : null,
        body.notes,
        req.user.userId,
      ),
    );
  }

  @Post(':offerId/accept')
  @ApiOperation({ summary: 'Accept an offer' })

  async acceptOffer(
    @Param('offerId') offerId: string,
    @Req() req: any,
  ) {
    return this.commandBus.execute(
      new AcceptOfferCommand(offerId, req.user.companyId, req.user.userId),
    );
  }

  @Post(':offerId/reject')
  @ApiOperation({ summary: 'Reject an offer' })

  async rejectOffer(
    @Param('offerId') offerId: string,
    @Req() req: any,
  ) {
    return this.commandBus.execute(
      new RejectOfferCommand(offerId, req.user.companyId, req.user.userId),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all offers for a candidate' })

  async getOffers(
    @Param('candidateId') candidateId: string,
    @Req() req: any,
  ) {
    return this.queryBus.execute(new GetCandidateOffersQuery(candidateId, req.user.companyId));
  }
}
