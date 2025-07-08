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
        .filter(file => file.endsWith('.yaml') && file !== 'main.yaml');

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

    // Write merged file
    const mergedContent = yaml.dump(mainSwagger, {
        lineWidth: -1,
        noRefs: true
    });

    fs.writeFileSync(path.join(swaggerDir, 'merged-swagger.yaml'), mergedContent);
    console.log('Swagger files merged successfully!');

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

    // Serve raw YAML file
    app.get('/api-docs.yaml', (req, res) => {
        const yamlContent = fs.readFileSync(path.join(__dirname, 'merged-swagger.yaml'), 'utf8');
        res.setHeader('Content-Type', 'text/yaml');
        res.send(yamlContent);
    });
}

module.exports = { mergeSwaggerFiles, setupSwagger }; 