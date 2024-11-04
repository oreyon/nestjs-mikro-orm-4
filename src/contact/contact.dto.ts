export class CreateContactRequest {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export class CreateContactResponse {
  id: number;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export class GetContactResponse {
  id: number;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export class UpdateContactReq {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export class UpdateContactRes {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export class SearchContactReq {
  username?: string;
  email?: string;
  phone?: string;
  page: number;
  size: number;
}

export class SearchContactRes {
  id: number;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
}
