import { writeFileSync } from 'node:fs';
import * as XLSX from 'xlsx';

const headers = [
  'N_EQUIPO',
  'FECHA_INSTALACION',
  'NOMBRE_LUGAR',
  'TIPO_INSTITUCION',
  'DIRECCION',
  'LOCALIDAD',
  'PROVINCIA',
  'MARCA',
  'MODELO',
  'N_SERIE',
  'HORARIO_ACCESO',
  'CONTACTO_NOMBRE',
  'CONTACTO_TELEFONO',
  'CONTACTO_EMAIL',
  'LATITUD',
  'LONGITUD',
  'PUBLICO_EN_MAPA',
  'OBSERVACIONES',
] as const;

const ejemplos = [
  {
    N_EQUIPO: 1,
    FECHA_INSTALACION: '08/08/2025',
    NOMBRE_LUGAR: 'Balompie',
    TIPO_INSTITUCION: 'Complejo deportivo',
    DIRECCION: 'Calle Ejemplo 123',
    LOCALIDAD: 'Olavarria',
    PROVINCIA: 'Buenos Aires',
    MARCA: 'Acorosmed',
    MODELO: 'A102',
    N_SERIE: 'RA2240240',
    HORARIO_ACCESO: 'Lun a Vie 8 a 22',
    CONTACTO_NOMBRE: 'Juan Perez',
    CONTACTO_TELEFONO: '2284 123456',
    CONTACTO_EMAIL: 'contacto@ejemplo.com',
    LATITUD: '',
    LONGITUD: '',
    PUBLICO_EN_MAPA: 'SI',
    OBSERVACIONES: 'Ejemplo — borrar o reemplazar',
  },
  {
    N_EQUIPO: 2,
    FECHA_INSTALACION: '19/02/2026',
    NOMBRE_LUGAR: 'Hospital Chavez',
    TIPO_INSTITUCION: 'Institucion sanitaria',
    DIRECCION: 'Av. San Martin 500',
    LOCALIDAD: 'Olavarria',
    PROVINCIA: 'Buenos Aires',
    MARCA: 'Acorosmed',
    MODELO: 'A102',
    N_SERIE: 'RA2250342',
    HORARIO_ACCESO: '24 hs',
    CONTACTO_NOMBRE: '',
    CONTACTO_TELEFONO: '',
    CONTACTO_EMAIL: '',
    LATITUD: '',
    LONGITUD: '',
    PUBLICO_EN_MAPA: 'SI',
    OBSERVACIONES: 'Ejemplo — borrar o reemplazar',
  },
];

const tipos = [
  {
    TIPO_INSTITUCION: 'Gimnasio',
    USO_EN_APP: 'Gimnasios',
    EJEMPLO: 'Gimnasio municipal, Smart Fit, etc.',
  },
  {
    TIPO_INSTITUCION: 'Escuela',
    USO_EN_APP: 'Escuelas',
    EJEMPLO: 'Escuelas, colegios, jardines',
  },
  {
    TIPO_INSTITUCION: 'Padel',
    USO_EN_APP: 'Padel',
    EJEMPLO: 'Clubes o centros de padel',
  },
  {
    TIPO_INSTITUCION: 'Complejo deportivo',
    USO_EN_APP: 'Complejos deportivos',
    EJEMPLO: 'Clubes de futbol, basket, polideportivos',
  },
  {
    TIPO_INSTITUCION: 'Empresa',
    USO_EN_APP: 'Empresas',
    EJEMPLO: 'Oficinas, cooperativas, industrias',
  },
  {
    TIPO_INSTITUCION: 'Institucion sanitaria',
    USO_EN_APP: 'Instituciones sanitarias',
    EJEMPLO: 'Hospital, clinica, consultorio, unidad sanitaria',
  },
  {
    TIPO_INSTITUCION: 'Otro',
    USO_EN_APP: 'Otros',
    EJEMPLO: 'Bomberos, municipalidad, particular, etc.',
  },
];

const instrucciones = [
  ['INSTRUCCIONES PARA COMPLETAR EL LISTADO DE DEAs'],
  [''],
  ['1. Completar una fila por cada DEA instalado.'],
  ['2. NO cambiar los nombres de las columnas de la hoja DEAs.'],
  ['3. TIPO_INSTITUCION es obligatorio. Usar SOLO valores de la hoja "Tipos permitidos".'],
  ['4. NOMBRE_LUGAR, DIRECCION, LOCALIDAD y PROVINCIA son obligatorios para el mapa.'],
  ['5. N_SERIE debe ser unico (no repetir).'],
  ['6. LATITUD y LONGITUD son opcionales. Si faltan, se ubican con la direccion.'],
  ['7. PUBLICO_EN_MAPA: poner SI o NO.'],
  ['8. Borrar las filas de ejemplo antes de devolver el archivo.'],
  [''],
  ['La columna clave para el filtro de la app es TIPO_INSTITUCION.'],
];

const wb = XLSX.utils.book_new();

const hojaInfo = XLSX.utils.aoa_to_sheet(instrucciones);
hojaInfo['!cols'] = [{ wch: 100 }];
XLSX.utils.book_append_sheet(wb, hojaInfo, 'Instrucciones');

const hojaDeas = XLSX.utils.json_to_sheet(ejemplos, { header: [...headers] });
hojaDeas['!cols'] = headers.map((h) => ({ wch: Math.max(14, h.length + 2) }));
XLSX.utils.book_append_sheet(wb, hojaDeas, 'DEAs');

const hojaTipos = XLSX.utils.json_to_sheet(tipos);
hojaTipos['!cols'] = [{ wch: 24 }, { wch: 24 }, { wch: 52 }];
XLSX.utils.book_append_sheet(wb, hojaTipos, 'Tipos permitidos');

const outPath = 'data/plantilla_deas_cliente.xlsx';
writeFileSync(outPath, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
console.log(`Creado: ${outPath}`);
