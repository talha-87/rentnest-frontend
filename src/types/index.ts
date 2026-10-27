export type UserRole = "TENANT" | "LANDLORD" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Property {
  id: string;
  title: string;
  description?: string;
  location: string;
  price: number;
  type?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  image?: string;
  amenities?: string[];
  landlord?: { id?: string; name?: string; email?: string };
  available?: boolean;
}

export type RentalStatus = "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "COMPLETED";

export interface RentalRequest {
  id: string;
  propertyId: string;
  property?: Property;
  tenant?: User;
  status: RentalStatus;
  createdAt?: string;
}

export interface ApiErrorShape {
  message: string;
  status?: number;
}
