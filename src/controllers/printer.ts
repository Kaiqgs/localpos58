import { PrintResult, PrintStatus } from "../../../localpos58ui/shared/models/printer.model";
import { ThermalPrinterModel } from "../models/printer";
import { Request, Response, NextFunction } from "express";


const printerModel = new ThermalPrinterModel();

export function getHealth(req: Request, res: Response, next: NextFunction) {
  try {
    res.send(200).send(printerModel.health());
  } catch (error) {
    console.log(error);
    res.send();
  }
}

export function postPrint(req: Request, res: Response, next: NextFunction) {
  try {
    printerModel
      .print(req.body)
      .then((value) => {
        res.status(200).send(value);
      })
      .catch((reason) => {
        const code = reason?.status == PrintStatus.empty ? 400 : 503;
        res.status(code).send(reason);
      });
  } catch (error) {
    console.log(error);
    res.status(503).send({ status: PrintStatus.fail,  exception: error } as PrintResult);
  }
}
