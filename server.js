const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 Conexión a MongoDB (se configurará después en Render)
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Mongo conectado"))
.catch(err => console.log(err));

// 📦 Modelo de usuario
const User = mongoose.model("User", {
  username: String,
  password: String,
  nivel: { type: Number, default: 1 },
  vidas: { type: Number, default: 5 },
  fechaRegistro: { type: Date, default: Date.now }
});

// 📝 Registro
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const user = new User({ username, password: hash });
  await user.save();

  res.json({ message: "Registrado" });
});

// 🔐 Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.json({ error: "No existe" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.json({ error: "Contraseña incorrecta" });

  res.json({
    message: "OK",
    user: user
  });
});

// 🆙 ACTUALIZAR NIVEL
app.post("/update-level", async (req, res) => {
  const { username, nivel } = req.body;

  try {
    await User.updateOne(
      { username: username },
      { $set: { nivel: nivel } }
    );

    res.json({ message: "Nivel actualizado" });
  } catch (e) {
    res.json({ error: "Error al guardar nivel" });
  }
});

app.listen(3000, () => console.log("Servidor listo"));
