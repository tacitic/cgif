var ImageCache = /** @class */ (function () {
    function ImageCache(paths) {
        this.data = {};
        this.paths = paths;
        this.numLoaded = 0;
        this.onImageLoadFn = null;
    }
    ImageCache.prototype.onImageLoad = function (fn) {
        this.onImageLoadFn = fn;
        return this;
    };
    ImageCache.prototype.done = function () {
        return this.numLoaded >= this.paths.length;
    };
    ImageCache.prototype.get = function (path) {
        return this.data[path] || null;
    };
    ImageCache.prototype.set = function (path, img) {
        this.data[path] = img;
    };
    ImageCache.prototype.getWith = function (path) {
        var self = this;
        return new Promise(function (res, rej) {
            var image = self.get(path);
            // If an image is found in cache, return.
            if (image) {
                res(image);
                return;
            }
            // Load a new image from disk.
            var newImage = new Image;
            newImage.onload = function () {
                console.debug('Image not in cache, loading: ' + path);
                self.set(path, newImage);
                res(newImage);
            };
            // Reject the promise on a error
            newImage.onerror = function () {
                rej('Unable to load image: ' + path);
            };
            // Set the src so loading can start.
            newImage.src = path;
        });
    };
    ImageCache.prototype.load = function () {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.paths.map(function (path) {
                var img = new Image;
                img.onload = function () {
                    self.data[path] = img;
                    if (self.onImageLoadFn) {
                        self.onImageLoadFn(self.numLoaded, img);
                    }
                    self.numLoaded++;
                    if (self.numLoaded >= self.paths.length) {
                        resolve(self.data);
                    }
                };
                img.onerror = function () { return reject('error loading image: ' + path); };
                img.src = path;
            });
        });
    };
    return ImageCache;
}());
export { ImageCache };
//# sourceMappingURL=image_cache.js.map