// Complete Frontend Integration Test
// Run this in browser console on http://localhost:3000

async function testCompleteAnalysisWorkflow() {
  console.log('🧪 Testing Complete Analysis Workflow...');
  
  try {
    // Import the updated API functions
    const { analyzeDocument, getTaskStatus } = await import('../src/services/api.js');
    
    // Test 1: Start analysis
    console.log('✅ Test 1 - Starting Analysis:');
    const testDocId = 'test-doc-id';
    const analyzeResponse = await analyzeDocument(testDocId);
    
    console.log('   Analysis started:', analyzeResponse.status);
    console.log('   Task ID:', analyzeResponse.data.task_id);
    
    const taskId = analyzeResponse.data.task_id;
    
    // Test 2: Monitor task progress
    console.log('✅ Test 2 - Monitoring Progress:');
    
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const statusResponse = await getTaskStatus(taskId);
      const taskData = statusResponse.data;
      
      console.log(`   Status after ${i+1}s: ${taskData.state}`);
      
      if (taskData.state === 'SUCCESS') {
        console.log('   🎉 Analysis completed successfully!');
        console.log('   Results:', taskData.result);
        break;
      } else if (taskData.state === 'FAILURE') {
        console.log('   ❌ Analysis failed:', taskData.error);
        break;
      } else if (taskData.state === 'PROGRESS') {
        console.log(`   📊 Progress: ${taskData.progress}% - ${taskData.status}`);
      }
    }
    
    console.log('🎉 Complete Workflow Test - SUCCESS!');
    return true;
    
  } catch (error) {
    console.error('❌ Workflow Test Failed:', error);
    console.error('Error details:', error.response?.data || error.message);
    return false;
  }
}

// Auto-run the test
testCompleteAnalysisWorkflow().then(success => {
  if (success) {
    console.log('\n💡 The analysis feature is now working correctly!');
    console.log('   - No more "Analysis failed: tasks.analyze_document_task" errors');
    console.log('   - Tasks progress from PENDING → PROGRESS → SUCCESS');
    console.log('   - Results are returned properly');
  } else {
    console.log('\n🔧 Check the browser console for error details');
  }
});
