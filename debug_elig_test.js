const { PrismaClient } = require('@prisma/client');
const { calculateEligibility } = require('./src/lib/eligibility.ts'); // Wait, calculateEligibility is in TS, we can't easily require it from JS without compilation.
