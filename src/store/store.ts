import Dexie from "dexie";

interface IAnnotation {
  id: number;
  area: number;
  category_id: number;
  image_id: number;
  iscrowd: number;
  segmentation: Array<number>;
  bbox: Array<number>;
  score?: number;
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
  annotations: Array<IAnnotation>;
  annotationsArea: number;
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
      annotations: "id, image_id, area, category_id",
      categories: "id, supercategory",
      images: "id, annotationsArea",
      licenses: "id",
    });
    this.annotations = this.table("annotations");
    this.categories = this.table("categories");
    this.images = this.table("images");
    this.licenses = this.table("licenses");
    this.images.mapToClass(Image);
  }
}

export class Image implements IImage {
  id: number;
  file_name: string;
  height: number;
  width: number;
  annotations: Array<IAnnotation>;
  annotationsArea: number;
  constructor(
    id: number,
    file_name: string,
    height: number,
    width: number,
    annotations: Array<IAnnotation>,
    annotationsArea: number
  ) {
    this.id = id;
    this.file_name = file_name;
    this.height = height;
    this.width = width;
    this.annotations = annotations;
    this.annotationsArea = annotationsArea;
  }
}

export let database = new DatasetDatabase();

async function orderAnnotationsByArea(
  descending: boolean,
  limit: number,
  offset?: number
) {
  if (offset === undefined) {
    if (descending) {
      return database.annotations
        .orderBy("area")
        .reverse()
        .limit(limit)
        .toArray();
    }
    return database.annotations
      .orderBy("area")
      .limit(limit)
      .toArray();
  } else {
    if (descending) {
      return database.annotations
        .where("area")
        .below(offset)
        .reverse()
        .limit(limit)
        .toArray();
    }
    return database.annotations
      .where("area")
      .above(offset)
      .limit(limit)
      .toArray();
  }
}

async function getImagesFromOrderedAnnotations(
  descending: boolean,
  limit: number,
  offset?: IImage
) {
  let annotations = [];
  if (offset === undefined) {
    annotations = await orderAnnotationsByArea(descending, limit);
  } else {
    let annotationOffset: number;
    if (descending) {
      annotationOffset = Math.max(
        ...offset.annotations.map((item) => item.area),
        0
      );
    } else {
      annotationOffset = Math.min(
        ...offset.annotations.map((item) => item.area),
        0
      );
    }
    annotations = await orderAnnotationsByArea(
      descending,
      limit,
      annotationOffset
    );
  }
  let images = [];
  for (let i = 0; i < annotations.length; i++) {
    images.push(await database.images.get(annotations[i].image_id));
  }
  return images;
}

async function getImagesOrderedByAnnotationsArea(
  descending: boolean,
  limit: number,
  offset?: IImage
) {
  if (offset === undefined) {
    if (descending) {
      return database.images
        .orderBy("annotationsArea")
        .reverse()
        .limit(limit)
        .toArray();
    }
    return database.images
      .orderBy("annotationsArea")
      .limit(limit)
      .toArray();
  } else {
    if (descending) {
      return database.images
        .where("annotationsArea")
        .below(offset.annotationsArea)
        .reverse()
        .limit(limit)
        .toArray();
    }
    return database.images
      .where("annotationsArea")
      .above(offset.annotationsArea)
      .limit(limit)
      .toArray();
  }
}

export function loadImagesOrderedBySelectedCritera(
  sortBy: number,
  descending: boolean,
  pageSize: number,
  offset?: IImage
) {
  switch (sortBy) {
    case 0:
      return getImagesFromOrderedAnnotations(descending, pageSize, offset);
    case 1:
      return getImagesOrderedByAnnotationsArea(descending, pageSize, offset);
    case 3:
      break;
    case 4:
      break;
    default:
      break;
  }
}
