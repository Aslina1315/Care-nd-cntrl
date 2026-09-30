import { db } from "hatchable";

export const access = "public";
export const methods = ["GET"];

export default async function (req, res) {
  const patientResult = await db.query("SELECT count(*)::int AS count FROM patients WHERE status = 'active'");
  const sourceResult = await db.query("SELECT count(*)::int AS count FROM data_sources WHERE status = 'connected'");
  const actionResult = await db.query("SELECT count(*)::int AS count FROM action_queue WHERE status = 'pending'");

  res.json({
    patients_needing_attention: 0,
    active_patients: patientResult.rows[0]?.count ?? 0,
    connected_sources: sourceResult.rows[0]?.count ?? 0,
    pending_human_decisions: actionResult.rows[0]?.count ?? 0,
    phc_pressure: null,
    resource_outlook: null,
    data_state: sourceResult.rows[0]?.count ? "connected" : "awaiting_verified_sources",
    generated_at: new Date().toISOString()
  });
}