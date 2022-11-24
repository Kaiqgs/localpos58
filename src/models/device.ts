import {
  PrinterHealth,
  PrintResult,
  PrintStatus,
  PrintType,
} from "../../../localpos58ui/shared/models/printer.model";
import escpos, { Printer } from "escpos";

export class DeviceModel {
  private _device: escpos.Adapter | undefined;
  private _printer: Printer | undefined;
  health: PrinterHealth = PrinterHealth.unreachable;
  constructor() {}

  getConnectPrinter(): PrinterHealth {
    try {
      if (this._device === undefined || this._printer === undefined) {
        escpos.USB.findPrinter();
        this._device = new escpos.USB();
        this._printer = new Printer(this._device);
        this.health = PrinterHealth.healthy;
        console.log("Connected to printer...");
      }
      return this.health;
    } catch (exceptionVar) {
      this._device = undefined;
      this._printer = undefined;
      this.health = PrinterHealth.unresponsive;
      return this.health;
    }
  }

  printPath(path: string): Promise<PrintResult> {
    return new Promise<PrintResult>((resolve, reject) => {
      if (this.getConnectPrinter() == PrinterHealth.healthy) {
        escpos.Image.load(path, (image: Error | escpos.Image) => {
          try {
            this._device?.open(() => {
              const printer: any = this._printer;
              printer
                .align("ct")
                .font("b")
                .image(image, "s8")
                .then(() => {
                  printer.cut().close();
                  console.log(`Really printed ${path}`);
                  resolve({
                    status: "success",
                    type: PrintType.print,
                    health: this.health,
                  } as PrintResult);
                })
                .catch((error: Error) => {
                  console.log("Could not print")
                  reject({
                    status: PrintStatus.fail,
                    health: this.health,
                    exception: error,
                    type: PrintType.print,
                  } as PrintResult);
                });
            });
          } catch (error) {
            this._device = undefined;
            this._printer = undefined;
            reject({
              status: PrintStatus.fail,
              health: this.health,
              type: PrintType.print,
            } as PrintResult);
          }
        });
      } else {
        reject({
          health: this.health,
          status: PrintStatus.unresponsive,
          type: PrintType.print,
        } as PrintResult);
      }
    });
  }
}
