import { DataSource } from "../../src/data-source";

declare global {
  namespace Express {
    interface Request {
      dataSource: DataSource;
      userId: string;
    }
  }
}