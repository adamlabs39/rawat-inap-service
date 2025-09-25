import { BirthDetailModel, PatientModel, RoomMonitoringModel } from "@adameds/model-sdk/admisi";
import { LokasiModel, PegawaiModel, PractitionerModel } from "@adameds/model-sdk/datamaster";
import { AddressModel } from "@adameds/model-sdk/setting";
import { Op } from "sequelize";

export const kunjunganReportInclude = [
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
                deletedAt: { [Op.is]: null },
                },
                attributes: ["full_address"],
            },
            {
                model: BirthDetailModel,
                as: "birth_detail",
                required: false,
                where: { deletedAt: { [Op.is]: null } },
                attributes: ["birth_date", "age_year", "age_month", "age_day"],
            }
        ],
        attributes: ["name", "gender", "no_rm"],
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
        ],
    },
    {
        model: PractitionerModel,
        as: "practitioner",
        required: false,
        where: { deletedAt: { [Op.is]: null } },
        attributes: ["uuid"],
        include: [
            {
                model: PegawaiModel,
                as: "pegawai",
                required: false,
                where: { deletedAt: { [Op.is]: null } },
                attributes: ["uuid", "name"],
            }
        ],
    }
]