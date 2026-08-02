// These are MOCK tools — they simulate real government database calls
// In a real system these would call actual APIs
//
// NOTE (v3.6.0): checkFineStatus is now a stub. Traffic fine checking is
// transport-scoped and belongs to the sister project, Tawfeer
// (tawfeer-ai.onrender.com). Kept as a stub rather than deleted outright
// so a plate-number-shaped query still gets a helpful redirect instead
// of silently falling through to the RAG layer with no match.

function checkFineStatus(plateNumber) {
  return {
    success: false,
    plateNumber,
    fines: [],
    unpaidTotal: 0,
    redirect: 'https://tawfeer-ai.onrender.com',
    message: `Traffic fine checks have moved to Tawfeer, our dedicated transport assistant. Please visit tawfeer-ai.onrender.com to check fines for plate ${plateNumber}.`
  };
}

function bookAppointment(service, date) {
  // Simulate available slots
  // NOTE (v3.6.0): 'driving-license' and 'vehicle-registration' removed —
  // those services now belong to Tawfeer.
  const validServices = [
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