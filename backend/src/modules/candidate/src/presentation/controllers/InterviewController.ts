import { Controller, Post, Body, Param, Get, Put, Delete, Req, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../identity/src/presentation/guards/JwtAuthGuard';
import { ScheduleInterviewCommand } from '../../application/commands/ScheduleInterview/ScheduleInterviewCommand';
import { UpdateInterviewCommand } from '../../application/commands/UpdateInterview/UpdateInterviewCommand';
import { CancelInterviewCommand } from '../../application/commands/CancelInterview/CancelInterviewCommand';
import { SubmitInterviewFeedbackCommand } from '../../application/commands/SubmitInterviewFeedback/SubmitInterviewFeedbackCommand';
import { ListInterviewsQuery } from '../../application/queries/ListInterviews/ListInterviewsQuery';
import { GetInterviewQuery } from '../../application/queries/GetInterview/GetInterviewQuery';

@ApiTags('Candidate Interviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('candidates/:candidateId/interviews')
export class InterviewController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Schedule a new interview' })

  async scheduleInterview(
    @Param('candidateId') candidateId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.commandBus.execute(
      new ScheduleInterviewCommand(
        candidateId,
        req.user.companyId,
        body.title,
        body.description,
        body.type,
        new Date(body.scheduledAt),
        body.durationMinutes,
        body.meetingLink,
        body.location,
        body.interviewerIds || [],
        req.user.userId,
      ),
    );
  }

  @Put(':interviewId')
  @ApiOperation({ summary: 'Update an existing interview' })

  async updateInterview(
    @Param('interviewId') interviewId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.commandBus.execute(
      new UpdateInterviewCommand(
        interviewId,
        req.user.companyId,
        body.title,
        body.description,
        body.type,
        new Date(body.scheduledAt),
        body.durationMinutes,
        body.meetingLink,
        body.location,
        body.interviewerIds || [],
        req.user.userId,
      ),
    );
  }

  @Delete(':interviewId')
  @ApiOperation({ summary: 'Cancel an interview' })

  async cancelInterview(
    @Param('interviewId') interviewId: string,
    @Req() req: any,
  ) {
    return this.commandBus.execute(
      new CancelInterviewCommand(interviewId, req.user.companyId, req.user.userId),
    );
  }

  @Post(':interviewId/feedback')
  @ApiOperation({ summary: 'Submit interview feedback' })

  async submitFeedback(
    @Param('interviewId') interviewId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.commandBus.execute(
      new SubmitInterviewFeedbackCommand(
        interviewId,
        req.user.companyId,
        body.interviewerId || req.user.employeeId || req.user.userId,
        body.rating,
        body.comments,
        body.recommendation,
        req.user.userId,
      ),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all interviews for a candidate' })

  async listInterviews(
    @Param('candidateId') candidateId: string,
    @Req() req: any,
  ) {
    return this.queryBus.execute(new ListInterviewsQuery(candidateId, req.user.companyId));
  }

  @Get(':interviewId')
  @ApiOperation({ summary: 'Get details of a specific interview' })

  async getInterview(
    @Param('interviewId') interviewId: string,
    @Req() req: any,
  ) {
    return this.queryBus.execute(new GetInterviewQuery(interviewId, req.user.companyId));
  }
}
