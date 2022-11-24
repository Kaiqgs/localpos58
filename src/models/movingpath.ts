export class MovingPath {
  private _names: Array<string> = [];
  get name() {
    return this._names[this._names.length - 1];
  }
  get namext() {
    return this.name + this.ext;
  }

  constructor(
    firstname: string,
    public ext: string = ".png",
    public maxlen: number = 15
  ) {
    this.onUpdate(firstname);
  }

  onUpdate(name: string) {
    this._names.push(name);
    if (this._names.length > this.maxlen) this._names.pop();
  }
}
