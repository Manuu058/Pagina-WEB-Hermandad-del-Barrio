// Genera versiones .webp y reduce el peso de las imagenes pesadas del proyecto.
// Uso: npm run optimize-images
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..', 'assets', 'images');

async function resizeInPlacePng(file, maxSize) {
  const tmp = file + '.tmp';
  await sharp(file)
    .resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(tmp);
  fs.renameSync(tmp, file);
}

async function resizeInPlaceJpeg(file, maxSize) {
  const tmp = file + '.tmp';
  await sharp(file)
    .resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(tmp);
  fs.renameSync(tmp, file);
}

async function makeWebp(srcFile, destFile, maxWidth, quality) {
  await sharp(srcFile)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toFile(destFile);
}

async function run() {
  // Escudo: se usa como icono pequeno (40-220px), no necesita 7087x7087px.
  const escudo = path.join(root, 'escudo.png');
  await resizeInPlacePng(escudo, 600);
  await makeWebp(escudo, path.join(root, 'escudo.webp'), 600, 90);
  console.log('escudo.png optimizado +  escudo.webp generado');

  // Pasos procesionales (fotos grandes en la seccion Titulares).
  for (const name of ['paso-cristo', 'paso-virgen']) {
    const file = path.join(root, 'pasos', `${name}.png`);
    await resizeInPlacePng(file, 1400);
    await makeWebp(file, path.join(root, 'pasos', `${name}.webp`), 1400, 82);
    console.log(`${name}.png optimizado + ${name}.webp generado`);
  }

  // Fondo del reloj de cuenta atras: estaba a 6000x3684px para un elemento pequeno.
  const reloj = path.join(root, 'fondos', 'fondo-reloj.JPG');
  await resizeInPlaceJpeg(reloj, 1920);
  console.log('fondo-reloj.JPG optimizado');

  // Fondos de seccion (background-image vía CSS): se generan .webp como version
  // ligera; los .png originales se conservan sin tocar como copia de seguridad.
  const fondoPngs = [
    'fondo-agenda', 'fondo-historia', 'fondo-imagenes',
    'fondo-inicio', 'fondo-noticias', 'fondo-recorrido', 'unete-fondo',
  ];
  for (const name of fondoPngs) {
    const src = path.join(root, 'fondos', `${name}.png`);
    await makeWebp(src, path.join(root, 'fondos', `${name}.webp`), 1920, 78);
    console.log(`${name}.webp generado`);
  }

  // Fondo de enseres (background-image fija, sin redimensionar): solo .webp.
  const enseres = path.join(root, 'fondos', 'fondo-enseres.jpg');
  await makeWebp(enseres, path.join(root, 'fondos', 'fondo-enseres.webp'), 1920, 80);
  console.log('fondo-enseres.webp generado');

  // Retratos de los modales de titulares: panel de solo 320px de ancho,
  // las fuentes estaban a 1170-1200px. Se reducen y se genera .webp.
  for (const name of ['cristo_inicio', 'virgen_inicio']) {
    const file = path.join(root, `${name}.jpg`);
    await resizeInPlaceJpeg(file, 700);
    await makeWebp(file, path.join(root, `${name}.webp`), 700, 80);
    console.log(`${name}.jpg optimizado + ${name}.webp generado`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
