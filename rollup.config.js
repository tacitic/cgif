import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import { uglify } from "rollup-plugin-uglify";

export default {
  input: './src/cgif.ts',
  output: {
    file: './dist/bundle.min.js',
    format: 'iife',
    name: 'cgif'
  },
  plugins: [
    typescript(),
    resolve(),
    uglify(),
  ]
}