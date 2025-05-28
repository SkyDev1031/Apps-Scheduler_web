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

mix
    .js('resources/js/auth.js', 'public/js')
    .js('resources/js/user.js', 'public/js')
    .js('resources/js/admin.js', 'public/js')
    .react()
    .sass('resources/sass/app.scss', 'public/css')
    .options({
        hmrOptions: {
            host: '0.0.0.0', // Allow connections from all network interfaces
            port: 8080
        }
    })
    .browserSync({
        proxy: 'http://127.0.0.1:8000', // Laravel app URL
        host: '0.0.0.0', // Allow connections from all network interfaces
        open: false,
        watchOptions: {
            usePolling: true, // Use polling for file changes
            interval: 1000 // Set polling interval
        },
        files: [
            'public/**/*',
            'resources/views/**/*.php',
            'resources/js/**/*.js',
            'resources/sass/**/*.scss'
        ]
    });
