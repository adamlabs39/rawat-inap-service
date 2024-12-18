import {
    AddressModel,
} from "@adameds/model-sdk/setting";

import {
    BirthDetailModel,
    PatientModel,
} from "@adameds/model-sdk/admisi";

import {
    PegawaiModel,
    PractitionerModel,
    KategoriRuanganModel,
    LokasiModel,
    FaskesModel,
    RuanganModel
} from "@adameds/model-sdk/datamaster";

import {
    PerpindahanModel,
    RawatInapModel,
    RiwayatRuanganModel
} from "@adameds/model-sdk/pelayanan";

import {
    RoomMonitoringModel,
} from "@adameds/model-sdk/admisi";

const MODELMERGE = [
    AddressModel,
    BirthDetailModel,
    FaskesModel,
    KategoriRuanganModel,
    LokasiModel,
    PatientModel,
    PegawaiModel,
    PractitionerModel,
    PerpindahanModel,
    RawatInapModel,
    RiwayatRuanganModel,
    RoomMonitoringModel,
    RuanganModel,
]
export default MODELMERGE;