import {
  PrinterHealth,
  PrintData,
  PrintResult,
  PrintStatus,
  PrintType,
} from "../../../localpos58ui/shared/models/printer.model";
import { Orientation } from "../../../localpos58ui/shared/models/fixedaxis.model";
import {} from "../../../localpos58ui/shared/models/printer.model";
import { DeviceModel } from "./device";
import nodeHtmlToImage from "node-html-to-image";
import escpos from "escpos";
import USB from "escpos-usb";
import { MovingPath } from "./movingpath";
import * as fs from "fs";
import * as Jimp from "jimp";
import * as iq from "image-q";
import floydSteinberg from "floyd-steinberg";
import { PNG } from "pngjs";
(escpos as any).USB = USB;
const path = "./img/";
const ext = ".png";
const processOnce = true;

export class ThermalPrinterModel {
  printr: DeviceModel = new DeviceModel();
  private _emptyHash = [
    "18cc53dc64a95345b86b51eec7b2899047647a80",
    "bb7e70dc1429bcf89cacfed4669a5bf15bc355c5",
    "16aebda4ae974d3eac0ac8053b2490a4f9182fe9",
    "2f1ab4339d5a1c12c8f7b6b127ff113995f919b8",
  ];

  constructor() {}

  _hashExists(hpath: string) {
    const paths = fs.readdirSync(path);
    return paths.includes(hpath);
  }

  health(): PrinterHealth {
    return this.printr.getConnectPrinter();
  }

  print(printData: PrintData): Promise<PrintResult> {
    const hash = printData.htmlhash;
    const hashpath = path + hash + ext;
    console.log(printData.html);
    return new Promise<PrintResult>((resolve, reject) => {
      const health = this.printr.getConnectPrinter();

      if (!this._emptyHash.includes(hash) && health == PrinterHealth.healthy) {
        try {
          const _print = () => {
            if (printData.type == PrintType.print) {
              this.printr.printPath(hashpath).then(resolve).catch(reject);
            } else {
              console.log(`Fakely printed: ${hashpath}`);
              resolve({
                status: PrintStatus.success,
                type: PrintType.preview,
                health: health,
              } as PrintResult);
            }
          };

          if (!processOnce && this._hashExists(hash + ext)) {
            _print();
          } else {
            nodeHtmlToImage({
              html: printData.html,
              transparent: true,
            })
              .then((buffer) => {
                Jimp.read(buffer as Buffer)
                  .then((image) => {
                    const width = Math.floor(image.getWidth());
                    const height = Math.floor(image.getHeight());
                    if (printData.orientation == Orientation.landscape) {
                      console.log(`Rotated: width=${width}, height=${height}`);
                      image = image
                        .rotate(printData.direction * 90)
                        .resize(height, width);
                    }

                    if (printData.html.includes("<img")) {
                      image.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
                        const png = PNG.sync.read(buffer);
                        const npng = new PNG();
                        const result = floydSteinberg(png as any);
                        for (const key in result) {
                          (npng as any)[key] = result[key];
                        }

                        npng
                          .pack()
                          .pipe(fs.createWriteStream(hashpath))
                          .on("finish", _print);
                      });
                    } else {
                      console.log("Gray will do it");
                      image = image.grayscale();
                      image.writeAsync(hashpath).then(_print).catch(reject);
                    }

                  })
                  .catch((reason) => console.log(reason));
              })
              .catch((reason) => {
                reject({
                  status: PrintStatus.processingfail,
                  health,
                  exception: reason,
                } as PrintResult);
              });
          }
        } catch (error) {
          reject({
            status: PrintStatus.fail,
            health: health,
            exception: error,
          } as PrintResult);
        }
      } else {
        reject({
          status: PrintStatus.empty,
          health: health,
          type: printData.type,
        } as PrintResult);
      }
    });
  }
}
