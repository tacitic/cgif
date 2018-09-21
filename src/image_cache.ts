interface CacheItem {
  [key: string]: HTMLImageElement
}

export class ImageCache {
  private data: CacheItem
  private paths: Array<string>
  private numLoaded: number
  private onImageLoadFn: ((idx: number, img: HTMLImageElement) => void) | null

  constructor(paths: Array<string>) {
    this.data = {}
    this.paths = paths;
    this.numLoaded = 0
    this.onImageLoadFn = null;
  }

  onImageLoad(fn: ((idx: number, img: HTMLImageElement) => void)): ImageCache {
    this.onImageLoadFn = fn
    return this
  }

  done(): boolean {
    return this.numLoaded >= this.paths.length
  }

  get(path: string): HTMLImageElement | null {
    return this.data[path] || null
  }

  getPath(n: number): string | null {
    return this.paths[n] || null
  }

  set(path: string, img: HTMLImageElement) {
    this.data[path] = img
  }

  getWith(path: string): Promise<HTMLImageElement> {
    const self = this
    
    return new Promise<HTMLImageElement>((res, rej) => {
      let image = self.get(path)
      
      // If an image is found in cache, return.
      if (image) {
        res(image)
        return
      }

      // Load a new image from disk.
      let newImage = new Image;
      newImage.onload = function () {
        console.debug('Image not in cache, loading: '+ path);
        self.set(path, newImage)
        res(newImage)
      }

      // Reject the promise on a error
      newImage.onerror = function () {
        rej('Unable to load image: ' + path)
      }

      // Set the src so loading can start.
      newImage.src = path
    })
  }  

  load(): Promise<CacheItem> {
    const self = this;
    return new Promise<CacheItem>((resolve, reject) => {
      self.paths.map((path: string) => {
        const img = new Image
        img.onload = function(){
          self.data[path] = img
          
          if (self.onImageLoadFn) {
            self.onImageLoadFn(self.numLoaded, img);
          }

          self.numLoaded++
          if (self.numLoaded >= self.paths.length) {
            resolve(self.data)
          }
        }
        img.onerror = () => reject('error loading image: '+ path)
        img.src = path
      })
    });
  }
}