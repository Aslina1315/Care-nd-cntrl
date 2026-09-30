export const access = "public";
export const methods = ["GET"];

export default async function (req, res) {
  res.json({
    ok: true,
    service: "CARE & CTRL API",
    environment: "production-ready foundation",
    timestamp: new Date().toISOString()
  });
}