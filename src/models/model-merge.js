import AddressModel from "./address-model.js";
import BirthDetailModel from "./birth-detail-model.js";
import PatientModel from "./patient-model.js";
import PegawaiModel from "./pegawai-model.js";
import PerpindahanModel from "./perpindahan-model.js";
import PractitionerModel from "./practitioner-model.js";
import RawatInapModel from "./rawat-inap-model.js";
import RoomMonitoringModel from "./room-monitoring-model.js";
import KategoriRuanganModel from "./kategori-ruangan-model.js";
import LokasiModel from "./lokasi-model.js";
import FaskesModel from "./faskes-model.js";
import RiwayatRuanganModel from "./riwayat-ruangan-model.js";
import RuanganModel from "./ruangan-model.js";

const MODELMERGE = [
    // AddressModel,
    // BirthDetailModel,
    // FaskesModel,
    // KategoriRuanganModel,
    // LokasiModel,
    // PatientModel,
    // PegawaiModel,
    // PerpindahanModel,
    // PractitionerModel,
    RawatInapModel,
    RiwayatRuanganModel,
    RoomMonitoringModel,
    RuanganModel,
]
export default MODELMERGE;