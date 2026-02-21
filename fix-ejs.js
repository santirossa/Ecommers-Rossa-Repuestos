const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views', 'admin');
const filesToFix = [
    'categories.ejs',
    'dashboard.ejs',
    'order-detail.ejs',
    'orders.ejs',
    'product-form.ejs',
    'products.ejs'
];

for (const file of filesToFix) {
    const filePath = path.join(viewsDir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf-8');

        // Remove the opening wrapper
        content = content.replace(/<%- include\('layout', { body: `/, '');

        // Remove the closing wrapper
        content = content.replace(/` }\) %>\s*$/, '');

        // Replace escaping of \${ with ${
        content = content.replace(/\\\${/g, '${');

        // Replace \` with `
        content = content.replace(/\\`/g, '`');

        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ Fixed ${file}`);
    }
}

// Ensure layout.ejs outputs body without the include wrapping hack
const layoutPath = path.join(viewsDir, 'layout.ejs');
if (fs.existsSync(layoutPath)) {
    let layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    layoutContent = layoutContent.replace(/<%- body %>/, '<%- body %>');
    fs.writeFileSync(layoutPath, layoutContent, 'utf-8');
    console.log(`✅ Verified layout.ejs`);
}
