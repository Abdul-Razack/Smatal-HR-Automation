"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const company = await prisma.company.findFirst();
    if (!company)
        return;
    console.log("Company:", company.id);
    try {
        let data = await prisma.candidate.findMany({
            where: {
                companyId: company.id,
                isDeleted: false,
            },
            include: { profile: true },
        });
        console.log("Candidate data:", data.length);
    }
    catch (e) {
        console.error("Error:", e);
    }
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=test-report.js.map