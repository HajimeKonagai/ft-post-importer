const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

// mix.ts('ts_src/app.tsx', 'js')
mix.js('js_src/app.jsx', 'js')
    .react();
    // .sass('resources/sass/app.scss', 'public/css');
