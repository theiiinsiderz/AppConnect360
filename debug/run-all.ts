import { execSync } from 'child_process';

const tests = [
    { name: 'API Connection', file: 'test-1-api.ts' },
    { name: 'Auth Module', file: 'test-2-auth.ts' },
    { name: 'Tag Module', file: 'test-3-tags.ts' },
    { name: 'Shop Module', file: 'test-4-shop.ts' },
    { name: 'Scan Module', file: 'test-5-scan.ts' },
    { name: 'Admin Module', file: 'test-6-admin.ts' },
];

async function runAllTests() {
    // console.log('🚀 Running All Module Tests\n');
    // console.log('='.repeat(50) + '\n');

    for (const test of tests) {
        // console.log(`\n📦 ${test.name}`);
        // console.log('-'.repeat(50));

        try {
            execSync(`npx ts-node debug/${test.file}`, {
                stdio: 'inherit',
                cwd: process.cwd()
            });
        } catch (error) {
            // console.log(`\n⚠️  ${test.name} had errors\n`);
        }

        // console.log('\n');
    }

    // console.log('='.repeat(50));
    // console.log('✅ All tests completed\n');
}

runAllTests();
