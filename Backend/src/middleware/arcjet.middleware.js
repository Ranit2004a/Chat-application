import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req, res, next) => {
  try {
    const decision = await aj.protect(req);
    if (decision.isDenied) {
      if(decision.reason.isRateLimit) {
        return res.status(429).json({ error: "Too many requests" });
      }
    
      else if (decision.reason.isBot) {
        return res.status(403).json({ error: "Bot traffic is not allowed" });
      }else{
        return res.status(403).json({ error: "Access denied by security policy." });
      }
    } 
     if(decision.reasult.some(isSpoofedBot)){
      return res.status(403).json({ error: "Spoofed bot not allowed",
        message: "Malicious bot activity detected."
       });
     }
    next();
  } catch (error) {
    console.error("Arcjet error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};