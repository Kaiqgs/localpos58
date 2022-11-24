import { isNodePattern } from '@jimp/utils';

/**
 * Inverts the image
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
export default () => ({
  dither(cb:any) {

    
    
    if (isNodePattern(cb)) {
      cb.call(this, null, this);
    }

    return this;
  }
});
