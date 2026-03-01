import axios from 'axios';

const API_BASE_URL = 'https://carcard.onrender.com/api';
const TEST_TAG_ID = 'TAG-123';

async function testScanModule() {
    // console.log('🔍 Testing Scan Module...\n');

    // Test: Public Scan (no auth required)
    try {
        const response = await axios.get(`${API_BASE_URL}/v1/scan/${TEST_TAG_ID}`);
        // console.log('✅ Public Scan successful');
        // console.log('Tag Data:', response.data);
    } catch (error: any) {
        console.error('❌ Public Scan failed:', error.response?.data || error.message);
    }
}

testScanModule();
