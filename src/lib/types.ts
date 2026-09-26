export type Admin = { id: string; name: string; email: string };

export type RouteStop = { place: string; nights: number };
export type ItineraryDay = { title: string; text: string };

export type Package = {
  _id: string;
  title: string;
  slug: string;
  destination: string;
  nights: number;
  days: number;
  summary: string;
  description: string;
  route: RouteStop[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  price: number;
  coverImage: string;
  gallery: string[];
  featured: boolean;
  published: boolean;
  order: number;
  updatedAt: string;
};

export type PackageInput = Omit<Package, "_id" | "updatedAt">;

export type Destination = {
  _id: string;
  title: string;
  text: string;
  image: string;
  link: string;
  order: number;
  published: boolean;
};

export type DestinationInput = Omit<Destination, "_id">;

export type Media = {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  alt: string;
  createdAt: string;
};

export type EnquiryStatus = "new" | "contacted" | "closed";

export type Enquiry = {
  _id: string;
  fullName: string;
  phone: string;
  travelDate: string;
  destination: string;
  budget: string;
  travelers: number;
  notes: string;
  status: EnquiryStatus;
  adminNotes: string;
  createdAt: string;
};
