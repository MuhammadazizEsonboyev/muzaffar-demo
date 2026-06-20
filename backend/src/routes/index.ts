import { Router } from 'express';
import * as c from '../controllers/index.js';

const r = Router();

r.get('/dashboard', c.dashboard);

r.get('/pumps', c.listPumps);
r.get('/pumps/:id', c.getPump);

r.get('/readings', c.listReadings);
r.post('/readings', c.postReading);

r.get('/alerts', c.listAlerts);
r.patch('/alerts/:id', c.updateAlert);

r.get('/maintenance', c.listMaintenance);
r.post('/maintenance', c.createMaintenance);
r.patch('/maintenance/:id', c.updateMaintenance);

r.get('/inventory', c.listInventory);
r.patch('/inventory/:id', c.updateInventory);

export default r;
