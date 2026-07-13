import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateWorkflowDefinitionCommand } from '../commands/CreateWorkflowDefinition/CreateWorkflowDefinitionCommand';
import { AddWorkflowStageCommand } from '../commands/AddWorkflowStage/AddWorkflowStageCommand';
import { PublishWorkflowDefinitionCommand } from '../commands/PublishWorkflowDefinition/PublishWorkflowDefinitionCommand';
import { IWorkflowDefinitionRepository } from '../../domain/repositories/IWorkflowDefinitionRepository';

@Injectable()
export class WorkflowSeederService implements OnModuleInit {
  private readonly logger = new Logger(WorkflowSeederService.name);

  // We seed for the primary company (which we can assume exists or is passed).
  // In a real multi-tenant app, this would run per-tenant during tenant onboarding.
  // For the sake of this phase, we'll expose a method to seed per company.

  constructor(
    private readonly commandBus: CommandBus,
    @Inject('IWorkflowDefinitionRepository')
    private readonly repo: IWorkflowDefinitionRepository,
  ) {}

  async onModuleInit() {
    this.logger.log(
      'Workflow seeder ready. Call seedDefaultWorkflows(companyId) during tenant setup.',
    );
  }

  async seedDefaultWorkflows(
    companyId: string,
    performedBy: string,
  ): Promise<void> {
    const processes = [
      {
        processCode: 'OFFER_LETTER',
        name: 'Offer Letter Workflow',
        entityType: 'CANDIDATE',
        description:
          'Standard workflow for generating and sending offer letters.',
        stages: [
          {
            name: 'Draft Offer',
            code: 'DRAFT',
            isTerminal: false,
            isFinal: false,
          },
          {
            name: 'HR Approval',
            code: 'HR_APPROVAL',
            isTerminal: false,
            isFinal: false,
          },
          {
            name: 'Management Approval',
            code: 'MGMT_APPROVAL',
            isTerminal: false,
            isFinal: false,
          },
          {
            name: 'Candidate Review',
            code: 'CANDIDATE_REVIEW',
            isTerminal: true,
            isFinal: true,
          },
        ],
      },
      {
        processCode: 'OFFER_ACCEPTANCE',
        name: 'Offer Acceptance Workflow',
        entityType: 'CANDIDATE',
        description: 'Workflow for candidate accepting the offer.',
        stages: [
          {
            name: 'Pending Acceptance',
            code: 'PENDING',
            isTerminal: false,
            isFinal: false,
          },
          {
            name: 'Accepted',
            code: 'ACCEPTED',
            isTerminal: true,
            isFinal: true,
          },
        ],
      },
      {
        processCode: 'APPOINTMENT_ORDER',
        name: 'Appointment Order Workflow',
        entityType: 'EMPLOYEE',
        description: 'Workflow for issuing appointment orders to new hires.',
        stages: [
          {
            name: 'Draft Appointment',
            code: 'DRAFT',
            isTerminal: false,
            isFinal: false,
          },
          {
            name: 'HR Review',
            code: 'HR_REVIEW',
            isTerminal: false,
            isFinal: false,
          },
          { name: 'Issued', code: 'ISSUED', isTerminal: true, isFinal: true },
        ],
      },
      {
        processCode: 'EMPLOYEE_CONFIRMATION',
        name: 'Employee Confirmation Workflow',
        entityType: 'EMPLOYEE',
        description: 'Workflow for confirming an employee after probation.',
        stages: [
          {
            name: 'Manager Review',
            code: 'MGR_REVIEW',
            isTerminal: false,
            isFinal: false,
          },
          {
            name: 'HR Approval',
            code: 'HR_APPROVAL',
            isTerminal: false,
            isFinal: false,
          },
          {
            name: 'Confirmed',
            code: 'CONFIRMED',
            isTerminal: true,
            isFinal: true,
          },
        ],
      },
      {
        processCode: 'PROMOTION',
        name: 'Promotion Workflow',
        entityType: 'EMPLOYEE',
        description: 'Workflow for employee promotions.',
        stages: [
          {
            name: 'Nominated',
            code: 'NOMINATED',
            isTerminal: false,
            isFinal: false,
          },
          {
            name: 'Dept Head Approval',
            code: 'HOD_APPROVAL',
            isTerminal: false,
            isFinal: false,
          },
          {
            name: 'HR Approval',
            code: 'HR_APPROVAL',
            isTerminal: false,
            isFinal: false,
          },
          {
            name: 'Promoted',
            code: 'PROMOTED',
            isTerminal: true,
            isFinal: true,
          },
        ],
      },
      {
        processCode: 'TRANSFER',
        name: 'Transfer Workflow',
        entityType: 'EMPLOYEE',
        description:
          'Workflow for employee transfers between departments/locations.',
        stages: [
          {
            name: 'Initiated',
            code: 'INITIATED',
            isTerminal: false,
            isFinal: false,
          },
          {
            name: 'Current Manager Approval',
            code: 'CURR_MGR_APPROVAL',
            isTerminal: false,
            isFinal: false,
          },
          {
            name: 'New Manager Approval',
            code: 'NEW_MGR_APPROVAL',
            isTerminal: false,
            isFinal: false,
          },
          {
            name: 'Transferred',
            code: 'TRANSFERRED',
            isTerminal: true,
            isFinal: true,
          },
        ],
      },
      {
        processCode: 'RESIGNATION',
        name: 'Resignation Workflow',
        entityType: 'EMPLOYEE',
        description: 'Workflow for handling employee resignations.',
        stages: [
          {
            name: 'Submitted',
            code: 'SUBMITTED',
            isTerminal: false,
            isFinal: false,
          },
          {
            name: 'Manager Discussion',
            code: 'MGR_DISCUSSION',
            isTerminal: false,
            isFinal: false,
          },
          {
            name: 'HR Exit Interview',
            code: 'HR_EXIT',
            isTerminal: false,
            isFinal: false,
          },
          {
            name: 'Accepted',
            code: 'ACCEPTED',
            isTerminal: true,
            isFinal: true,
          },
        ],
      },
      {
        processCode: 'TERMINATION',
        name: 'Termination Workflow',
        entityType: 'EMPLOYEE',
        description: 'Workflow for employee termination.',
        stages: [
          {
            name: 'Initiated',
            code: 'INITIATED',
            isTerminal: false,
            isFinal: false,
          },
          {
            name: 'Legal Review',
            code: 'LEGAL_REVIEW',
            isTerminal: false,
            isFinal: false,
          },
          {
            name: 'Management Approval',
            code: 'MGMT_APPROVAL',
            isTerminal: false,
            isFinal: false,
          },
          {
            name: 'Terminated',
            code: 'TERMINATED',
            isTerminal: true,
            isFinal: true,
          },
        ],
      },
      {
        processCode: 'RELIEVING_LETTER',
        name: 'Relieving Letter Workflow',
        entityType: 'EMPLOYEE',
        description: 'Workflow for issuing relieving letters.',
        stages: [
          {
            name: 'Clearance Check',
            code: 'CLEARANCE',
            isTerminal: false,
            isFinal: false,
          },
          {
            name: 'HR Preparation',
            code: 'HR_PREP',
            isTerminal: false,
            isFinal: false,
          },
          { name: 'Issued', code: 'ISSUED', isTerminal: true, isFinal: true },
        ],
      },
      {
        processCode: 'EXPERIENCE_LETTER',
        name: 'Experience Letter Workflow',
        entityType: 'EMPLOYEE',
        description: 'Workflow for issuing experience letters.',
        stages: [
          {
            name: 'Request Received',
            code: 'REQUESTED',
            isTerminal: false,
            isFinal: false,
          },
          {
            name: 'HR Verification',
            code: 'HR_VERIFY',
            isTerminal: false,
            isFinal: false,
          },
          { name: 'Issued', code: 'ISSUED', isTerminal: true, isFinal: true },
        ],
      },
    ];

    for (const process of processes) {
      // Check if it already exists
      const existing = await this.repo.findByProcessCodeAndCompany(
        process.processCode,
        companyId,
      );
      if (existing) {
        this.logger.debug(
          `Workflow ${process.processCode} already exists for company ${companyId}`,
        );
        continue;
      }

      try {
        // Create
        const defIdRes = await this.commandBus.execute(
          new CreateWorkflowDefinitionCommand(
            companyId,
            performedBy,
            process.name,
            process.entityType,
            process.description,
            process.processCode,
          ),
        );

        if (defIdRes.isFailure) throw new Error(defIdRes.errorValue);
        const defId = defIdRes.getValue();

        // Add Stages
        let order = 1;
        for (const stage of process.stages) {
          const res = await this.commandBus.execute(
            new AddWorkflowStageCommand(
              defId,
              companyId,
              performedBy,
              stage.name,
              stage.code,
              order++,
              '',
              stage.isTerminal,
              stage.isFinal,
            ),
          );
          if (res.isFailure) throw new Error(res.errorValue);
        }

        // Publish
        const pubRes = await this.commandBus.execute(
          new PublishWorkflowDefinitionCommand(defId, companyId, performedBy),
        );
        if (pubRes.isFailure) throw new Error(pubRes.errorValue);

        this.logger.log(`Created & Published Workflow: ${process.processCode}`);
      } catch (e: any) {
        this.logger.error(
          `Failed to seed workflow ${process.processCode}: ${e.message}`,
        );
      }
    }
  }
}
