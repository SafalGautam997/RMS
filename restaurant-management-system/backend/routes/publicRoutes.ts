import express from "express";
import {
  getPublicMenu,
  postPublicOrder,
} from "../controllers/publicController.js";

export const publicRoutes = express.Router();

publicRoutes.get("/menu", getPublicMenu);
publicRoutes.post("/orders", postPublicOrder);
