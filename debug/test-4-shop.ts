import axios from 'axios';

const API_BASE_URL = 'https://carcard.onrender.com/api';
const TEST_PHONE = '9876543210';
let authToken = '';

async function testShopModule() {
    // console.log('🔍 Testing Shop Module...\n');

    // Step 1: Login
    try {
        await axios.post(`${API_BASE_URL}/auth/send-otp`, { phoneNumber: TEST_PHONE });
        const verifyResponse = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
            phoneNumber: TEST_PHONE,
            otp: '123456'
        });
        authToken = verifyResponse.data.token;
        // console.log('✅ Authenticated\n');
    } catch (error: any) {
        console.error('❌ Auth failed:', error.response?.data || error.message);
        return;
    }

    const headers = { Authorization: `Bearer ${authToken}` };

    // Test 1: Get Products
    try {
        const response = await axios.get(`${API_BASE_URL}/shop/products`, { headers });
        // console.log('✅ Get Products:', response.data.length, 'products found');
    } catch (error: any) {
        console.error('❌ Get Products failed:', error.response?.data || error.message);
    }

    // Test 2: Get Orders
    try {
        const response = await axios.get(`${API_BASE_URL}/shop/orders`, { headers });
        // console.log('✅ Get Orders:', response.data.length, 'orders found');
    } catch (error: any) {
        console.error('❌ Get Orders failed:', error.response?.data || error.message);
    }
}

testShopModule();
