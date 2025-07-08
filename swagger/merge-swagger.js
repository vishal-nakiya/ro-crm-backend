const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Function to merge multiple YAML files
function mergeSwaggerFiles() {
    const swaggerDir = __dirname;
    const mainFile = path.join(swaggerDir, 'main.yaml');

    // Read main file
    const mainContent = fs.readFileSync(mainFile, 'utf8');
    const mainSwagger = yaml.load(mainContent);

    // Get all YAML files in the swagger directory
    const files = fs.readdirSync(swaggerDir)
        .filter(file => file.endsWith('.yaml') && file !== 'main.yaml' && file !== 'merged-swagger.yaml');

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
}

// Function to serve merged swagger in Express
function setupSwagger(app) {
    const swaggerUi = require('swagger-ui-express');
    const mergedSwagger = mergeSwaggerFiles();

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(mergedSwagger, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'RO CRM API Documentation'
    }));

    // Serve raw YAML file - generate on-the-fly instead of reading from disk
    app.get('/api-docs.yaml', (req, res) => {
        const mergedContent = yaml.dump(mergedSwagger, {
            lineWidth: -1,
            noRefs: true
        });
        res.setHeader('Content-Type', 'text/yaml');
        res.send(mergedContent);
    });
}

module.exports = { mergeSwaggerFiles, setupSwagger }; 