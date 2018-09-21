import { TweenMax, Linear } from 'gsap';
import { range } from 'ramda';
import { ImageCache } from './image_cache';
// CGif a Canvas GIF
var CGif = /** @class */ (function () {
    function CGif(elem, seq, opts, preload) {
        if (preload === void 0) { preload = true; }
        this.elem = elem;
        this.seq = seq;
        this.opts = opts;
        this.preload = preload;
        if (preload) {
            // Create a image cache. This will be used for preloading and caching.
            var images = (seq instanceof Array) ? seq : range(1, this.numFrames() + 1).map(seq);
            this.cache = new ImageCache(images);
            // Display the first image as soon as it loads.
            this.cache.onImageLoad(function (i, img) {
                var ctx = elem.getContext('2d');
                if (i === 0 && ctx !== null) {
                    console.log('frame one');
                    draw(ctx, img, 0, 0, elem.width, elem.height);
                }
            });
        }
        else {
            // No preloading means empty cache.
            this.cache = new ImageCache([]);
        }
        this.tween = this.createTween();
    }
    // Play resumes the cgif.
    CGif.prototype.play = function () {
        var self = this;
        if (self.preload && !self.cache.done()) {
            self.cache.load().then(function (_) {
                self.tween.play();
            });
        }
        else {
            self.tween.play();
        }
    };
    // Pause pauses the cgif
    CGif.prototype.pause = function () {
        this.tween.pause();
    };
    // Returns the number of frames. This can either be the length of sequence
    // array or the supplied number of frames in the animation options.
    CGif.prototype.numFrames = function () {
        return (this.seq instanceof Array) ? this.seq.length - 1 : this.opts.frames;
    };
    // Creates the TweenMax object with the supplied animation options.
    CGif.prototype.createTween = function () {
        var self = this;
        var ctx = self.elem.getContext('2d');
        var obj = { curImg: 0 };
        return TweenMax.to(obj, self.opts.duration, {
            curImg: self.numFrames(),
            roundProps: 'curImg',
            repeat: self.opts.repeat || -1,
            immediateRender: false,
            yoyo: self.opts.yoyo,
            ease: Linear.easeNone,
            paused: true,
            // called when the tween updates.
            onUpdate: function () {
                var path = getPath(self.seq, obj.curImg);
                self.cache.getWith(path).then(function (image) {
                    if (ctx !== null) {
                        draw(ctx, image, 0, 0, self.elem.width, self.elem.height);
                    }
                });
            }
        });
    };
    return CGif;
}());
export { CGif };
// Returns a path from a Sequence. This can be the index of a sequence array
// or the product of calling sequence as a function.
function getPath(seq, frame) {
    if (seq instanceof Array) {
        return seq[frame];
    }
    return seq(frame);
}
// Draw an image on the Canvas, first clear the frame.
function draw(ctx, img, x, y, w, h) {
    ctx.clearRect(x, y, w, h);
    ctx.drawImage(img, x, y, w, h);
}
//# sourceMappingURL=cgif.js.map