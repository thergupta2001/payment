import express from 'express';
import { validateUser } from './validators/userValidator';
import { createUser } from './services/createUser.service';

const router = express.Router();

router.post("/create", validateUser, createUser);

export default router;
