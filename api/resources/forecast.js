import { db } from "hatchable";
export const access = "user";
export default async function(req,res){
  const r=await db.query("SELECT i.id,i.facility_id,f.name AS facility_name,i.resource_name,i.unit,i.quantity_available,i.average_daily_use,i.reorder_level,i.observed_at,CASE WHEN i.average_daily_use>0 THEN GREATEST(0,(i.quantity_available-i.reorder_level)/i.average_daily_use) ELSE NULL END AS days_to_reorder FROM resource_inventory i JOIN phc_facilities f ON f.id=i.facility_id ORDER BY CASE WHEN i.average_daily_use>0 THEN (i.quantity_available-i.reorder_level)/i.average_daily_use ELSE 999999 END ASC LIMIT 250");
  res.json({rows:r.rows});
}