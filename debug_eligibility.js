const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { idPassportNumber: "HIGH001" } });
  const enrollments = await prisma.courseEnrollment.findMany({ where: { userId: user.id }});
  
  let completed10Day = 0;
  let completed20Day = 0;
  let completed30Day = 0;
  let lastCompletionDate = new Date(0);

  enrollments.forEach(e => {
    if (e.courseType === "10-day") completed10Day++;
    if (e.courseType === "20-day") completed20Day++;
    if (e.courseType === "30-day") completed30Day++;
    
    const d = new Date(e.completedAt);
    if (d > lastCompletionDate) lastCompletionDate = d;
  });

  console.log("Counts:", { completed10Day, completed20Day, completed30Day });
  
  const today = new Date();
  const timeDiff = today.getTime() - lastCompletionDate.getTime();
  const daysSinceLastCompletion = Math.floor(timeDiff / (1000 * 3600 * 24));
  
  console.log("Days since last:", daysSinceLastCompletion);
  console.log("hasWaited:", daysSinceLastCompletion >= 10);
}

main().then(() => process.exit(0));
