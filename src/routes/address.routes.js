import express from "express";
import {
  createAddress,
  getAddresses,
  getAddress,
  updateAddress,
  deleteAddress
} from "../controllers/address.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { addressValidator } from "../validators/address.validator.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", addressValidator, validate, createAddress);
router.get("/", getAddresses);
router.get("/:id", getAddress);
router.put("/:id", addressValidator, validate, updateAddress);
router.delete("/:id", deleteAddress);

export default router;
