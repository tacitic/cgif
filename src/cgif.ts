import { TweenMax, Linear } from 'gsap';
import { range } from 'ramda';

import { ImageCache } from './image_cache'

// A Sequence can consist of an array of filepaths or 
// be a function producing a path for a frame number.
type Sequence = Array<string> | ((i: Number) => string)

// Options for the tween animation.
type AnimationOptions = {
  duration: number,
  frames: number,
  repeat: number,
  yoyo: boolean,
}

// CGif a Canvas GIF
export class CGif {
  elem: HTMLCanvasElement
  seq: Sequence
  opts: AnimationOptions
  preload: boolean
  private cache: ImageCache
  private tween: TweenMax

  constructor(elem: HTMLCanvasElement, seq: Sequence, opts: AnimationOptions, preload: boolean = true) {
    this.elem = elem
    this.seq = seq
    this.opts = opts
    this.preload = preload

    if (preload) {
      // Create a image cache. This will be used for preloading and caching.
      const images = (seq instanceof Array) ? seq : range(1, this.numFrames()+1).map(seq)
      this.cache = new ImageCache(images)
      
      // Display the first image as soon as it loads.
      this.cache.onImageLoad((i, img) => {
        let ctx = elem.getContext('2d');
        if (i === 0 && ctx !== null) {
          draw(ctx, img, 0, 0, elem.width, elem.height)
        }
      })
    } else {
      // No preloading means empty cache.
      this.cache = new ImageCache([])
    }
    this.tween = this.createTween()
  }

  // Play resumes the cgif.
  play(): void {
    const self = this;
    if (self.preload && !self.cache.done()) {
      self.cache.load().then((_) => {
        self.tween.play()
      })
    } else {
      self.tween.play();
    }
  }

  // Pause pauses the cgif
  pause(): void {
    this.tween.pause()
  }

  // Returns the number of frames. This can either be the length of sequence
  // array or the supplied number of frames in the animation options.
  private numFrames(): number {
    return (this.seq instanceof Array) ? this.seq.length - 1 : this.opts.frames
  }

  // Creates the TweenMax object with the supplied animation options.
  private createTween(): TweenMax {
    const self = this
    const ctx = self.elem.getContext('2d')
    let obj = {curImg: 0}
    
    return TweenMax.to(obj, self.opts.duration, {
      curImg: self.numFrames(),
      roundProps: 'curImg',
      repeat: self.opts.repeat || -1,
      immediateRender: false,
      yoyo: self.opts.yoyo,
      ease: Linear.easeNone,
      paused: true,
      
      // called when the tween updates.
      onUpdate: function() {
        const path = getPath(self.seq, obj.curImg)
        self.cache.getWith(path).then(image => {
          if (ctx !== null) {
            draw(ctx, image, 0, 0, self.elem.width, self.elem.height)
          }
        })
      }
    })
  }
}

// Returns a path from a Sequence. This can be the index of a sequence array
// or the product of calling sequence as a function.
function getPath(seq: Sequence, frame: number): string {
  if (seq instanceof Array) {
    return seq[frame]
  }

  return seq(frame)
}

// Draw an image on the Canvas, first clear the frame.
function draw(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h:number) {
  ctx.clearRect(x, y, w, h)
  ctx.drawImage(img, x, y, w, h)
}