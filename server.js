const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// --- RAHASIA (Diambil dari Setting Render nanti) ---
const BIN_ID = process.env.BIN_ID;
const API_KEY = process.env.API_KEY;
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

app.use(cors()); // Izinkan frontend mengakses
app.use(express.json());

// 1. GET: Satpam mengambil data untuk pengunjung
app.get("/api/units", async (req, res) => {
  try {
    const response = await axios.get(BASE_URL, {
      headers: { "X-Master-Key": API_KEY },
    });
    res.json(response.data.record);
  } catch (error) {
    res.status(500).json({ error: "Satpam gagal ambil data" });
  }
});

// 2. PATCH: Satpam update data (Hanya jika admin meminta)
app.patch("/api/units/:id", async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const idToUpdate = parseInt(req.params.id);

    // Ambil data lama
    const getResponse = await axios.get(BASE_URL, {
      headers: { "X-Master-Key": API_KEY },
    });
    let units = getResponse.data.record;

    // Edit
    const index = units.findIndex((u) => u.id === idToUpdate);
    if (index !== -1) {
      units[index].isAvailable = isAvailable;

      // Simpan balik
      await axios.put(BASE_URL, units, {
        headers: {
          "X-Master-Key": API_KEY,
          "Content-Type": "application/json",
        },
      });
      res.json(units[index]);
    } else {
      res.status(404).json({ message: "Unit tidak ketemu" });
    }
  } catch (error) {
    res.status(500).json({ error: "Gagal update" });
  }
});

app.listen(PORT, () => console.log(`Satpam siap di port ${PORT}`));
