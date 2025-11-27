// Main Vue Instance
var app = new Vue({
  el: "#app",

  data: {
    currentTab: "stok",
    upbjjList: [],
    kategoriList: [],
    pengirimanList: [],
    paketList: [],
    stokData: [],
    trackingData: {},
  },

  async mounted() {
    console.log("🚀 Vue App initialized");
    await this.loadData();
  },

  methods: {
    async loadData() {
      try {
        const data = await DataService.fetchData();

        this.upbjjList = data.upbjjList || [];
        this.kategoriList = data.kategoriList || [];
        this.pengirimanList = data.pengirimanList || [];
        this.paketList = data.paket || [];
        this.stokData = data.stok || [];
        this.trackingData = data.tracking || {};

        console.log("✅ Data loaded successfully");
        console.log("📦 Total stok:", this.stokData.length);
        console.log("🚚 Total DO:", Object.keys(this.trackingData).length);
      } catch (error) {
        console.error("❌ Error loading data:", error);
      }
    },

    handleUpdateStok(updatedData) {
      const index = this.stokData.findIndex(
        (item) => item.kode === updatedData.kode
      );
      if (index !== -1) {
        this.$set(this.stokData, index, updatedData);
        console.log("✅ Stok updated:", updatedData.kode);
      }
    },

    handleDeleteStok(kode) {
      const index = this.stokData.findIndex((item) => item.kode === kode);
      if (index !== -1) {
        this.stokData.splice(index, 1);
        console.log("🗑️ Stok deleted:", kode);
      }
    },

    handleCreateDO({ noDO, data }) {
      this.$set(this.trackingData, noDO, data);
      console.log("✅ DO created:", noDO);
    },

    handleAddProgress({ noDO, progress }) {
      if (this.trackingData[noDO] && this.trackingData[noDO].perjalanan) {
        this.trackingData[noDO].perjalanan.push(progress);
        console.log("✅ Progress added to", noDO);
      }
    },
  },
});
