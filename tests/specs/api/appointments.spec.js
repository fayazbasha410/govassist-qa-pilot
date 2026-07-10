const { test, expect } = require('../../fixtures/fixtures');
const { APPOINTMENTS, VALID_SERVICES } = require('../../data/testData');
const { assertAppointmentSchema } = require('../../helpers/testHelpers');

test.describe('Appointment Booking API', () => {

  test('books successfully with valid service and date', async ({ api }) => {
    const { status, body } = await api.bookAppointment(
      APPOINTMENTS.valid.service,
      APPOINTMENTS.valid.date
    );
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.confirmationNumber).toMatch(/^TAMM-/);
  });

  test('response schema is valid on success', async ({ api }) => {
    const { body } = await api.bookAppointment(
      APPOINTMENTS.valid.service,
      APPOINTMENTS.valid.date
    );
    assertAppointmentSchema(body);
  });

  test('confirmation number is unique per booking', async ({ api }) => {
    const { body: b1 } = await api.bookAppointment(APPOINTMENTS.valid.service, APPOINTMENTS.valid.date);
    const { body: b2 } = await api.bookAppointment(APPOINTMENTS.validDubai.service, APPOINTMENTS.validDubai.date);
    expect(b1.confirmationNumber).not.toBe(b2.confirmationNumber);
  });

  test('fails for invalid service name', async ({ api }) => {
    const { body } = await api.bookAppointment(
      APPOINTMENTS.invalidService.service,
      APPOINTMENTS.invalidService.date
    );
    expect(body.success).toBe(false);
    expect(body.message).toBeDefined();
  });

  test('fails for fully booked date', async ({ api }) => {
    const { body } = await api.bookAppointment(
      APPOINTMENTS.fullyBooked.service,
      APPOINTMENTS.fullyBooked.date
    );
    expect(body.success).toBe(false);
  });

  test('returns 400 when date is missing', async ({ api }) => {
    const { status } = await api.bookAppointmentRaw(APPOINTMENTS.missingDate);
    expect(status).toBe(400);
  });

  test('returns 400 when service is missing', async ({ api }) => {
    const { status } = await api.bookAppointmentRaw(APPOINTMENTS.missingService);
    expect(status).toBe(400);
  });

  test('all valid services can be booked', async ({ api }) => {
    for (const service of VALID_SERVICES) {
      const { body } = await api.bookAppointment(service, '2025-06-15');
      expect(body.success).toBe(true);
    }
  });

});