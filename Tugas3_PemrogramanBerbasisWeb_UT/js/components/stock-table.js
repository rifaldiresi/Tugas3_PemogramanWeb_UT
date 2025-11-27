// Stock Table Component
Vue.component("ba-stock-table", {
  template: `
    <div>
      <h2>📦 Manajemen Stok Bahan Ajar</h2>
      
      <!-- Filters -->
      <div class="filters">
        <h3>🔍 Filter & Sorting</h3>
        
        <div class="filter-group">
          <label>UT-Daerah:</label>
          <select v-model="selectedUpbjj">
            <option value="">Semua UT-Daerah</option>
            <option v-for="upbjj in upbjjList" :key="upbjj" :value="upbjj">
              {{ upbjj }}
            </option>
          </select>
        </div>
        
        <div class="filter-group" v-if="selectedUpbjj">
          <label>Kategori MK:</label>
          <select v-model="selectedKategori">
            <option value="">Semua Kategori</option>
            <option v-for="kat in kategoriList" :key="kat" :value="kat">
              {{ kat }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>
            <input type="checkbox" v-model="filterMenipis">
            Tampilkan hanya stok menipis/kosong
          </label>
        </div>
        
        <div class="filter-group">
          <label>Urutkan:</label>
          <select v-model="sortBy">
            <option value="">Tidak ada urutan</option>
            <option value="judul">Judul (A-Z)</option>
            <option value="judul-desc">Judul (Z-A)</option>
            <option value="qty">Stock (Terendah)</option>
            <option value="qty-desc">Stock (Tertinggi)</option>
            <option value="harga">Harga (Termurah)</option>
            <option value="harga-desc">Harga (Termahal)</option>
          </select>
        </div>
        
        <button class="btn btn-secondary" @click="resetFilter">Reset Filter</button>
        <button class="btn btn-success" @click="toggleAddForm">
          {{ showAddForm ? 'Tutup Form' : '+ Tambah Data Baru' }}
        </button>
      </div>
      
      <!-- Add/Edit Form -->
      <div class="form-container" v-show="showAddForm || editingItem">
        <h3>{{ editingItem ? 'Edit Data Bahan Ajar' : 'Tambah Data Bahan Ajar Baru' }}</h3>
        <form @submit.prevent="saveData" @keydown.enter.prevent="saveData" @keydown.esc.prevent="cancelForm">
          <div class="form-group">
            <label>Kode Mata Kuliah: *</label>
            <input type="text" v-model="formData.kode" required :disabled="editingItem !== null">
            <span class="error" v-if="errors.kode">{{ errors.kode }}</span>
          </div>
          
          <div class="form-group">
            <label>Judul Mata Kuliah: *</label>
            <input type="text" v-model="formData.judul" required>
            <span class="error" v-if="errors.judul">{{ errors.judul }}</span>
          </div>
          
          <div class="form-group">
            <label>Kategori: *</label>
            <select v-model="formData.kategori" required>
              <option value="">Pilih Kategori</option>
              <option v-for="kat in kategoriList" :key="kat" :value="kat">{{ kat }}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>UT-Daerah: *</label>
            <select v-model="formData.upbjj" required>
              <option value="">Pilih UT-Daerah</option>
              <option v-for="upbjj in upbjjList" :key="upbjj" :value="upbjj">{{ upbjj }}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Lokasi Rak: *</label>
            <input type="text" v-model="formData.lokasiRak" required>
          </div>
          
          <div class="form-group">
            <label>Harga: *</label>
            <input type="number" v-model.number="formData.harga" required min="0">
            <span class="error" v-if="errors.harga">{{ errors.harga }}</span>
          </div>
          
          <div class="form-group">
            <label>Jumlah Stok: *</label>
            <input type="number" v-model.number="formData.qty" required min="0">
          </div>
          
          <div class="form-group">
            <label>Safety Stock: *</label>
            <input type="number" v-model.number="formData.safety" required min="0">
          </div>
          
          <div class="form-group">
            <label>Catatan (HTML):</label>
            <textarea v-model="formData.catatanHTML"></textarea>
          </div>
          
          <div style="margin-top: 20px;">
            <button type="submit" class="btn btn-success">
              {{ editingItem ? 'Update Data' : 'Simpan Data' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="cancelForm">Batal</button>
            <small style="color: #666; margin-left: 10px;">
              💡 Tips: Tekan Enter untuk simpan, Esc untuk batal
            </small>
          </div>
        </form>
      </div>
      
      <!-- Summary -->
      <div class="summary-box">
        <div><strong>Total Data:</strong> {{ filteredStok.length }} item</div>
        <div><strong>Stok Menipis:</strong> {{ countMenipis }} item</div>
        <div><strong>Stok Kosong:</strong> {{ countKosong }} item</div>
      </div>
      
      <!-- Table -->
      <div style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th @click="sortTable('kode')">Kode MK</th>
              <th @click="sortTable('judul')">Nama MK</th>
              <th>Kategori</th>
              <th>UT-Daerah</th>
              <th>Lokasi Rak</th>
              <th @click="sortTable('harga')">Harga</th>
              <th @click="sortTable('qty')">Stok</th>
              <th>Safety Stock</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in filteredStok" :key="item.kode">
              <td>{{ index + 1 }}</td>
              <td>{{ item.kode }}</td>
              <td>{{ item.judul }}</td>
              <td>{{ item.kategori }}</td>
              <td>{{ item.upbjj }}</td>
              <td>{{ item.lokasiRak }}</td>
              <td>{{ item.harga | currency }}</td>
              <td>{{ item.qty | quantity }}</td>
              <td>{{ item.safety | quantity }}</td>
              <td>
                <status-badge 
                  :qty="item.qty" 
                  :safety="item.safety"
                  :catatan="item.catatanHTML">
                </status-badge>
              </td>
              <td>
                <button class="btn btn-warning btn-small" @click="editItem(item)">
                  ✏️ Edit
                </button>
                <button class="btn btn-danger btn-small" @click="confirmDelete(item)">
                  🗑️ Hapus
                </button>
              </td>
            </tr>
            
            <tr v-if="filteredStok.length === 0">
              <td colspan="11" style="text-align: center; padding: 40px; color: #999;">
                Tidak ada data yang sesuai dengan filter
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Delete Confirmation Modal -->
      <app-modal 
        :show="showDeleteModal"
        title="Konfirmasi Hapus Data"
        confirm-text="Ya, Hapus"
        @close="showDeleteModal = false"
        @confirm="deleteItem">
        <p>Apakah Anda yakin ingin menghapus data bahan ajar ini?</p>
        <div v-if="itemToDelete" style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px;">
          <p><strong>Kode:</strong> {{ itemToDelete.kode }}</p>
          <p><strong>Judul:</strong> {{ itemToDelete.judul }}</p>
          <p><strong>Stok:</strong> {{ itemToDelete.qty }} buah</p>
        </div>
      </app-modal>
    </div>
  `,

  props: {
    stokData: {
      type: Array,
      required: true,
    },
    upbjjList: {
      type: Array,
      required: true,
    },
    kategoriList: {
      type: Array,
      required: true,
    },
  },

  data() {
    return {
      selectedUpbjj: "",
      selectedKategori: "",
      filterMenipis: false,
      sortBy: "",
      showAddForm: false,
      editingItem: null,
      formData: this.getEmptyForm(),
      errors: {},
      showDeleteModal: false,
      itemToDelete: null,
    };
  },

  computed: {
    filteredStok() {
      let result = this.stokData;

      if (this.selectedUpbjj) {
        result = result.filter((item) => item.upbjj === this.selectedUpbjj);
      }

      if (this.selectedKategori) {
        result = result.filter(
          (item) => item.kategori === this.selectedKategori
        );
      }

      if (this.filterMenipis) {
        result = result.filter(
          (item) => item.qty < item.safety || item.qty === 0
        );
      }

      if (this.sortBy) {
        result = [...result];

        switch (this.sortBy) {
          case "judul":
            result.sort((a, b) => a.judul.localeCompare(b.judul));
            break;
          case "judul-desc":
            result.sort((a, b) => b.judul.localeCompare(a.judul));
            break;
          case "qty":
            result.sort((a, b) => a.qty - b.qty);
            break;
          case "qty-desc":
            result.sort((a, b) => b.qty - a.qty);
            break;
          case "harga":
            result.sort((a, b) => a.harga - b.harga);
            break;
          case "harga-desc":
            result.sort((a, b) => b.harga - a.harga);
            break;
        }
      }

      return result;
    },

    countMenipis() {
      return this.stokData.filter(
        (item) => item.qty < item.safety && item.qty > 0
      ).length;
    },

    countKosong() {
      return this.stokData.filter((item) => item.qty === 0).length;
    },
  },

  watch: {
    selectedUpbjj(newVal, oldVal) {
      if (oldVal && newVal !== oldVal) {
        this.selectedKategori = "";
      }
      console.log(`UT-Daerah berubah dari "${oldVal}" ke "${newVal}"`);
    },

    filterMenipis(newVal) {
      if (newVal) {
        console.log(
          `Filter menipis aktif. Ditemukan ${
            this.countMenipis + this.countKosong
          } item yang perlu di-reorder`
        );
      }
    },
  },

  methods: {
    getEmptyForm() {
      return {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: 0,
        qty: 0,
        safety: 0,
        catatanHTML: "",
      };
    },

    resetFilter() {
      this.selectedUpbjj = "";
      this.selectedKategori = "";
      this.filterMenipis = false;
      this.sortBy = "";
    },

    sortTable(field) {
      if (this.sortBy === field) {
        this.sortBy = field + "-desc";
      } else if (this.sortBy === field + "-desc") {
        this.sortBy = "";
      } else {
        this.sortBy = field;
      }
    },

    toggleAddForm() {
      this.showAddForm = !this.showAddForm;
      if (!this.showAddForm) {
        this.cancelForm();
      }
    },

    editItem(item) {
      this.editingItem = item;
      this.formData = { ...item };
      this.showAddForm = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    validateForm() {
      this.errors = {};
      let isValid = true;

      if (!this.editingItem && !this.formData.kode.match(/^[A-Z0-9]+$/)) {
        this.errors.kode = "Kode harus huruf kapital dan angka tanpa spasi";
        isValid = false;
      }

      if (this.formData.judul.length < 3) {
        this.errors.judul = "Judul minimal 3 karakter";
        isValid = false;
      }

      if (this.formData.harga <= 0) {
        this.errors.harga = "Harga harus lebih dari 0";
        isValid = false;
      }

      if (
        !this.editingItem &&
        this.stokData.find((item) => item.kode === this.formData.kode)
      ) {
        this.errors.kode = "Kode mata kuliah sudah ada";
        isValid = false;
      }

      return isValid;
    },

    saveData() {
      if (!this.validateForm()) {
        alert("Mohon perbaiki error pada form!");
        return;
      }

      if (this.editingItem) {
        this.$emit("update-stok", this.formData);
        alert("Data berhasil diupdate!");
      } else {
        const newData = { ...this.formData };
        this.stokData.push(newData);
        alert("Data berhasil ditambahkan!");
      }

      this.cancelForm();
    },

    cancelForm() {
      this.showAddForm = false;
      this.editingItem = null;
      this.formData = this.getEmptyForm();
      this.errors = {};
    },

    confirmDelete(item) {
      this.itemToDelete = item;
      this.showDeleteModal = true;
    },

    deleteItem() {
      if (this.itemToDelete) {
        this.$emit("delete-stok", this.itemToDelete.kode);
        this.showDeleteModal = false;
        this.itemToDelete = null;
        alert("Data berhasil dihapus!");
      }
    },
  },

  filters: {
    currency(value) {
      if (!value) return "Rp 0";
      return "Rp " + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },
    quantity(value) {
      return value + " buah";
    },
  },
});
