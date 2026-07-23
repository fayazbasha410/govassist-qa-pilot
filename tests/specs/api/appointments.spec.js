// ─────────────────────────────────────────────────────────────────────────────
// TC_APPT — Appointment Booking API Tests
// ─────────────────────────────────────────────────────────────────────────────

const { test, expect } = require('../../fixtures/fixtures');
const { APPOINTMENTS, VALID_SERVICES, RESPONSE_TIMES, EN } = require('../../data/testData');
const {
  assertAppointmentSchema,
  measureTime,
  assertResponseTime
} = require('../../helpers/testHelpers');

test.describe('Appointment Booking API', () => {

  // ── Happy Path ──────────────────────────────────────────────────────────────
  test('[TC_APPT_001] books successfully with valid service and date', async ({ api }) => {
    const { status, body } = await api.bookAppointment(
      APPOINTMENTS.valid.service,
      APPOINTMENTS.valid.date
    );
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.confirmationNumber).toMatch(/^TAMM-/);
  });

  test('[TC_APPT_002] response schema is valid on success', async ({ api }) => {
    const { body } = await api.bookAppointment(
      APPOINTMENTS.valid.service,
      APPOINTMENTS.valid.date
    );
    assertAppointmentSchema(body);
  });

  test('[TC_APPT_003] confirmation number starts with TAMM-', async ({ api }) => {
    const { body } = await api.bookAppointment(
      APPOINTMENTS.valid.service,
      APPOINTMENTS.valid.date
    );
    expect(body.confirmationNumber).toMatch(/^TAMM-[A-Z0-9]+$/);
  });

  test('[TC_APPT_004] confirmation numbers are unique per booking', async ({ api }) => {
    const { body: b1 } = await api.bookAppointment(
      APPOINTMENTS.valid.service, APPOINTMENTS.valid.date
    );
    const { body: b2 } = await api.bookAppointment(
      APPOINTMENTS.validDubai.service, APPOINTMENTS.validDubai.date
    );
    expect(b1.confirmationNumber).not.toBe(b2.confirmationNumber);
  });

  test('[TC_APPT_005] response includes service, date, location, time', async ({ api }) => {
    const { body } = await api.bookAppointment(
      APPOINTMENTS.valid.service,
      APPOINTMENTS.valid.date
    );
    expect(typeof body.service).toBe('string');
    expect(typeof body.date).toBe('string');
    expect(typeof body.location).toBe('string');
    expect(typeof body.time).toBe('string');
  });

  test('[TC_APPT_006] service field in response matches request', async ({ api }) => {
    const { body } = await api.bookAppointment(
      APPOINTMENTS.valid.service,
      APPOINTMENTS.valid.date
    );
    expect(body.service).toBe(APPOINTMENTS.valid.service);
  });

  test('[TC_APPT_007] date field in response matches request', async ({ api }) => {
    const { body } = await api.bookAppointment(
      APPOINTMENTS.valid.service,
      APPOINTMENTS.valid.date
    );
    expect(body.date).toBe(APPOINTMENTS.valid.date);
  });

  // ── All Valid Services ──────────────────────────────────────────────────────
  for (const service of VALID_SERVICES) {
    test(`[TC_APPT_008_${service}] service '${service}' can be booked`, async ({ api }) => {
      const { body } = await api.bookAppointment(service, '2025-06-15');
      expect(body.success).toBe(true);
    });
  }

  // ── Failure Cases ───────────────────────────────────────────────────────────
  test('[TC_APPT_009] fails for invalid service name', async ({ api }) => {
    const { body } = await api.bookAppointment(
      APPOINTMENTS.invalidService.service,
      APPOINTMENTS.invalidService.date
    );
    expect(body.success).toBe(false);
    expect(typeof body.message).toBe('string');
  });

  test('[TC_APPT_010] fails for fully booked date', async ({ api }) => {
    const { body } = await api.bookAppointment(
      APPOINTMENTS.fullyBooked.service,
      APPOINTMENTS.fullyBooked.date
    );
    expect(body.success).toBe(false);
  });

  // ── Validation — Missing Fields ─────────────────────────────────────────────
  test('[TC_APPT_011] returns 400 when date is missing', async ({ api }) => {
    const { status } = await api.bookAppointmentRaw(APPOINTMENTS.missingDate);
    expect(status).toBe(400);
  });

  test('[TC_APPT_012] returns 400 when service is missing', async ({ api }) => {
    const { status } = await api.bookAppointmentRaw(APPOINTMENTS.missingService);
    expect(status).toBe(400);
  });

  test('[TC_APPT_013] returns 400 for empty payload', async ({ api }) => {
    const { status } = await api.bookAppointmentRaw(APPOINTMENTS.emptyPayload);
    expect(status).toBe(400);
  });

  test('[TC_APPT_014] returns 400 when service is null', async ({ api }) => {
    const { status } = await api.bookAppointmentRaw(APPOINTMENTS.nullService);
    expect(status).toBe(400);
  });

  // ── Response Time ────────────────────────────────────────────────────────────
  test('[TC_APPT_015] appointment booking responds within 3000ms', async ({ api }) => {
    const { durationMs } = await measureTime(() =>
      api.bookAppointment(APPOINTMENTS.valid.service, APPOINTMENTS.valid.date)
    );
    assertResponseTime(durationMs, RESPONSE_TIMES.toolCall, 'Appointment booking');
  });

});