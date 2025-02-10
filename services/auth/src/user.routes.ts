import express from 'express';
import { validateUser } from './validators/userValidator';
import { createUser } from './services/create.service';
import { login } from './services/login.service';
import { validateLogin } from './validators/loginValidator';

const router = express.Router();

router.post("/create", validateUser, createUser);
router.post("/login", validateLogin, login);

export default router;
