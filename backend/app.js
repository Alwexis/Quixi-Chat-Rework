import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { readFileSync } from 'fs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import admin from 'firebase-admin';
import DB from './db.js';

// Inicializar Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync('./credentials/quixichat-firebase-adminsdk-xdhsd-6d8d32cef5.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Crear aplicación Express
const app = express();
app.use(express.json());
app.use(cors({
  origin: '*', // Cambia según la URL de tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Ruta base del directorio
const __dirname = path.resolve();
const db = new DB();
db.connect();

// Configuración dinámica del almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = file.mimetype.split('/')[0]; // image, video, audio, etc.
    let folder = 'documents'; // Por defecto, documentos
    if (type === 'image') folder = 'images';
    if (type === 'video') folder = 'videos';
    if (type === 'audio') folder = 'audios';

    const dir = path.join(__dirname, 'uploads', folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${file.fieldname}${ext}`);
  },
});

// Configuración de Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Límite de 10 MB por archivo
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mp3|pdf|docx|txt/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.test(ext)) {
      return cb(new Error('Tipo de archivo no permitido.'));
    }
    cb(null, true);
  },
});

// Middleware para verificar autenticación mediante cookies
const checkAuth = async (req, res, next) => {
  const session = req.headers.authorization || '';
  const token = session.split(' ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send('No autorizado');
  }
};

// Login con Firebase y manejo de sesión
app.post('/auth/login', async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    // Crear cookie de sesión
    const sessionCookie = await admin.auth().createSessionCookie(idToken, {
      expiresIn: 60 * 60 * 24 * 5 * 1000, // 5 días
    });

    res.cookie('session', sessionCookie, {
      maxAge: 60 * 60 * 24 * 5 * 1000, // 5 días
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo en HTTPS en producción
    });

    // Registrar usuario en la base de datos si no existe
    const user = await db.get('Usuarios', `email = "${email}"`);
    if (!user[0]) {
      await db.insert('Usuarios', { email, username: decodedToken.name || '', profile_picture: decodedToken.picture || '' });
    }

    res.status(200).json({ message: 'Inicio de sesión exitoso' });
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'No se pudo autenticar' });
  }
});

// get User data
app.get('/auth/user', checkAuth, async (req, res) => {
  const email = req.query.email;
  const user = await db.get('Usuarios', `email = "${email}"`);
  return res.status(200).json(user[0]);
});

// Logout (Cierre de sesión)
app.post('/auth/logout', (req, res) => {
  res.clearCookie('session');
  res.status(200).json({ message: 'Sesión cerrada exitosamente' });
});

// Registro de usuario con avatar predeterminado
const __DEFAULT_PFP__ = ["Cyber_Peacock", "Frost_Walrus", "Jet_Stingray", "Magma_Dragoon", "Slash_Beast", "Split_Mushroom", "Storm_Owl", "Web_Spider", "X", "Zero"];
app.post('/auth/register', async (req, res) => {
  const { email, username } = req.body;
  const _randPfp = Math.floor(Math.random() * __DEFAULT_PFP__.length);
  const insertedUser = await db.insert('Usuarios', { email, username, profile_picture: `http://localhost:3000/uploads/${__DEFAULT_PFP__[_randPfp]}.webp` });
  res.status(200).json({ message: 'Usuario registrado exitosamente' });
});

// Endpoint para subir archivos (requiere autenticación)
app.post('/upload', checkAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo.' });
  }
  const filePath = `/uploads/${req.file.filename}`;
  res.json({ message: 'Archivo subido exitosamente.', path: filePath });
});

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));