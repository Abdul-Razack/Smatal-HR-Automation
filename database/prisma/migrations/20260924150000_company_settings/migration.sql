-- AlterTable
ALTER TABLE "companies" ADD COLUMN "address" VARCHAR(500),
ADD COLUMN "phone" VARCHAR(50),
ADD COLUMN "email" VARCHAR(255),
ADD COLUMN "authorizedPerson" VARCHAR(255),
ADD COLUMN "authorizedPersonDesignation" VARCHAR(255),
ADD COLUMN "signatureUrl" VARCHAR(500);
