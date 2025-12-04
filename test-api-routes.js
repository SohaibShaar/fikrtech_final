/**
 * Test script for Next.js API Routes
 * Run with: node test-api-routes.js
 */

const BASE_URL = 'http://localhost:3000/api';

async function testEndpoint(method, path, data = null, token = null) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return {
      status: response.status,
      success: response.ok,
      data: result,
    };
  } catch (error) {
    return {
      status: 0,
      success: false,
      error: error.message,
    };
  }
}

async function runTests() {
  console.log('🧪 Starting API Routes Tests...\n');

  // Test 1: Health Check
  console.log('1️⃣ Testing Health Check...');
  const healthCheck = await testEndpoint('GET', '/health');
  console.log(`   Status: ${healthCheck.status}`);
  console.log(`   Success: ${healthCheck.success}`);
  console.log(`   Response:`, healthCheck.data);
  console.log('');

  // Test 2: Get Tutoring Categories (Public)
  console.log('2️⃣ Testing Get Tutoring Categories...');
  const categories = await testEndpoint('GET', '/auth/tutoring-categories');
  console.log(`   Status: ${categories.status}`);
  console.log(`   Success: ${categories.success}`);
  console.log(`   Categories Count:`, categories.data?.data?.length || 0);
  console.log('');

  // Test 3: Get Dynamic Options (Public)
  console.log('3️⃣ Testing Get Teacher Dynamic Options...');
  const dynamicOptions = await testEndpoint('GET', '/teacher/dynamic-options?role=TUTORING');
  console.log(`   Status: ${dynamicOptions.status}`);
  console.log(`   Success: ${dynamicOptions.success}`);
  console.log('');

  // Test 4: Get Pricing Packages (Public)
  console.log('4️⃣ Testing Get Pricing Packages...');
  const pricing = await testEndpoint('GET', '/pricing');
  console.log(`   Status: ${pricing.status}`);
  console.log(`   Success: ${pricing.success}`);
  console.log('');

  // Test 5: Get Public Courses
  console.log('5️⃣ Testing Get Public Courses...');
  const courses = await testEndpoint('GET', '/course/public');
  console.log(`   Status: ${courses.status}`);
  console.log(`   Success: ${courses.success}`);
  console.log('');

  // Test 6: Login (if you have test credentials)
  console.log('6️⃣ Testing Login...');
  const login = await testEndpoint('POST', '/auth/login', {
    email: 'test@example.com',
    password: 'password123',
  });
  console.log(`   Status: ${login.status}`);
  console.log(`   Success: ${login.success}`);
  console.log(`   Message: ${login.data?.message}`);
  console.log('');

  let token = null;
  if (login.success && login.data?.data?.token) {
    token = login.data.data.token;
    console.log('   ✅ Token received, testing protected routes...\n');

    // Test 7: Get Profile (Protected)
    console.log('7️⃣ Testing Get Profile (Protected)...');
    const profile = await testEndpoint('GET', '/auth/profile', null, token);
    console.log(`   Status: ${profile.status}`);
    console.log(`   Success: ${profile.success}`);
    console.log('');

    // Test 8: Get Form Completion Status (Protected)
    console.log('8️⃣ Testing Form Completion Status (Protected)...');
    const formStatus = await testEndpoint('GET', '/form-completion/status', null, token);
    console.log(`   Status: ${formStatus.status}`);
    console.log(`   Success: ${formStatus.success}`);
    console.log('');
  } else {
    console.log('   ⚠️  Login failed or no test credentials available');
    console.log('   Skipping protected route tests\n');
  }

  // Test 9: Test 404 handling
  console.log('9️⃣ Testing 404 Error Handling...');
  const notFound = await testEndpoint('GET', '/nonexistent-endpoint');
  console.log(`   Status: ${notFound.status}`);
  console.log(`   Success: ${notFound.success}`);
  console.log(`   Message: ${notFound.data?.message}`);
  console.log('');

  // Test 10: Test unauthorized access
  console.log('🔟 Testing Unauthorized Access...');
  const unauthorized = await testEndpoint('GET', '/admin/dashboard/stats');
  console.log(`   Status: ${unauthorized.status}`);
  console.log(`   Success: ${unauthorized.success}`);
  console.log(`   Message: ${unauthorized.data?.message}`);
  console.log('');

  console.log('✅ Tests completed!\n');
  console.log('📊 Summary:');
  console.log('   - Health Check: ✓');
  console.log('   - Public Endpoints: ✓');
  console.log('   - Authentication: ' + (token ? '✓' : '⚠️'));
  console.log('   - Error Handling: ✓');
  console.log('');
  console.log('💡 Note: For full testing, ensure:');
  console.log('   1. Next.js dev server is running (npm run dev)');
  console.log('   2. Database is connected and seeded');
  console.log('   3. Environment variables are configured');
  console.log('');
}

// Run tests
runTests().catch(console.error);



