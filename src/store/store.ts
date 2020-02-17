import Dexie from "dexie";

interface IAnnotation {
  id: number;
  area: Array<number>;
  category_id: number;
  image_id: number;
  iscrowd: number;
  segmentation: Array<number>;
}
interface ICategory {
  id: number;
  name: string;
  supercategory: string;
}
interface IImage {
  id: number;
  coco_url: string;
  date_captured: string;
  file_name: string;
  flickr_url: string;
  height: number;
  width: number;
  licence: number;
}
interface IInfo {
  url: string;
  contributor: string;
  date_created: string;
  description: string;
  version: string;
  year: number;
}
interface ILicenses {
  id: number;
  name: string;
  url: string;
}

export class DatasetDatabase extends Dexie {
  annotations: Dexie.Table<IAnnotation, number>;
  categories: Dexie.Table<ICategory, number>;
  images: Dexie.Table<IImage, number>;
  infos: Dexie.Table<IInfo, number>;
  licenses: Dexie.Table<ILicenses, number>;

  constructor() {
    super("DatasetDatabase");
    this.version(1).stores({
      annotations: "id, image_id",
      categories: "id, supercategory",
      images: "id, file_name",
      infos: "++id",
      licenses: "id"
    });
    this.annotations = this.table("annotations");
    this.categories = this.table("categories");
    this.images = this.table("images");
    this.infos = this.table("infos");
    this.licenses = this.table("licenses");
  }
}
