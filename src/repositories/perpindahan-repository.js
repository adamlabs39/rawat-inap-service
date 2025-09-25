import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constants/context-constant.js";
import NotfoundException from "../exceptions/notfound-exception.js";
import {
    RawatInapModel,
    PerpindahanModel
} from "@adameds/model-sdk/pelayanan";
import {
    RoomMonitoringModel,
    PatientModel,
    BirthDetailModel
} from "@adameds/model-sdk/admisi";
import {
    AddressModel
} from "@adameds/model-sdk/setting";
import {
    PractitionerModel,
    PegawaiModel,
    LokasiModel
} from "@adameds/model-sdk/datamaster";

import moment from "moment";
import sequelizeInstace from "../configs/sequelize-instance.js";
import BadRequestException from "../exceptions/bad-request-exception.js";
import {Op} from "sequelize";
import Pagination from "../helpers/pagination.js";
import sequelizeInstance from "../configs/sequelize-instance.js";
export default class PerpindahanRepository {
    static async GetCurrentBed(uuid) {
        try {
            const { faskesUuid } = Context.get(CTX_AUTHOR);

            const bed = await RawatInapModel.findOne({
                where: {
                    uuid,
                    faskesUuid
                },
                include: [
                    {
                        model: RoomMonitoringModel,
                        as: "monitoring_room",
                        attributes: [
                            ["uuid", "monitoring_room_uuid"],
                            "room_uuid",
                            "room_category",
                            "room_class",
                            "room",
                            "bed_name",
                            "no_bed"
                        ]
                    }
                ],
                attributes: []
            });

            if(!bed) throw new NotfoundException("Data tidak ditemukan!");

            return bed.monitoring_room;
        }catch (error) {
            throw error;
        }
    }


    static async RequestMoveBed(uuid, request) {
        try{
            const { faskesUuid, name } = Context.get(CTX_AUTHOR);
            const currentBed = await this.GetCurrentBed(uuid);
            if(!currentBed) throw new NotfoundException("Data tidak ditemukan!");
            // check bed if empty
            const checkBed = await RoomMonitoringModel.findOne({
                where: {
                    uuid: request.destination_monitoring_room_uuid,
                    faskesUuid,
                    deletedAt: null
                }
            });

            if(!checkBed) throw new NotfoundException("Data Bed tidak ditemukan!");
            if(checkBed.patientUuid) throw new BadRequestException("Bed sudah terisi!");

            console.log(currentBed);
            const result = await PerpindahanModel.create({
                faskesUuid,
                petugas: name,
                admissionRiUuid: uuid,
                originMonitoringRoomUuid: currentBed.get("monitoring_room_uuid"),
                destinationMonitoringRoomUuid: request.destination_monitoring_room_uuid,
                waktuPindah: moment().unix(),
                keterangan: request.keterangan,
                statusPindah: "pending"
            })

            if(!result) throw new Error("Gagal melakukan perpindahan!");

            return result;
        }catch (error) {
            throw error;
        }
    }

