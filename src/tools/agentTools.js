// These are MOCK tools — they simulate real government database calls
// In a real system these would call actual APIs

function checkFineStatus(plateNumber) {
    // Simulate a database lookup
    const mockFines = {
      "AD-1234": [
        { id: "F001", amount: 400, reason: "Speeding 20km/h over limit", date: "2024-11-15", paid: false },
        { id: "F002", amount: 200, reason: "Illegal parking", date: "2024-10-02", paid: true }
      ],
      "AD-5678": [
        { id: "F003", amount: 600, reason: "Running red light", date: "2024-12-01", paid: false }
      ],
      "DXB-9999": []
    };
  
    const fines = mockFines[plateNumber.toUpperCase()];
    
    if (fines === undefined) {
      return { success: true, plateNumber, fines: [], message: "No records found for this plate number." };
    }
    
    const unpaidTotal = fines
      .filter(f => !f.paid)
      .reduce((sum, f) => sum + f.amount, 0);
  
    return {
      success: true,
      plateNumber,
      fines,
      unpaidTotal,
      message: unpaidTotal > 0 
        ? `You have AED ${unpaidTotal} in unpaid fines.` 
        : "All fines are paid."
    };
  }
  
  function bookAppointment(service, date) {
    // Simulate available slots
    const validServices = [
      "driving-license",
      "vehicle-registration", 
      "emirates-id",
      "residency-visa",
      "health-card"
    ];
  
    if (!validServices.includes(service.toLowerCase())) {
      return { 
        success: false, 
        message: `Service "${service}" not found. Available: ${validServices.join(", ")}` 
      };
    }
  
    // Simulate some dates being fully booked
    const bookedOut = ["2025-01-01", "2025-01-02"];
    if (bookedOut.includes(date)) {
      return { success: false, message: `No slots available on ${date}. Please choose another date.` };
    }
  
    const confirmationNumber = "TAMM-" + Math.random().toString(36).substr(2, 8).toUpperCase();
    
    return {
      success: true,
      confirmationNumber,
      service,
      date,
      location: "Abu Dhabi Main Service Center, Khalidiyah",
      time: "10:00 AM",
      message: `Appointment confirmed! Reference: ${confirmationNumber}`
    };
  }
  
  module.exports = { checkFineStatus, bookAppointment };  