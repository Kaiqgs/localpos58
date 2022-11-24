import { Express } from "express";
import PrinterRoute from "./printer";

export default (app: Express) => {
  PrinterRoute(app);
};