    static async GetAll(args){
        try{
            const { faskesUuid } = Context.get(CTX_AUTHOR);
            const filter = {
                faskesUuid,
                [Op.or]: [
                    {
                        '$rawat_inap.no_rm$': { [Op.iLike]: `%${args.q || ''}%` }
                    },
                    sequelizeInstance.where(
                        sequelizeInstance.fn('concat', sequelizeInstance.col('rawat_inap.patient.title'), ' ', sequelizeInstance.col('rawat_inap.patient.name')),
                        { [Op.iLike]: `%${args.q || ''}%` }
                    ),
                    sequelizeInstance.where(
                        sequelizeInstance.col('rawat_inap.patient.address.full_address'),
                        { [Op.iLike]: `%${args.q || ''}%` }
                    )
                ],
                status_pindah: "pending"
            };


            if (args.dpjp) {
                filter['$rawat_inap.practitioner.uuid$'] = args.dpjp;
            }

            const options = {
                include: [
                    {
                        model: RawatInapModel,
                        as: "rawat_inap",
                        required: true,
                        where: { deletedAt: { [Op.is]: null } },
                        attributes: [
                            "uuid", "no_reg", "no_rm", "tanggal_daftar", "tanggal_daftar", "tanggal_dirawat", "payment_method"
                        ],
                        include: [
                            {
                                model: PatientModel,
                                as: "patient",
                                required: true,
                                where: { deletedAt: { [Op.is]: null } },
                                include: [
                                    {
                                        model: AddressModel,
                                        as: "address",
                                        required: true,
                                        where: {
                                            deletedAt: {[Op.is]: null}
                                        },
                                        attributes: [
                                            "prov", "city", "district", "rt", "rw", "full_address", "country", "village"
                                        ],
                                    },
                                ],
                                attributes: [
                                    "uuid", "title", "name", "identity", "no_identity", "phone", "gender"
                                ]
                            },
                            {
                                model: BirthDetailModel,
                                as: "birth_detail",
                                required: true,
                                where: {deletedAt: {[Op.is]: null}},
                                attributes: [
                                    'age_year', 'age_month', 'age_day'
                                ]
                            },
                            {
                                model: PractitionerModel,
                                as: "practitioner",
                                required: true,
                                where: {deletedAt: {[Op.is]: null}},
                                attributes: ["uuid"],
                                include: [
                                    {
                                        model: PegawaiModel,
                                        as: "pegawai",
                                        required: true,
                                        where: {deletedAt: {[Op.is]: null}},
                                        attributes: ["first_title", "last_title", "name", "gender"]
                                    }
                                ]
                            },
                            {
                                model: RoomMonitoringModel,
                                as: "monitoring_room",
                                required: true,
                                where: { deletedAt: { [Op.is]: null } },
                                attributes: ["uuid", "room_uuid", "no_bed"],
                                include: [
                                    {
                                        model: LokasiModel,
                                        as: "bed_lokasi",
                                        required: true,
                                        where: { deletedAt: { [Op.is]: null } },
                                        attributes: ["uuid", "code", "name", "class_code", "class_name"],
                                    },
                                    {
                                        model: LokasiModel,
                                        as: "room",
                                        required: true,
                                        where: { deletedAt: { [Op.is]: null } },
                                        attributes: ["uuid", "code", "name", "class_code", "class_name"],
                                    }
                                ]
                            },
                        ]
                    },
                    {
                        model: RoomMonitoringModel,
                        as: "origin_monitoring_room",
                        attributes: ["uuid", "room_uuid", "no_bed"],
                        include: [
                            {
                                model: LokasiModel,
                                as: "bed_lokasi",
                                required: true,
                                where: { deletedAt: { [Op.is]: null } },
                                attributes: ["uuid", "code", "name", "class_code", "class_name"],
                            },
                            {
                                model: LokasiModel,
                                as: "room",
                                required: true,
                                where: { deletedAt: { [Op.is]: null } },
                                attributes: ["uuid", "code", "name", "class_code", "class_name"],
                            }
                        ]
                    },
                    {
                        model: RoomMonitoringModel,
                        as: "destination_monitoring_room",
                        attributes: ["uuid", "room_uuid", "no_bed"],
                        include: [
                            {
                                model: LokasiModel,
                                as: "bed_lokasi",
                                required: true,
                                where: { deletedAt: { [Op.is]: null } },
                                attributes: ["uuid", "code", "name", "class_code", "class_name"],
                            },
                            {
                                model: LokasiModel,
                                as: "room",
                                required: true,
                                where: { deletedAt: { [Op.is]: null } },
                                attributes: ["uuid", "code", "name", "class_code", "class_name"],
                            }
                        ]
                    }
                ],
                attributes: [
                    "uuid", "petugas", "waktu_pindah", "keterangan"
                ]
            }

            return await Pagination.init(
                PerpindahanModel,
                args,
                filter,
                options,
            )
        }catch (error) {
            throw error;
        }
    }

