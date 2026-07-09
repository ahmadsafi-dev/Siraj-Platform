import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    res.status(401).json({ error: "غير مصرح لك بالوصول" });
    return;
  }
  next();
}

export function requireRole(role: "student" | "volunteer") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session?.userId) {
      res.status(401).json({ error: "غير مصرح لك بالوصول" });
      return;
    }
    if (req.session.userRole !== role) {
      res.status(403).json({ error: "ليس لديك صلاحية الوصول" });
      return;
    }
    next();
  };
}
