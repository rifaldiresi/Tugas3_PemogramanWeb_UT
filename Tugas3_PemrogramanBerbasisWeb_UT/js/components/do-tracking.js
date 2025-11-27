// DO Tracking Component
Vue.component("do-tracking", {
  template: `
    <div>
      <h2>🚚 Tracking Delivery Order</h2>
      
      <!-- Search Box -->
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery"
          @keydown.enter="performSearch"
          @keydown.esc="clearSearch"
          placeholder="🔍 Cari berdasarkan Nomor DO atau NIM (Enter: cari, Esc: reset)">
      </div>
      
      <!-- Create DO Form -->
      <div class="form-container">
        <h3>📝 Buat Delivery Order Baru</h3>
        <form @submit.prevent="createDO" @keydown.enter.prevent="createDO" @keydown.esc.prevent="resetForm">
          <div class="form-group">
            <label>Nomor DO:</label>
            <input type="text" v-model="generatedDoNumber" readonly 
                   style="background: #e9ecef; font-weight: bold; color: #667eea;">
          </div>
          
          <div class="form-group">
            <label>NIM: *</label>
            <input type="text" v-model="newDO.nim" required 
                   placeholder="Masukkan NIM mahasiswa (9 digit angka)">
            <span class="error" v-if="errors.nim">{{ errors.nim }}</span>
          </div>
          
          <div class="form-group">
            <label>Nama Mahasiswa: *</label>
            <input type="text" v-model="newDO.nama" required
                   placeholder="Masukkan nama lengkap">
            <span class="error" v-if="errors.nama">{{ errors.nama }}</span>
          </div>
          
          <div class="form-group">
            <label>Pilih Ekspedisi: *</label>
            <select v-model="newDO.ekspedisi" required>
              <option value="">-- Pilih Ekspedisi --</option>
              <option v-for="eks in pengirimanList" :key="eks.kode" :value="eks.kode">
                JNE {{ eks.nama }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Pilih Paket Bahan Ajar: *</label>
            <select v-model="selectedPaket" required>
              <option value="">-- Pilih Paket --</option>
              <option v-for="paket in paketList" :key="paket.kode" :value="paket.kode">
                {{ paket.kode }} - {{ paket.nama }}
              </option>
            </select>
          </div>
          
          <!-- Package Details -->
          <div class="package-details" v-if="selectedPaketDetail">
            <h4>📦 Detail Isi Paket</h4>
            <p><strong>Kode Paket:</strong> {{ selectedPaketDetail.kode }}</p>
            <p><strong>Nama Paket:</strong> {{ selectedPaketDetail.nama }}</p>
            <p><strong>Isi Paket:</strong></p>
            <ul>
              <li v-for="kode in selectedPaketDetail.isi" :key="kode">
                {{ kode }} - {{ getMataKuliahName(kode) }}
              </li>
            </ul>
            <p><strong>Total Harga:</strong> 
              <span style="color: #667eea; font-size: 1.2em; font-weight: bold;">
                {{ selectedPaketDetail.harga | currency }}
              </span>
            </p>
          </div>
          
          <div class="form-group">
            <label>Tanggal Kirim: *</label>
            <input type="date" v-model="newDO.tanggalKirim" required>
          </div>
          
          <div class="form-group">
            <label>Total Harga:</label>
            <input type="text" :value="totalHarga | currency" readonly
                   style="background: #e9ecef; font-weight: bold; color: #28a745;">
          </div>
          
          <div style="margin-top: 20px;">
            <button type="submit" class="btn btn-primary">🚀 Buat Delivery Order</button>
            <button type="button" class="btn btn-secondary" @click="resetForm">Reset Form</button>
            <small style="color: #666; margin-left: 10px;">
              💡 Tips: Tekan Enter untuk simpan, Esc untuk reset
            </small>
          </div>
        </form>
      </div>
      
      <!-- DO List -->
      <div style="margin-top: 40px;">
        <h3>📋 Daftar Delivery Order</h3>
        <p style="color: #666; margin-bottom: 20px;">
          <strong>Total DO:</strong> {{ filteredTracking.length }} pengiriman
          <span v-if="searchQuery" style="margin-left: 15px;">
            (Hasil pencarian: "{{ searchQuery }}")
          </span>
        </p>
        
        <div v-if="filteredTracking.length > 0">
          <div v-for="item in filteredTracking" :key="item.noDO" class="do-card">
            <div class="do-header">
              <div>
                <div class="do-number">{{ item.noDO }}</div>
                <p><strong>NIM:</strong> {{ item.data.nim }}</p>
                <p><strong>Nama:</strong> {{ item.data.nama }}</p>
                <p><strong>Paket:</strong> {{ item.data.paket }}</p>
                <p><strong>Total:</strong> {{ item.data.total | currency }}</p>
                <p><strong>Tanggal Kirim:</strong> {{ item.data.tanggalKirim | formatDate }}</p>
              </div>
              <div style="text-align: right;">
                <div :class="['status-badge', 'status-' + getStatusClass(item.data.status)]">
                  {{ item.data.status }}
                </div>
                <p style="margin-top: 10px; color: #666;">
                  <small>{{ item.data.ekspedisi }}</small>
                </p>
              </div>
            </div>
            
            <!-- Timeline -->
            <div v-if="item.data.perjalanan && item.data.perjalanan.length > 0" 
                 style="background: white; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <h5 style="color: #667eea; margin-bottom: 15px;">🗺️ Riwayat Perjalanan</h5>
              <div class="timeline">
                <div v-for="(step, idx) in item.data.perjalanan" :key="idx" class="timeline-item">
                  <div class="timeline-time">{{ step.waktu }}</div>
                  <div>{{ step.keterangan }}</div>
                </div>
              </div>
              
              <!-- Add Progress Form -->
              <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <h6 style="color: #667eea; margin-bottom: 10px;">➕ Tambah Progress Baru</h6>
                <div style="display: flex; gap: 10px; align-items: end;">
                  <div style="flex: 1;">
                    <input 
                      type="text" 
                      v-model="progressInput[item.noDO]"
                      @keydown.enter="addProgress(item.noDO)"
                      placeholder="Masukkan keterangan progress (tekan Enter)"
                      style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                  </div>
                  <button 
                    class="btn btn-primary btn-small"
                    @click="addProgress(item.noDO)">
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else style="text-align: center; padding: 60px; color: #999;">
          <div style="font-size: 3em; margin-bottom: 20px;">📦</div>
          <p v-if="searchQuery">Tidak ditemukan DO dengan kata kunci "{{ searchQuery }}"</p>
          <p v-else>Belum ada delivery order yang dibuat.</p>
          <p>Silakan buat DO baru menggunakan form di atas.</p>
        </div>
      </div>
    </div>
  `,

  props: {
    trackingData: {
      type: Object,
      required: true,
    },
    paketList: {
      type: Array,
      required: true,
    },
    pengirimanList: {
      type: Array,
      required: true,
    },
    stokData: {
      type: Array,
      required: true,
    },
  },

  data() {
    return {
      searchQuery: "",
      newDO: {
        nim: "",
        nama: "",
        ekspedisi: "",
        tanggalKirim: "",
      },
      selectedPaket: "",
      errors: {},
      doCounter: 3,
      progressInput: {},
    };
  },

  computed: {
    generatedDoNumber() {
      const year = new Date().getFullYear();
      const sequence = String(this.doCounter).padStart(4, "0");
      return `DO${year}-${sequence}`;
    },

    selectedPaketDetail() {
      if (!this.selectedPaket) return null;
      return this.paketList.find((p) => p.kode === this.selectedPaket);
    },

    totalHarga() {
      return this.selectedPaketDetail ? this.selectedPaketDetail.harga : 0;
    },

    filteredTracking() {
      const trackingArray = Object.keys(this.trackingData).map((noDO) => ({
        noDO: noDO,
        data: this.trackingData[noDO],
      }));

      if (!this.searchQuery) {
        return trackingArray;
      }

      const query = this.searchQuery.toLowerCase();
      return trackingArray.filter(
        (item) =>
          item.noDO.toLowerCase().includes(query) ||
          item.data.nim.includes(query)
      );
    },
  },

  watch: {
    selectedPaket(newVal) {
      if (newVal) {
        const paket = this.paketList.find((p) => p.kode === newVal);
        console.log(`Paket dipilih: ${paket.nama} - Rp ${paket.harga}`);
      }
    },

    "newDO.ekspedisi"(newVal) {
      if (newVal) {
        const eks = this.pengirimanList.find((e) => e.kode === newVal);
        console.log(`Ekspedisi dipilih: JNE ${eks.nama}`);
      }
    },
  },

  methods: {
    getTodayDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    getMataKuliahName(kode) {
      const mk = this.stokData.find((s) => s.kode === kode);
      return mk ? mk.judul : "Tidak ditemukan";
    },

    getStatusClass(status) {
      if (status === "Terkirim") return "aman";
      if (status === "Dalam Perjalanan") return "menipis";
      return "kosong";
    },

    performSearch() {
      console.log("Pencarian:", this.searchQuery);
    },

    clearSearch() {
      this.searchQuery = "";
      console.log("Pencarian direset");
    },

    validateForm() {
      this.errors = {};
      let isValid = true;

      if (!this.newDO.nim.match(/^[0-9]{9,}$/)) {
        this.errors.nim = "NIM harus berisi minimal 9 digit angka";
        isValid = false;
      }

      if (this.newDO.nama.length < 3) {
        this.errors.nama = "Nama minimal 3 karakter";
        isValid = false;
      }

      if (!this.selectedPaket) {
        alert("Pilih paket bahan ajar terlebih dahulu!");
        isValid = false;
      }

      if (!this.newDO.ekspedisi) {
        alert("Pilih ekspedisi terlebih dahulu!");
        isValid = false;
      }

      return isValid;
    },

    createDO() {
      if (!this.validateForm()) {
        return;
      }

      const noDO = this.generatedDoNumber;

      const newTrackingData = {
        nim: this.newDO.nim,
        nama: this.newDO.nama,
        status: "Diproses",
        ekspedisi: `JNE ${this.newDO.ekspedisi}`,
        tanggalKirim: this.newDO.tanggalKirim,
        paket: this.selectedPaket,
        total: this.totalHarga,
        perjalanan: [
          {
            waktu: this.getCurrentDateTime(),
            keterangan: `DO dibuat - Menunggu pengambilan paket ${this.selectedPaket}`,
          },
        ],
      };

      this.$emit("create-do", { noDO, data: newTrackingData });
      this.doCounter++;

      alert(`Delivery Order ${noDO} berhasil dibuat!`);
      this.resetForm();
    },

    getCurrentDateTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },

    addProgress(noDO) {
      const keterangan = this.progressInput[noDO];
      if (!keterangan || keterangan.trim() === "") {
        alert("Masukkan keterangan progress terlebih dahulu!");
        return;
      }

      const progressData = {
        waktu: this.getCurrentDateTime(),
        keterangan: keterangan,
      };

      this.$emit("add-progress", { noDO, progress: progressData });
      this.$set(this.progressInput, noDO, "");

      alert("Progress berhasil ditambahkan!");
    },

    resetForm() {
      this.newDO = {
        nim: "",
        nama: "",
        ekspedisi: "",
        tanggalKirim: this.getTodayDate(),
      };
      this.selectedPaket = "";
      this.errors = {};
    },
  },

  filters: {
    currency(value) {
      if (!value) return "Rp 0";
      return "Rp " + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },

    formatDate(dateString) {
      if (!dateString) return "";

      const months = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];

      const date = new Date(dateString);
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();

      return `${day} ${month} ${year}`;
    },
  },

  mounted() {
    this.newDO.tanggalKirim = this.getTodayDate();
    // Initialize progress inputs for existing DOs
    Object.keys(this.trackingData).forEach((noDO) => {
      this.$set(this.progressInput, noDO, "");
    });
  },
});
