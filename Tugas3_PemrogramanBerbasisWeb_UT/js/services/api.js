// Data Service - Handles data fetching from JSON
const DataService = {
  // Fetch data from JSON file
  async fetchData() {
    try {
      const response = await fetch("data/dataBahanAjar.json");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      console.log("Data berhasil dimuat dari JSON:", data);
      return data;
    } catch (error) {
      console.error("Error loading data:", error);
      // Return default data if fetch fails
      return this.getDefaultData();
    }
  },

  // Default data if JSON fetch fails
  getDefaultData() {
    return {
      upbjjList: ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"],
      kategoriList: ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"],
      pengirimanList: [
        { kode: "REG", nama: "Reguler (3-5 hari)" },
        { kode: "EXP", nama: "Ekspres (1-2 hari)" },
      ],
      paket: [
        {
          kode: "PAKET-UT-001",
          nama: "PAKET IPS Dasar",
          isi: ["EKMA4116", "EKMA4115"],
          harga: 120000,
        },
        {
          kode: "PAKET-UT-002",
          nama: "PAKET IPA Dasar",
          isi: ["BIOL4201", "FISIP4001"],
          harga: 140000,
        },
      ],
      stok: [
        {
          kode: "EKMA4116",
          judul: "Pengantar Manajemen",
          kategori: "MK Wajib",
          upbjj: "Jakarta",
          lokasiRak: "R1-A3",
          harga: 65000,
          qty: 28,
          safety: 20,
          catatanHTML: "<em>Edisi 2024, cetak ulang</em>",
        },
      ],
      tracking: {},
    };
  },
};
