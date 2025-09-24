import ReportRepository from "../repositories/report-repository.js";

export default class ReportService {

    static async getAllKunjungan(args) {
        return await ReportRepository.getAllKunjungan(args);
    }

    static async getCancelKunjungan(args) {
        return await ReportRepository.getCancelKunjungan(args);
    }

}