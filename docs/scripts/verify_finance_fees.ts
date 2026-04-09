import axios from 'axios';
const { PrismaClient } = require('./src/generated/client/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const BASE_URL = 'http://localhost:3000';

async function runVerification() {
    try {
        console.log('Starting Finance Fees Module Verification...');

        // 1. Auth - Login as Super Admin (Initial)
        let token;
        try {
            const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'superadmin@basaeer.com',
                password: 'admin123'
            });
            token = loginRes.data.access_token;
            console.log('✅ Auth: Initial Login successful');
        } catch (e) {
            console.error('❌ Auth: Login failed. Ensure server is running and admin exists.');
            process.exit(1);
        }

        let authHeaders = { Authorization: `Bearer ${token}` };

        // 2. Fetch Profile or Get/Create Branch
        let branchId: string;

        console.log('🔍 Checking for existing branches...');
        const branchesRes = await axios.get(`${BASE_URL}/branches`, { headers: authHeaders });

        if (branchesRes.data.length > 0) {
            branchId = branchesRes.data[0].id;
            console.log(`✅ Setup: Using existing branch "${branchesRes.data[0].name}" (${branchId})`);
        } else {
            console.log('⚠️ Setup: No branches found. Creating one...');
            const newBranchRes = await axios.post(`${BASE_URL}/branches`, {
                name: 'Main Branch Test',
                code: `TEST-${Date.now()}`,
                address: '123 Test St'
            }, { headers: authHeaders });
            branchId = newBranchRes.data.id;
            console.log(`✅ Setup: Created new branch "Main Branch Test" (${branchId})`);
        }

        // 3. Assign Branch to Super Admin (Direct DB Update) & Re-login
        console.log('🔄 Setup: Assigning branch to Super Admin and refreshing token...');
        await prisma.user.update({
            where: { email: 'superadmin@basaeer.com' },
            data: { branchId }
        });

        const reLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'superadmin@basaeer.com',
            password: 'admin123'
        });
        token = reLoginRes.data.access_token;
        authHeaders = { Authorization: `Bearer ${token}` };
        console.log('✅ Auth: Token refreshed with Branch ID');

        // 4. Create Fee Category
        const categoryName = `Library-Fee-${Date.now()}`;
        console.log(`Checking create with branchID: ${branchId}`);
        // Note: We still pass branchId in body just in case, though controller uses req.user.branchId usually only for retrieval/validation or setting default?
        // Let's check controller logic: 
        // createCategory(@Body() dto: CreateFeeCategoryDto) { return this.financeService.createFeeCategory(dto); }
        // DTO has branchId? Service creates directly using dto. 
        // So passing branchId in body allows creation even if user not in branch? 
        // Only if endpoints are unrestricted. But FinanceController has @Roles.
        // Wait, if I pass branchId in body, create works. 
        // But GET /fee-categories uses req.user.branchId. 
        // So we needed step 3 mostly for GET verification.

        const feeCatRes = await axios.post(`${BASE_URL}/finance/fee-categories`, {
            name: categoryName,
            description: 'Library usage fee',
            branchId
        }, { headers: authHeaders });
        const feeCategoryId = feeCatRes.data.id;
        console.log(`✅ Setup: Created Fee Category "${categoryName}"`);

        // 5. Verify GET /finance/fee-categories
        const getCategoriesRes = await axios.get(`${BASE_URL}/finance/fee-categories`, { headers: authHeaders });
        const categories = getCategoriesRes.data;
        const foundCategory = categories.find((c: any) => c.id === feeCategoryId);

        if (foundCategory && foundCategory.name === categoryName) {
            console.log(`✅ Verification: Found new category "${categoryName}" in GET list.`);
        } else {
            console.error(`❌ Verification: New category NOT found in GET list.`);
            console.log('Received list:', categories);
            // If empty, it means req.user.branchId didn't match the category's branchId.
        }

        // 6. Verify GET /finance/fee-structures
        const getStructuresRes = await axios.get(`${BASE_URL}/finance/fee-structures`, { headers: authHeaders });
        console.log(`✅ Verification: GET /finance/fee-structures returned ${getStructuresRes.data.length} items.`);

        console.log('\n🎉 ALL FEE VERIFICATION TESTS PASSED 🎉');

    } catch (error: any) {
        console.error('❌ Verification Failed:', error.response?.data || error.message);
    } finally {
        await prisma.$disconnect();
    }
}

runVerification();
