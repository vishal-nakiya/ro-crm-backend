# Swagger Documentation Structure

This directory contains modular Swagger documentation files for the RO CRM API.

## Structure

```
swagger/
├── main.yaml              # Main configuration with schemas and security
├── customer.yaml          # Customer routes documentation
├── bill.yaml             # Bill routes documentation
├── service.yaml          # Service routes documentation
├── task.yaml             # Task routes documentation
├── technician.yaml       # Technician routes documentation
├── login.yaml            # Login routes documentation
├── merge-swagger.js      # Utility to merge all files
└── README.md             # This file
```

## Benefits of This Approach

### ✅ **Clean Code Files**
- Route files are clean and focused on logic
- No JSDoc comments cluttering the code
- Easier to read and maintain

### ✅ **Modular Documentation**
- Each route group has its own file
- Easy to manage and update specific sections
- Better organization for large APIs

### ✅ **Separation of Concerns**
- Documentation is separate from code
- Can be edited by non-developers
- Better version control for documentation

### ✅ **Scalability**
- Easy to add new route groups
- Can have different people work on different sections
- Better for team collaboration

## How It Works

1. **Main Configuration** (`main.yaml`)
   - Contains common schemas (Customer, Bill, etc.)
   - Defines security schemes
   - Sets up basic API info

2. **Route-Specific Files** (e.g., `customer.yaml`)
   - Contains only the paths for that route group
   - References schemas from main file
   - Focused and concise

3. **Merger Utility** (`merge-swagger.js`)
   - Combines all files into one complete documentation
   - Serves the merged documentation via Express
   - Handles file watching and updates

## Usage

### Adding New Routes

1. Create a new YAML file for your route group (e.g., `product.yaml`)
2. Add your paths to the file
3. The merger will automatically include it

### Updating Documentation

1. Edit the specific YAML file for your route group
2. The changes will be reflected immediately when the server restarts

### Accessing Documentation

- **Swagger UI**: `http://localhost:5000/api-docs`
- **Raw YAML**: `http://localhost:5000/api-docs.yaml`

## Example: Adding a New Route Group

```yaml
# swagger/product.yaml
paths:
  /product/create:
    post:
      summary: Create a new product
      tags: [Products]
      # ... rest of documentation
```

The merger will automatically pick up this file and include it in the final documentation.

## Migration from JSDoc Comments

To migrate from JSDoc comments:

1. Remove all `@swagger` comments from route files
2. Create corresponding YAML files for each route group
3. Update the Express app to use the new merger utility
4. Test the documentation at `/api-docs`

## Dependencies

- `js-yaml`: For parsing YAML files
- `swagger-ui-express`: For serving the documentation
- `swagger-jsdoc`: Still available for JSDoc approach if needed 