import { RawatInapModel } from "@adameds/model-sdk/pelayanan";
import Pagination from "../helpers/pagination.js";
import { kunjunganReportInclude } from "./include/report-include.js";
import { cancelReportFilter, commonFilterReport } from "./filters/common-filter.js";
import { Context } from "../middlewares/context.js";
import { CTX_AUTHOR } from "../constants/context-constant.js";
import { Op } from "sequelize";

export default class ReportRepository {
    static async getAllKunjungan(args) {
        const { faskesUuid } = Context.get(CTX_AUTHOR);
            try {
                const filter = commonFilterReport({ faskesUuid, args, options: { discharge_date: { [Op.between]: [args.start_date, args.end_date] } } });

                const options = {
                include: kunjunganReportInclude,
                attributes: ["no_reg", "no_pelayanan", "tanggal_daftar", "discharge_date", "kondisi_pasien_pulang", "status_pulang"],

                };

                return await Pagination.init(RawatInapModel, args, filter, options);
            } catch (error) {
                console.log("Error on LogPelayananRepository");
                throw error;
            }
    }

    static async getCancelKunjungan(args) {
        const { faskesUuid } = Context.get(CTX_AUTHOR);
            try {
                const filter = cancelReportFilter({ faskesUuid, args, options: {} });

                const options = {
                    include: kunjunganReportInclude,
                    attributes: ["no_reg", "no_pelayanan", "petugas", "alasan_batal", "deletedAt"],
                };

                return await Pagination.init(RawatInapModel, args, filter, options);
            } catch (error) {
                console.log("Error on LogPelayananRepository");
                throw error;
            }
    }
}