const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Function to merge multiple YAML files
function mergeSwaggerFiles() {
    const swaggerDir = __dirname;
    const mainFile = path.join(swaggerDir, 'main.yaml');

    try {
        // Read main file
        const mainContent = fs.readFileSync(mainFile, 'utf8');
        const mainSwagger = yaml.load(mainContent);

        // Get all YAML files in the swagger directory
        const files = fs.readdirSync(swaggerDir)
            .filter(file => file.endsWith('.yaml') && file !== 'main.yaml' && file !== 'merged-swagger.yaml');

        console.log('Found YAML files to merge:', files);

        // Merge paths from all files
        files.forEach(file => {
            const filePath = path.join(swaggerDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const swagger = yaml.load(content);

            if (swagger.paths) {
                mainSwagger.paths = {
                    ...mainSwagger.paths,
                    ...swagger.paths
                };
                console.log(`Merged paths from ${file}`);
            }
        });

        // Generate merged content in memory
        const mergedContent = yaml.dump(mainSwagger, {
            lineWidth: -1,
            noRefs: true
        });

        // Try to write merged file, but don't fail if file system is read-only
        try {
            fs.writeFileSync(path.join(swaggerDir, 'merged-swagger.yaml'), mergedContent);
            console.log('Swagger files merged successfully!');
        } catch (error) {
            if (error.code === 'EROFS' || error.code === 'EACCES') {
                console.log('Swagger files merged in memory (read-only file system detected)');
            } else {
                console.error('Error writing merged swagger file:', error.message);
            }
        }

        return mainSwagger;
    } catch (error) {
        console.error('Error merging swagger files:', error.message);
        throw error;
    }
}

// Function to serve merged swagger in Express
function setupSwagger(app) {
    const swaggerUi = require('swagger-ui-express');

    try {
        const mergedSwagger = mergeSwaggerFiles();

        console.log('Setting up Swagger UI with merged specification');
        console.log('Number of paths in merged spec:', Object.keys(mergedSwagger.paths || {}).length);

        // Serve Swagger UI with better configuration for serverless
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(mergedSwagger, {
            explorer: true,
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: 'RO CRM API Documentation',
            swaggerOptions: {
                url: '/api-docs.yaml',
                docExpansion: 'list',
                filter: true,
                showRequestHeaders: true,
                tryItOutEnabled: true,
                requestInterceptor: (req) => {
                    // Add CORS headers for serverless environment
                    req.headers['Access-Control-Allow-Origin'] = '*';
                    return req;
                }
            },
            customJs: [
                'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js'
            ],
            customCssUrl: [
                'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css'
            ]
        }));

        // Serve raw YAML file - generate on-the-fly instead of reading from disk
        app.get('/api-docs.yaml', (req, res) => {
            try {
                const mergedContent = yaml.dump(mergedSwagger, {
                    lineWidth: -1,
                    noRefs: true
                });
                res.setHeader('Content-Type', 'text/yaml');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
                res.send(mergedContent);
            } catch (error) {
                console.error('Error serving YAML:', error.message);
                res.status(500).send('Error generating API documentation');
            }
        });

        // Add CORS headers for all API docs routes
        app.use('/api-docs', (req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            next();
        });

        console.log('Swagger UI setup completed successfully');
    } catch (error) {
        console.error('Error setting up Swagger:', error.message);
        // Fallback to basic swagger setup
        app.use('/api-docs', (req, res) => {
            res.status(500).json({
                error: 'Failed to load API documentation',
                message: error.message
            });
        });
    }
}

module.exports = { mergeSwaggerFiles, setupSwagger }; 