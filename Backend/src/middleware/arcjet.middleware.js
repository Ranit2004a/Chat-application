import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req, res, next) => {
  try {
    const decision = await aj.protect(req);
  
    if (decision.isDenied()) {
      if(decision.reason.isRateLimit()) {
        return res.status(429).json({ error: "Too many requests" });
      }
    
      if (decision.reason.isBot()) {
        return res.status(403).json({ error: "Bot traffic is not allowed" });
        console.log(decision);
      }else{
        return res.status(403).json({ error: "Access denied by security policy." });
      }
    } 
     if(decision.results.some(isSpoofedBot)){
      return res.status(403).json({ error: "Spoofed bot not allowed",
        message: "Malicious bot activity detected."
       });
     }
    next();
  } catch (error) {
    console.log("Arcjet error:", error);
    next();
  }
};