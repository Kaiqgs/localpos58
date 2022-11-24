import { Express } from "express";
import * as printerController from "../controllers/printer";

export default (app: Express) => {
  app.get("/printer_health", printerController.getHealth);
  app.post("/print", printerController.postPrint);
};
