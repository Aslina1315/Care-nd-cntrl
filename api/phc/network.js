import { db } from "hatchable";
export const access = "user";
export default async function(req,res){
  const facilities=await db.query("SELECT f.id,f.external_ref,f.name,f.district,f.state,f.status,f.capacity_total,f.updated_at,COUNT(i.id)::int AS resource_records FROM phc_facilities f LEFT JOIN resource_inventory i ON i.facility_id=f.id GROUP BY f.id ORDER BY f.name");
  res.json({facilities:facilities.rows});
}