    static async ApproveMoveBed(uuid) {
        try{
            const { faskesUuid } = Context.get(CTX_AUTHOR);
            return sequelizeInstace.transaction(async (t) => {
                const perpindahan = await PerpindahanModel.findOne({
                    where: {
                        uuid,
                        faskesUuid
                    }
                });

                if(!perpindahan) throw new NotfoundException("Data tidak ditemukan!");
                const result = await perpindahan.update({
                    statusPindah: "approve"
                }, { transaction: t });

                if(!result) throw new Error("Gagal melakukan persetujuan perpindahan!");

                const currentBed = await RawatInapModel.findOne({
                    where: {
                        uuid: perpindahan.admissionRiUuid,
                        faskesUuid
                    }
                });

                if(!currentBed) throw new NotfoundException("Data tidak ditemukan!");

                // Update Rawat Inap Bed
                const resultUpdate = await currentBed.update({
                    monitoringRoomUuid: perpindahan.destinationMonitoringRoomUuid
                }, { transaction: t });

                if(!resultUpdate) throw new Error("Gagal melakukan perubahan data!");

                // Check If Bed Occupied
                const checkBed = await RoomMonitoringModel.findOne({
                    where: {
                        uuid: perpindahan.destinationMonitoringRoomUuid,
                        faskesUuid,
                        deletedAt: null
                    }
                });

                if(!checkBed) throw new NotfoundException("Data Bed tidak ditemukan!");
                if(checkBed.patientUuid) throw new BadRequestException("Bed sudah terisi!");

                // Update Bed Occupied
                const resultUpdateBed = await checkBed.update({
                    patientUuid: currentBed.patientUuid
                }, { transaction: t });


                if(!resultUpdateBed) throw new Error("Gagal melakukan perubahan data!");

                return result;
            });
        }catch (error) {
            throw error;
        }
    }


    static async RejectMoveBed(uuid) {
        try{
            const { faskesUuid } = Context.get(CTX_AUTHOR);
            return sequelizeInstace.transaction(async (t) => {
                const perpindahan = await PerpindahanModel.findOne({
                    where: {
                        uuid,
                        faskesUuid
                    }
                });

                if(!perpindahan) throw new NotfoundException("Data tidak ditemukan!");
                // Update Approval Status
                const result = await perpindahan.update({
                    statusPindah: "reject"
                }, { transaction: t });

                if(!result) throw new Error("Gagal melakukan persetujuan perpindahan!");

                return result;
            });
        }catch (error) {
            throw error;
        }
    }

    static async GetHistoryBed(uuid) {
        try{
            const { faskesUuid } = Context.get(CTX_AUTHOR);
            return PerpindahanModel.findAll({
                where: {
                    admissionRiUuid: uuid,
                    faskesUuid,
                    statusPindah: "approve"
                },
                include: [
                    {
                        model: RoomMonitoringModel,
                        as: "origin_monitoring_room",
                        attributes: [
                            ["uuid", "monitoring_room_uuid"],
                            "room_uuid",
                            "room_category",
                            "room_class",
                            "room",
                            "bed_name",
                            "no_bed"
                        ]
                    },
                    {
                        model: RoomMonitoringModel,
                        as: "destination_monitoring_room",
                        attributes: [
                            ["uuid", "monitoring_room_uuid"],
                            "room_uuid",
                            "room_category",
                            "room_class",
                            "room",
                            "bed_name",
                            "no_bed"
                        ]
                    }
                ],
                attributes: [
                    "uuid",
                    "petugas",
                    "waktu_pindah",
                    "keterangan",
                ]
            });
        }catch (error) {
            throw error;
        }
    }


    static async GetDetailRequest(uuid) {
        try{
            const { faskesUuid } = Context.get(CTX_AUTHOR);
            return PerpindahanModel.findOne({
                where: {
                    uuid,
                    faskesUuid
                },
                include: [
                    {
                        model: RoomMonitoringModel,
                        as: "origin_monitoring_room",
                        attributes: [
                            ["uuid", "monitoring_room_uuid"],
                            "room_uuid",
                            "room_category",
                            "room_class",
                            "room",
                            "bed_name",
                            "no_bed"
                        ]
                    },
                    {
                        model: RoomMonitoringModel,
                        as: "destination_monitoring_room",
                        attributes: [
                            ["uuid", "monitoring_room_uuid"],
                            "room_uuid",
                            "room_category",
                            "room_class",
                            "room",
                            "bed_name",
                            "no_bed"
                        ]
                    }
                ],
                attributes: [
                    "uuid",
                    "petugas",
                    "waktu_pindah",
                    "keterangan",
                    "status_pindah"
                ]
            });
        }catch (error) {
            throw error;
        }
    }


    static async CountPendingRequest() {
        try{
            const { faskesUuid } = Context.get(CTX_AUTHOR);
            return PerpindahanModel.count({
                where: {
                    faskesUuid,
                    statusPindah: "pending"
                },
            });
        }catch (error) {
            throw error;
        }
    }
}