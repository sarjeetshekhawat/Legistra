// Complete Upload Flow Test
// Run this in browser console on http://localhost:3000

async function testCompleteUploadFlow() {
  console.log('🧪 Testing Complete Upload Flow...');
  
  try {
    // Test 1: Check if API service is configured correctly
    console.log('✅ Test 1 - API Configuration:');
    const api = await import('../src/services/api.js');
    console.log('   API service loaded successfully');
    
    // Test 2: Create a test file
    console.log('✅ Test 2 - Creating test file:');
    const testContent = 'This is a test document for complete upload verification.';
    const testFile = new File([testContent], 'test-upload.txt', { type: 'text/plain' });
    console.log('   Test file created:', testFile.name, testFile.size, 'bytes');
    
    // Test 3: Test upload API directly
    console.log('✅ Test 3 - Testing upload API:');
    const { uploadDocument } = api;
    
    const uploadPromise = uploadDocument(testFile, (progress) => {
      console.log(`   Upload progress: ${progress}%`);
    });
    
    const response = await uploadPromise;
    console.log('   Upload successful:', response.data);
    console.log('   Document ID:', response.data.document_id);
    
    // Test 4: Verify UI state
    console.log('✅ Test 4 - UI State Check:');
    const uploadBtn = document.querySelector('button[onClick*="handleUpload"]');
    const fileInput = document.getElementById('file-input');
    const errorDiv = document.querySelector('.bg-red-50');
    
    console.log('   Upload button found:', !!uploadBtn);
    console.log('   File input found:', !!fileInput);
    console.log('   Current error state:', errorDiv ? errorDiv.textContent.trim() : 'No error');
    
    console.log('🎉 Complete Upload Flow Test - SUCCESS!');
    return true;
    
  } catch (error) {
    console.error('❌ Upload Flow Test Failed:', error);
    console.error('Error details:', error.response || error.request || error.message);
    return false;
  }
}

// Auto-run the test
testCompleteUploadFlow().then(success => {
  if (success) {
    console.log('\n💡 You can now test the upload functionality in the UI:');
    console.log('   1. Click "Choose File" and select any .txt, .pdf, .docx, or .doc file');
    console.log('   2. Click "Upload Document"');
    console.log('   3. Watch the progress bar and success message');
  } else {
    console.log('\n🔧 Check the browser console for error details');
  }
});
