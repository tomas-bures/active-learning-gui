import Dexie from "dexie";

interface IAnnotation {
  id: number;
  area: number;
  category_id: number;
  image_id: number;
  iscrowd: number;
  segmentation: Array<number>;
  bbox: Array<number>;
  bbox_area: number;
}
interface ICategory {
  id: number;
  name: string;
  supercategory: string;
}
interface IImage {
  id: number;
  coco_url?: string;
  date_captured?: string;
  file_name: string;
  flickr_url?: string;
  height: number;
  width: number;
  licence?: number;
}
interface ILicenses {
  id: number;
  name: string;
  url: string;
}

export class DatasetDatabase extends Dexie {
  annotations: Dexie.Table<IAnnotation, number>;
  categories: Dexie.Table<ICategory, number>;
  images: Dexie.Table<Image, number>;
  licenses: Dexie.Table<ILicenses, number>;

  constructor() {
    super("DatasetDatabase");
    this.version(1).stores({
      annotations: "id, image_id, area, category_id, bbox_area",
      categories: "id, supercategory",
      images: "id, file_name",
      licenses: "id"
    });
    this.annotations = this.table("annotations");
    this.categories = this.table("categories");
    this.images = this.table("images");
    this.licenses = this.table("licenses");
    this.images.mapToClass(Image);
    this.annotations.mapToClass(Annotation);
  }
}

export class Image implements IImage {
  id: number;
  file_name: string;
  height: number;
  width: number;
  annotations: Annotation[] | undefined;
  constructor(id: number, file_name: string, height: number, width: number) {
    this.id = id;
    this.file_name = file_name;
    this.height = height;
    this.width = width;
  }

  async loadAnnotations() {
    this.annotations = await database.annotations
      .where("image_id")
      .equals(this.id)
      .toArray();
  }
}

export class Annotation implements IAnnotation {
  id: number;
  area: number;
  category_id: number;
  image_id: number;
  iscrowd: number;
  segmentation: Array<number>;
  bbox: Array<number>;
  bbox_area: number;
  constructor(
    id: number,
    area: number,
    category_id: number,
    image_id: number,
    isCrowd: number,
    segmentation: Array<number>,
    bbox: Array<number>
  ) {
    this.id = id;
    this.area = area;
    this.category_id = category_id;
    this.image_id = image_id;
    this.iscrowd = isCrowd;
    this.segmentation = segmentation;
    this.bbox = bbox;
    this.bbox_area = this.bbox.slice(-2).reduce((side, mul) => side * mul);
  }
}

export let database = new DatasetDatabase();
