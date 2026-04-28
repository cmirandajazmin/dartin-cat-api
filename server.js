const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ Mongo conectado"))
.catch(err => console.log("❌ Error Mongo:", err));

// 📦 Modelo de usuario
const User = mongoose.model("User", {
  username: String,
  password: String,
  nivel: { type: Number, default: 1 },
  vidas: { type: Number, default: 5 },
  fechaRegistro: { type: Date, default: Date.now }
});

const Recurso = mongoose.model("Recurso", {
  nombre: String,
  imagen_base64: String
}, "Recursos"); 

// 📝 REGISTRO
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existe = await User.findOne({ username });
    if (existe) {
      return res.json({ error: "Usuario ya existe" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hash
    });

    await user.save();

    res.json({ message: "Registrado" });

  } catch (e) {
    res.status(500).json({ error: "Error en registro" });
  }
});

// 🔐 LOGIN
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ error: "No existe" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.json({ error: "Contraseña incorrecta" });
    }

    res.json({
      message: "OK",
      user: user
    });

  } catch (e) {
    res.status(500).json({ error: "Error en login" });
  }
});

// 🆙 ACTUALIZAR NIVEL
app.post("/update-level", async (req, res) => {
  try {
    const { username, nivel } = req.body;

    await User.updateOne(
      { username: username },
      { $set: { nivel: nivel } }
    );

    res.json({ message: "Nivel actualizado" });

  } catch (e) {
    res.status(500).json({ error: "Error al guardar nivel" });
  }
});

// ❤️ OPCIONAL: actualizar vidas
app.post("/update-vidas", async (req, res) => {
  try {
    const { username, vidas } = req.body;

    await User.updateOne(
      { username: username },
      { $set: { vidas: vidas } }
    );

    res.json({ message: "Vidas actualizadas" });

  } catch (e) {
    res.status(500).json({ error: "Error al guardar vidas" });
  }
});

// 🖼️ OBTENER IMAGEN (FIX IMPORTANTE AQUÍ)
app.get("/get-image/:nombre", async (req, res) => {
  try {
    const data = await Recurso.findOne({ nombre: req.params.nombre });

    console.log("🔍 Buscando:", req.params.nombre);

    const data = await col.findOne({ nombre: req.params.nombre });

    if (!data) {
      console.log("❌ No encontrado");
      return res.status(404).json({ error: "No encontrado" });
    }

    console.log("✅ Encontrado:", data.nombre);

    res.json(data);

  } catch (e) {
    console.log("🔥 Error:", e);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// 🚀 SERVIDOR
app.listen(3000, () => {
  console.log("🚀 Servidor listo en puerto 3000");
});
