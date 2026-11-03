const { spawn } = require('child_process');
const path = require('path');

process.env.NODE_PATH = [
  path.resolve(__dirname, '../server/node_modules'),
  path.resolve(__dirname, '../client/node_modules')
].join(path.delimiter);

const testFiles = [
  'tests/unit/emailValidator.test.js',
  'tests/unit/otpStore.test.js',
  'tests/unit/payu.test.js',
  'tests/unit/apiErrorAndAsyncHandler.test.js',
  'tests/unit/financialMath.test.js',
  'tests/unit/authMiddleware.test.js',
  'tests/unit/cartReducer.test.js',
  'tests/unit/mailerTemplates.test.js'
];

console.log('\n=============================================================');
console.log('🚀 RUNNING REVIEWXPRESS COMPLETE UNIT TEST SUITE');
console.log('=============================================================\n');

const child = spawn(process.execPath, ['--test', ...testFiles], {
  stdio: 'inherit',
  env: process.env
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('\n=============================================================');
    console.log('✅ ALL UNIT TESTS PASSED CLEANLY (100% SUCCESS)');
    console.log('=============================================================\n');
  } else {
    console.log(`\n❌ Tests exited with status code: ${code}`);
  }
  process.exit(code);
});
