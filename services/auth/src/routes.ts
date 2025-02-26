import express from 'express';
import { validateUser } from './validators/userValidator';
import { createUser } from './services/create.service';
import { login } from './services/login.service';
import { validateLogin } from './validators/loginValidator';
import { deleteUser } from './services/delete.service';
import { validateUserId } from './validators/userIdValidator';
import { authMiddleware } from '@app/common';

const router = express.Router();

router.post("/create", validateUser, createUser);
router.post("/login", validateLogin, login);
router.delete("/delete/:id", validateUserId, authMiddleware, deleteUser);

export default router;
