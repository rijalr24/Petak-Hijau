const axios = require("axios");

// Mengambil kunci rahasia dari Netlify Environment
const BIN_ID = process.env.BIN_ID;
const API_KEY = process.env.API_KEY;
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

exports.handler = async function (event, context) {
  // 1. Handle Method GET (Ambil Data)
  if (event.httpMethod === "GET") {
    try {
      const response = await axios.get(BASE_URL, {
        headers: { "X-Master-Key": API_KEY },
      });
      return {
        statusCode: 200,
        body: JSON.stringify(response.data.record),
      };
    } catch (error) {
      return { statusCode: 500, body: "Gagal ambil data" };
    }
  }

  // 2. Handle Method PATCH (Update Data)
  if (event.httpMethod === "PATCH") {
    try {
      // Di Netlify, body request harus di-parse dulu dari string
      const body = JSON.parse(event.body);
      const isAvailable = body.isAvailable;

      // Ambil ID dari URL (misal: /api/units/1)
      // Netlify menaruh path di event.path. Kita potong stringnya.
      const pathParts = event.path.split("/");
      const idToUpdate = parseInt(pathParts[pathParts.length - 1]);

      if (isNaN(idToUpdate)) {
        return { statusCode: 400, body: "ID Invalid" };
      }

      // A. Ambil data lama
      const getResponse = await axios.get(BASE_URL, {
        headers: { "X-Master-Key": API_KEY },
      });
      let units = getResponse.data.record;

      // B. Cari & Update
      const index = units.findIndex((u) => u.id === idToUpdate);
      if (index !== -1) {
        units[index].isAvailable = isAvailable;

        // C. Simpan ke JSONBin
        await axios.put(BASE_URL, units, {
          headers: {
            "X-Master-Key": API_KEY,
            "Content-Type": "application/json",
          },
        });
        return { statusCode: 200, body: JSON.stringify(units[index]) };
      } else {
        return { statusCode: 404, body: "Unit tidak ditemukan" };
      }
    } catch (error) {
      console.error(error);
      return { statusCode: 500, body: "Gagal update data" };
    }
  }

  // Jika method bukan GET atau PATCH
  return { statusCode: 405, body: "Method Not Allowed" };
};
