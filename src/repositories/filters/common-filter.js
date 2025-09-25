import { Op } from "sequelize";
import sequelizeInstance from "../../configs/sequelize-instance.js";

export function commonFilterReport({ faskesUuid, args = {}, options = {} }) {
    const filter = {
        faskesUuid,
        [Op.or]: [
                //* Filter No Rm Layanan
            {no_rm: { [Op.iLike]: `%${args.q || ""}%` }},
                //* Filter Nama dan Title patient
            sequelizeInstance.where(sequelizeInstance.fn("concat", sequelizeInstance.col("patient.title"), " ", sequelizeInstance.col("patient.name")), { [Op.iLike]: `%${args.q || ""}%` }),
                //* Filter Alamat
            sequelizeInstance.where(sequelizeInstance.col("patient.address.full_address"), { [Op.iLike]: `%${args.q || ""}%` }),
                //* Filter No Rm Patient
            sequelizeInstance.where(sequelizeInstance.col("patient.no_rm"), { [Op.iLike]: `%${args.q || ""}%` }),
            ],
        ...options
    }

    if (args.dokter) filter.practitionerUuid = args.dokter;

    return filter;
}

export function cancelReportFilter({faskesUuid, args = {}, options = {}}) {
    const filter = commonFilterReport({
        faskesUuid,
        args,
        options: {
            ...options,
            deletedAt: {
                [Op.between]: [args.start_date, args.end_date],
            },
            statusRi: 0
        }
    });
    
    return filter;
}