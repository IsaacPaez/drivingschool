// Simple in-memory session cache
// sessionId: { ...datos de sesión temporal... }
const sessionCache = new Map<string, any>();
export default sessionCache; 