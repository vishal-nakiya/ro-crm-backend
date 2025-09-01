// Test script for Customer Service Generation
// This script demonstrates the new automatic vs manual service generation functionality

const testData = {
  // Test 1: Automatic Service Generation
  automaticCustomer: {
    fullName: "John Doe (Automatic)",
    contactNumber: "1234567890",
    address: "123 Main St",
    area: "Downtown",
    joiningDate: "2024-01-01",
    tds: 100,
    roModel: "RO-500",
    category: "AMC",
    numberOfServices: 4,
    remark: "Premium customer - automatic services",
    status: "ACTIVE",
    serviceGenerationType: "AUTOMATIC"
  },

  // Test 2: Manual Service Generation
  manualCustomer: {
    fullName: "Jane Smith (Manual)",
    contactNumber: "0987654321",
    address: "456 Oak Ave",
    area: "Uptown",
    joiningDate: "2024-01-01",
    tds: 150,
    roModel: "RO-600",
    category: "NEW",
    numberOfServices: 3,
    remark: "Custom schedule - manual services",
    status: "ACTIVE",
    serviceGenerationType: "MANUAL",
    serviceDates: [
      "2024-02-15",
      "2024-05-20", 
      "2024-08-10"
    ]
  }
};

// Function to simulate the createCustomer logic
function simulateCreateCustomer(customerData) {
  console.log(`\n=== Creating Customer: ${customerData.fullName} ===`);
  console.log(`Service Generation Type: ${customerData.serviceGenerationType}`);
  
  if (customerData.serviceGenerationType === 'AUTOMATIC') {
    console.log(`Number of Services: ${customerData.numberOfServices}`);
    console.log(`Joining Date: ${customerData.joiningDate}`);
    
    // Simulate automatic service generation
    const baseDate = new Date(customerData.joiningDate);
    const numberOfServices = Math.max(1, Math.floor(12 / customerData.numberOfServices));
    const intervalMonths = 12 / numberOfServices;
    
    console.log(`\nAutomatic Services Generated:`);
    for (let i = 0; i < numberOfServices; i++) {
      const scheduled = new Date(baseDate);
      scheduled.setMonth(baseDate.getMonth() + (i * intervalMonths));
      console.log(`  Service ${i + 1}: ${scheduled.toDateString()}`);
    }
    
  } else if (customerData.serviceGenerationType === 'MANUAL') {
    console.log(`Number of Services: ${customerData.serviceDates.length}`);
    console.log(`Service Dates: ${customerData.serviceDates.join(', ')}`);
    
    // Simulate manual service generation
    const sortedDates = customerData.serviceDates.sort((a, b) => new Date(a) - new Date(b));
    
    console.log(`\nManual Services Generated:`);
    sortedDates.forEach((date, index) => {
      console.log(`  Service ${index + 1}: ${new Date(date).toDateString()}`);
    });
  }
  
  console.log(`\nCustomer created successfully!`);
}

// Run tests
console.log("🧪 Testing Customer Service Generation Functionality\n");

// Test automatic generation
simulateCreateCustomer(testData.automaticCustomer);

// Test manual generation  
simulateCreateCustomer(testData.manualCustomer);

console.log("\n✅ All tests completed!");
console.log("\n📝 Usage Notes:");
console.log("- For AUTOMATIC: Services are spaced evenly throughout the year");
console.log("- For MANUAL: Services are created on the exact dates you specify");
console.log("- The numberOfServices field should match the length of serviceDates array for manual mode");
console.log("- All services are automatically numbered sequentially");
