import { Request, Response, NextFunction } from 'express';
export declare function createIncident(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getIncidents(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getIncidentById(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateIncident(req: Request, res: Response, next: NextFunction): Promise<void>;
