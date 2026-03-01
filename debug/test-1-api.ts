import axios from 'axios';

const API_BASE_URL = 'https://carcard.onrender.com/api';

async function testAPIConnection() {
    // console.log('🔍 Testing API Connection...\n');

    try {
        const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
        // console.log('✅ API is reachable');
        // console.log('Response:', response.data);
    } catch (error: any) {
        // console.log('❌ API connection failed');
        console.error('Error:', error.message);
    }
}

testAPIConnection();
