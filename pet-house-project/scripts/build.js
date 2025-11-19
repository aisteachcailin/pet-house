import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Функция для рекурсивного копирования директорий
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Функция для копирования файлов по паттерну
function copyFiles(srcPattern, destDir) {
    const srcDir = path.dirname(srcPattern);
    const pattern = path.basename(srcPattern);
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));

    function walkDir(dir, baseDir = dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(baseDir, fullPath);

            if (entry.isDirectory()) {
                walkDir(fullPath, baseDir);
            } else if (regex.test(entry.name)) {
                const destPath = path.join(destDir, relativePath);
                const destDirPath = path.dirname(destPath);
                
                if (!fs.existsSync(destDirPath)) {
                    fs.mkdirSync(destDirPath, { recursive: true });
                }
                
                fs.copyFileSync(fullPath, destPath);
            }
        }
    }

    if (fs.existsSync(srcDir)) {
        walkDir(srcDir);
    }
}

// Функция для копирования index.html в корень с заменой путей
function copyIndexHtml() {
    const srcIndex = path.join(rootDir, 'src', 'index.html');
    const distIndex = path.join(distDir, 'index.html');
    
    if (fs.existsSync(srcIndex)) {
        let content = fs.readFileSync(srcIndex, 'utf8');
        
        // Заменяем пути для dist
        content = content.replace(/href="\.\/styles\/css\//g, 'href="./src/styles/css/');
        content = content.replace(/src="\.\/js\//g, 'src="./src/js/');
        content = content.replace(/\.\/components\//g, './src/components/');
        content = content.replace(/url\('\.\.\/public\//g, "url('/public/");
        
        fs.writeFileSync(distIndex, content, 'utf8');
        console.log('📄 index.html скопирован в корень dist с обновленными путями');
    }
}

// Очистка dist
const distDir = path.join(rootDir, 'dist');
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir, { recursive: true });

console.log('📦 Начинаем сборку...');

// Копируем index.html в корень
copyIndexHtml();

// Копируем JS файлы с заменой путей
console.log('📜 Копируем JS файлы...');
const jsSrcDir = path.join(rootDir, 'src', 'js');
const jsDestDir = path.join(distDir, 'src', 'js');

if (!fs.existsSync(jsDestDir)) {
    fs.mkdirSync(jsDestDir, { recursive: true });
}

function copyJsWithPathReplace(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath, { recursive: true });
            }
            copyJsWithPathReplace(srcPath, destPath);
        } else if (entry.name.endsWith('.js')) {
            let content = fs.readFileSync(srcPath, 'utf8');
            // Заменяем пути для dist
            content = content.replace(/\.\/components\//g, './src/components/');
            fs.writeFileSync(destPath, content, 'utf8');
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

copyJsWithPathReplace(jsSrcDir, jsDestDir);

// Копируем компоненты
console.log('🧩 Копируем компоненты...');
copyDir(path.join(rootDir, 'src', 'components'), path.join(distDir, 'src', 'components'));

// Копируем страницы
console.log('📑 Копируем страницы...');
copyDir(path.join(rootDir, 'src', 'pages'), path.join(distDir, 'src', 'pages'));

// Копируем CSS
console.log('🎨 Копируем CSS файлы...');
copyDir(path.join(rootDir, 'src', 'styles', 'css'), path.join(distDir, 'src', 'styles', 'css'));

// Копируем public (изображения)
console.log('🖼️  Копируем изображения...');
copyDir(path.join(rootDir, 'public'), path.join(distDir, 'public'));

console.log('✅ Сборка завершена!');
console.log(`📁 Файлы собраны в: ${distDir}`);

